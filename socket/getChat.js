const { Conversations, Markets, Messages, Users } = require("../../models");

const getChat = async (socket, uuid, offset) => {
  const conversation = await Conversations.findOne({
    where: { uuid, marketId: socket.role.marketId },
  });

  const messages = await Messages.findAll({
    where: { conversationId: conversation.id, roleAccess: true },
    attributes: ["uuid", "text", "isUser", "senderId", "createdAt"],
    order: [["id", "asc"]],
    limit: 20,
    offset: (offset - 1) * 20 || 0,
  });

  if (messages && messages.length > 0)
    socket.emit("messages", { messages, id: socket.id, user: false });
  else socket.emit("messages", { messages: null, id: socket.id });
};

module.exports = getChat;
