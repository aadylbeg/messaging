const { Conversations, Markets, Messages, Users } = require("./../../models");

const dm = async (socket, message, uuid) => {
  if (socket.user) {
    const conversation = await Conversations.findOne({
      where: { userId: socket.user.id },
    });

    if (!conversation.marketAccess)
      await conversation.update({ marketAccess: true });

    const newMessage = await Messages.create({
      isUser: true,
      text: message,
      conversationId: conversation.id,
    });

    socket.in(conversation.uuid).emit("dm", { newMessage, user: false });

    const messages = await Messages.findAll({
      where: { conversationId: conversation.id, userAccess: true },
      order: [["id", "asc"]],
    });

    socket.emit("messages", { messages, id: socket.id, user: true });
  } else if (socket.role) {
    const conversation = await Conversations.findOne({
      where: { uuid, marketId: socket.role.marketId },
    });

    const newMessage = await Messages.create({
      text: message,
      conversationId: conversation.id,
      senderId: socket.role.id,
      isUser: false,
    });

    socket.in(conversation.uuid).emit("dm", { newMessage, user: true });

    const messages = await Messages.findAll({
      where: { conversationId: conversation.id, roleAccess: true },
      order: [["id", "asc"]],
    });

    if (messages && messages.length > 0)
      socket.emit("messages", { messages, id: socket.id, user: false });
  }
};

module.exports = dm;
