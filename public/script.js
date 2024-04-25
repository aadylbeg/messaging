const socket = io("http://localhost:3001");

var h1 = document.querySelector("h1");
const friendContainer = document.querySelector(".friends__list");
const messageContainer = document.querySelector(".friend__messages");
const friend_uuid = document.getElementById("friend_uuid");
const message = document.getElementById("message");
const friends = document.querySelector(".friends__list");
const add_friend = document
  .querySelectorAll(".container__row")[0]
  .querySelector(".add");
const delete_friend = document
  .querySelectorAll(".container__row")[0]
  .querySelector(".delete");
const send_message = document
  .querySelectorAll(".container__row")[1]
  .querySelector(".add");
const delete_message = document
  .querySelectorAll(".container__row")[1]
  .querySelector(".delete");

socket.on("newclientconnect", function (data) {
  let name;
  if (data.user != null) name = data.user.username;
  if (data.role != null) name = data.role.name;
  h1.innerHTML = name + data.description;
  friendContainer.innerHTML = "";
  messageContainer.innerHTML = "";
});

socket.on("friends", function (data, uuid, aa) {
  appendFriend(data, uuid);
});

socket.on("connected", function (data, name) {
  friends.childNodes.forEach((item) => {
    if (item.innerText == (name.name || name.username)) {
      if (data) {
        item.classList.remove("offline");
        item.classList.add("online");
      } else {
        item.classList.remove("online");
        item.classList.add("offline");
      }
    }
  });
});

socket.on("messages", function (data) {
  if (socket.id == data.id) {
    messageContainer.innerHTML = "";
    if (data.messages == null) return appendMessages(null);
    for (i of data.messages) {
      appendMessages(i, data.user);
    }
  }
});

socket.on("dm", function (data) {
  appendMessages(data.newMessage, data.user);
});

socket.on("error", function (data) {
  console.log(data);
});

socket.emit("friends-pagination", (offset = 2));
// socket.emit(
//   "messages-pagination",
//   (offset = 1),
//   (uuid = "0b19c29f-6f27-435b-8bea-5f71825611de")
// );

add_friend.addEventListener("click", () => {
  const uuid = friend_uuid.value;
  socket.emit("add-friend", uuid);
  friendContainer.innerText = "";
  friend_uuid.value = "";
});

delete_friend.addEventListener("click", (e) => {
  const uuid = friend_uuid.value;
  socket.emit("delete-conversation", uuid);
  friend_uuid.value = "";
  friendContainer.innerText = "";
});

send_message.addEventListener("click", () => {
  const mess = message.value;
  socket.emit("send-message", mess);
  message.value = "";
  if (socket.conversationUuid != null) {
    socket.emit("send-role-message", (uuid = socket.conversationUuid), mess);
  }
});

delete_message.addEventListener("click", () => {
  const uuid = friend_uuid.value;
  socket.emit("delete-message", uuid);
  uuid.value = "";
});

window.addEventListener("click", (e) => {
  const el = e.target;
  if (el.classList.contains("friend")) {
    socket.emit("friend-chat", el.id);
    socket.conversationUuid = el.id;
  }
});

function appendFriend(data, uuid) {
  const messageElement = document.createElement("button");
  messageElement.appendChild(
    document.createTextNode(`${data.name || data.username}`)
  );
  messageElement.classList.add("friend");
  if (data.username) {
    if (data.isOnline) messageElement.classList.add("online");
    else messageElement.classList.add("offline");
  }
  messageElement.setAttribute("id", uuid);
  friendContainer.append(messageElement);
}

function appendMessages(messages, user) {
  const messageElement = document.createElement("p");
  if (messages == null) return messageContainer.prepend("");
  messageElement.appendChild(document.createTextNode(`${messages.text}`));
  if (user) {
    if (messages.isUser) {
      messageElement.classList.add("message");
      messageElement.classList.add("to");
    } else messageElement.classList.add("message");
  } else if (!user) {
    if (!messages.isUser) {
      messageElement.classList.add("message");
      messageElement.classList.add("to");
    } else messageElement.classList.add("message");
  }

  messageContainer.prepend(messageElement);
}
