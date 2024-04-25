require("dotenv").config({ path: "./config.env" });
const app = require("./app");
var http = require("http").Server(app);
const { sequelize } = require("./models");
const socketControllers = require("./controllers/socketControllers");
const cors = require("cors");
var io = require("socket.io")(http, {
  cors: { origin: "localhost:3001", credentials: true },
});

const server = http.listen(process.env.PORT, async () => {
  await sequelize.authenticate();
  console.log(
    `Connected to DB and Server is running on port: ${process.env.PORT}..`
  );
});

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

io.use(socketControllers.authorizeUser);
io.on("connect", async function (socket) {
  socketControllers.initializeUser(socket);

  socket.emit("newclientconnect", {
    description: " welcome!",
    user: socket.user,
    role: socket.role,
  });

  socket.on("add-friend", (uuid) => {
    socketControllers.addFriend(socket, uuid);
  });

  socket.on("delete-conversation", (uuid) => {
    if (socket.role) socketControllers.deleteConversation(socket, uuid);
  });

  socket.on("send-message", (message) => {
    socketControllers.dm(socket, message);
  });

  socket.on("delete-message", (uuid) => {
    socketControllers.deleteMessage(socket, uuid);
  });

  socket.on("send-role-message", (uuid, message) => {
    socketControllers.dm(socket, message, uuid);
  });

  socket.on("friend-chat", (uuid) => {
    if (socket.role) socketControllers.getChat(socket, uuid);
  });

  socket.on("friends-pagination", (offset) => {
    if (socket.role) socketControllers.usersPagination(socket, offset);
  });

  socket.on("messages-pagination", (offset, uuid) => {
    socketControllers.messagesPagination(socket, offset, uuid);
  });

  socket.on("disconnecting", () => socketControllers.onDisconnect(socket));
});
