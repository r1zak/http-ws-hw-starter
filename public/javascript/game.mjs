import { createElement } from "./helpers/domHelper.mjs";
import { appendUserElement, changeReadyStatus } from "./views/user.mjs";

const username = sessionStorage.getItem("username");

if (!username) {
  window.location.replace("/login");
}

const socket = io.connect("", { query: { username } });

socket.on("userAlreadyExists", () => {
  alert("User already exists");
  sessionStorage.removeItem("username");
  window.location.replace("/login");
});

socket.on("roomAlreadyExists", () => {
  alert("Room already exists");
  window.location.replace("/game");
});

socket.on("roomList", (rooms) => {
  rooms = JSON.parse(rooms);

  Object.keys(rooms).forEach((roomName) => {
    const usersCount = rooms[roomName].users.length;

    const roomCardCount = createElement({ tagName: "span" });
    roomCardCount.textContent = `${usersCount} users connected`;

    const roomCardName = createElement({
      tagName: "h3",
      className: "room-name",
    });
    roomCardName.textContent = roomName;

    const roomCardBtn = createElement({
      tagName: "button",
      className: "join-btn",
    });
    roomCardBtn.textContent = "Join";

    const room = createElement({
      tagName: "div",
      className: "room",
      attributes: {},
      innerElements: [roomCardCount, roomCardName, roomCardBtn],
    });

    roomsWrapper.append(room);

    roomCardBtn.addEventListener("click", () => {
      socket.emit("join", roomName);
      Object.values(rooms).forEach((username) => {
        appendUserElement({ username });
      });
      roomCardName.textContent = roomName;

      roomsPage.classList.add("display-none");
      gamePage.classList.remove("display-none");
    });
  });

  console.log(rooms);
});

const addRoomBtn = document.getElementById("add-room-btn");
const quitRoomBtn = document.getElementById("quit-room-btn");
const roomsWrapper = document.getElementById("rooms-wrapper");
const roomsPage = document.getElementById("rooms-page");
const gamePage = document.getElementById("game-page");
const roomName = document.getElementById("room-name");
const readyBtn = document.getElementById("ready-btn");
const timer = document.getElementById("timer");

const onClickAddButton = () => {
  let value = prompt("Input room name");

  if (!value) {
    typeof value === "string" ? alert("Type correct room name") : null;
    return;
  }

  roomName.textContent = value;

  let isExists = false;
  socket.on("roomAlreadyExists", () => {
    isExists = true;
  });
  socket.emit("create", value);

  if (isExists) {
    alert("Room already exists");
  }

  appendUserElement({ username });
  roomsPage.classList.add("display-none");
  gamePage.classList.remove("display-none");
};

const onClickQuitButton = () => {
  roomsPage.classList.remove("display-none");
  gamePage.classList.add("display-none");
};

const onClickReadyBtn = () => {
  let isReady = JSON.parse(readyBtn.dataset.ready);

  if (isReady) {
    readyBtn.textContent = "READY";
    readyBtn.dataset.ready = !isReady;
    changeReadyStatus({ username, ready: !isReady });
  } else {
    readyBtn.textContent = "NOT READY";
    readyBtn.dataset.ready = !isReady;
    changeReadyStatus({ username, ready: !isReady });
  }
};

addRoomBtn.addEventListener("click", onClickAddButton);
quitRoomBtn.addEventListener("click", onClickQuitButton);
readyBtn.addEventListener("click", onClickReadyBtn);
