const { Messages } = require("../../models");

const deleteMessage = async (socket, uuid) => {
  if (socket.user) {
    const message = await Messages.findOne({ where: { uuid } });
    if (!message) return;

    await message.update({ userAccess: false });

    const messages = await Messages.findAll({
      where: { conversationId: message.conversationId, userAccess: true },
      order: [["id", "asc"]],
    });

    socket.emit("messages", { messages, id: socket.id, user: true });
  } else if (socket.role) {
    const message = await Messages.findOne({ where: { uuid } });
    if (!message) return;

    await message.update({ roleAccess: false });

    const messages = await Messages.findAll({
      where: { conversationId: message.conversationId, roleAccess: true },
      order: [["id", "asc"]],
    });

    if (messages && messages.length > 0)
      socket.emit("messages", { messages, id: socket.id, user: false });
  }
};

module.exports = deleteMessage;
