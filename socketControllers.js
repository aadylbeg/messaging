const addFriend = require("./socket/addFriend");
const initializeUser = require("./socket/initializeUser");
const dm = require("./socket/dm");
const deleteConversation = require("./socket/deleteConversation");
const deleteMessage = require("./socket/deleteMessage");
const getChat = require("./socket/getChat");
const messagesPagination = require("./socket/messagesPagination");
const onDisconnect = require("./socket/onDisconnect");
const usersPagination = require("./socket/usersPagination");
const { authorizeUser } = require("./socket/authControllers");

module.exports = {
  addFriend,
  authorizeUser,
  dm,
  deleteConversation,
  deleteMessage,
  getChat,
  initializeUser,
  messagesPagination,
  onDisconnect,
  usersPagination,
};
