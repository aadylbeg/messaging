const addFriend = require("./addFriend");

const {
  Conversations,
  Markets,
  Messages,
  Users,
  sequelize,
} = require("./../../models");

const initializeUser = async (socket) => {
  if (socket.user) {
    const conversation1 = await Conversations.findOne({
        where: { userId: socket.user.id, userAccess: true },
      }),
      market = await Markets.findOne({
        where: { id: socket.user.marketId, isBlocked: false },
      });

    if (!conversation1) addFriend(socket, market.uuid);

    const conversation = await Conversations.findOne({
      where: { userId: socket.user.id, userAccess: true },
    });

    socket.join(conversation.uuid);
    socket
      .to(conversation.uuid)
      .emit("connected", true, socket.user, conversation.uuid);
    socket.emit("friends", market);

    const messages = await Messages.findAll({
      where: { conversationId: conversation.id, userAccess: true },
      attributes: ["uuid", "text", "isUser", "senderId", "createdAt"],
      order: [["id", "asc"]],
    });

    if (messages && messages.length > 0)
      socket.emit("messages", { messages, id: socket.id, user: true });

    await Users.update(
      { isOnline: true },
      { where: { uuid: socket.user.uuid } }
    );
  } else if (socket.role) {
    const conversations = await Conversations.findAll({
        where: { marketId: socket.role.marketId, marketAccess: true },
        // order: [[sequelize.fn("where", sequelize.col("messages")), "DESC"]],
        order: [[Conversations.associations.messages, "id", "DESC NULLS LAST"]],
        returning: false,
        include: {
          model: Messages,
          as: "messages",
          where: { roleAccess: true },
          seperate: true,
          order: [["id", "DESC"]],
          // limit: 1,
          required: false,
        },
      }),
      market = await Markets.findOne({
        where: { id: socket.role.marketId, isBlocked: false },
      });

    if (conversations.length > 0) {
      var uuids = [];
      for (var conversation of conversations) {
        const user = await Users.findOne({
          where: { id: conversation.userId },
        });
        socket.emit("friends", user, conversation.uuid, conversation.messages);
        uuids.push(conversation.uuid);
      }
      socket.join(uuids);
      socket.to(uuids).emit("connected", true, market);
    }
  }
};

module.exports = initializeUser;
