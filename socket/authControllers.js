const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const { Roles, Users } = require("../../models");
const AppError = require("../../utils/appError");

exports.authorizeUser = async (socket, next) => {
  let token;
  console.log("auth");
  if (
    socket.handshake.headers.cookie &&
    socket.handshake.headers.cookie.startsWith("token")
  ) {
    token = socket.handshake.headers.cookie.split(";")[0].split("=")[1];
  }
  if (!token) return next(new AppError("You are not logged in", 401));

  const decoded = await promisify(jwt.verify)(token, "adil");

  const freshUser = await Users.findOne({ where: { uuid: [decoded.id] } });
  const freshRole = await Roles.findOne({ where: { uuid: [decoded.id] } });
  if (!freshUser && !freshRole)
    return next(
      new AppError("The user belonging to this token is no longer exists", 401)
    );

  socket.user = freshUser;
  socket.role = freshRole;
  next();
};
