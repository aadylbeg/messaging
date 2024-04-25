const addFriend = require("./addFriend");

const { Conversations, Markets, Messages, Users } = require("../../models");

const usersPagination = async (socket, offset) => {
  const conversations = await Conversations.findAll({
    where: { marketId: socket.role.marketId, marketAccess: true },
    include: {
      model: Messages,
      as: "messages",
      where: { roleAccess: true },
      order: [["id", "desc"]],
      required: false,
    },
    order: [
      [{ model: Messages, as: "messages" }, "createdAt", "desc NULLS LAST"],
    ],
    limit: 20,
    offset: (offset - 1) * 20,
  });

  if (conversations.length > 0) {
    for (var conversation of conversations) {
      const user = await Users.findOne({
        where: { id: conversation.userId },
      });
      socket.emit("friends", user.username, user.id, conversation.uuid);
    }
  }
};

module.exports = usersPagination;
