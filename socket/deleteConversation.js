const { Conversations, Messages, Users } = require("../../models");

const deleteConversation = async (socket, uuid) => {
  const conversation = await Conversations.findOne({
    where: { uuid },
    include: {
      model: Messages,
      as: "messages",
      where: { roleAccess: true },
      required: false,
    },
  });

  if (!conversation)
    return socket.emit("error", { msg: "Not Found", statusCode: 404 });
  if (conversation.messages.length > 0)
    return socket.emit("error", { msg: "Can't delete", statusCode: 406 });

  await conversation.update({ marketAccess: false });

  const conversations = await Conversations.findAll({
    where: { marketId: socket.role.marketId, marketAccess: true },
    include: {
      model: Messages,
      as: "messages",
      where: { roleAccess: true },
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
    socket.emit("friends", user.username, user.id, con.uuid);
  }
};

module.exports = deleteConversation;
