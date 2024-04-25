const { Conversations, Markets, Messages, Users } = require("../../models");
const getChat = require("./getChat");

const messagesPagination = async (socket, offset, uuid) => {
  if (socket.user) {
    const conversation = await Conversations.findOne({
      where: { userId: socket.user.id, userAccess: true },
    });

    const messages = await Messages.findAll({
      where: { conversationId: conversation.id, userAccess: true },
      order: [["id", "asc"]],
      limit: 20,
      offset: (offset - 1) * 20 || 0,
    });

    if (messages && messages.length > 0) {
      socket.emit("messages", {
        messages,
        id: socket.id,
        ownerId: socket.user.id,
      });
    }
  } else if (socket.role) {
    getChat(socket, uuid, offset);
  }
};

module.exports = messagesPagination;
