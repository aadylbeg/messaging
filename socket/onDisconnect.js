const { Conversations, Markets, Messages, Users } = require("./../../models");

const onDisconnect = async (socket) => {
  if (socket.user) {
    const conversation = await Conversations.findOne({
      where: { userId: socket.user.id, userAccess: true },
    });
    console.log("aa", socket.adapter.rooms.values());
    console.log("bb", conversation.uuid);
    await Users.update(
      { lastActive: new Date(), isOnline: false },
      { where: { uuid: socket.user.uuid } }
    );

    socket.to(conversation.uuid).emit("connected", false, socket.user);
  } else if (socket.role) {
    const conversations = await Conversations.findAll({
        where: { marketId: socket.role.marketId, marketAccess: true },
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
        uuids.push(conversation.uuid);
      }

      socket.to(uuids).emit("connected", false, market);
    }
  }
};

module.exports = onDisconnect;
