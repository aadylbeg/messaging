const { Conversations, Markets, Messages, Users } = require("./../../models");

const addFriend = async (socket, uuid) => {
  if (socket.user) {
    const conversation = await Conversations.findOne({
      where: { userId: socket.user.id, marketId: socket.user.marketId },
    });

    if (conversation && conversation.userAccess == false)
      await conversation.update({ userAccess: true });
    else {
      await Conversations.create({
        userId: socket.user.id,
        marketId: socket.user.marketId,
        marketAccess: false,
      });
    }
  } else if (socket.role) {
    const market = await Markets.findOne({ where: socket.role.marketId });
    const user = await Users.findOne({ where: { uuid, marketId: market.id } });
    if (!user)
      return socket.emit("error", { statusCode: 404, msg: "Not Found!" });

    const conversation = await Conversations.findOne({
      where: { userId: user.id, marketId: market.id },
    });

    if (conversation && conversation.marketAccess == true)
      return socket.emit("error", { msg: "Already added", statusCode: 406 });

    if (conversation && conversation.marketAccess == false)
      await conversation.update({ marketAccess: true });
    else {
      await Conversations.create({
        userId: user.id,
        marketId: socket.role.marketId,
      });
    }

    const conversations = await Conversations.findAll({
      where: { marketId: socket.role.marketId, marketAccess: true },
      include: {
        model: Messages,
        as: "messages",
        where: { roleAccess: true },
        limit: 1,
        required: false,
      },
      order: [
        [{ model: Messages, as: "messages" }, "createdAt", "desc NULLS LAST"],
      ],
    });

    for (var con of conversations) {
      const user = await Users.findOne({
        where: { id: con.userId },
      });
      socket.emit("friends", user, con.uuid);
    }
  }
};

module.exports = addFriend;
