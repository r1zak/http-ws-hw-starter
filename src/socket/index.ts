import { Server } from "socket.io";
import * as config from "./config";

const users = new Map();
const rooms = new Map();

export default async (io: Server) => {
  io.on("connection", (socket) => {
    const username = socket.handshake.query.username as string;
    const count = io.engine.clientsCount;

    socket.on("create", (room) => {
      if (rooms.has(room)) {
        socket.emit("roomAlreadyExists");
      }
      socket.join(room);
      rooms.set(room, { users: [{ username, isReady: false }] });

      socket.broadcast.emit(
        "roomList",
        JSON.stringify(Object.fromEntries(rooms))
      );
    });

    socket.on("join", (room) => {
      // TODO: add users verification
      // room.get(room).push({ users: { username } });
      socket.join(room);
      socket.broadcast.emit(
        "roomList",
        JSON.stringify(Object.fromEntries(rooms))
      );

      console.log("rooms get", rooms.get(room));
    });

    socket.on("disconnect", () => {
      users.delete(username);
      console.log("disconnect");
    });

    if (users.has(username)) {
      socket.emit("userAlreadyExists");
      return;
    }

    users.set(username, true);
    socket.emit("roomList", JSON.stringify(Object.fromEntries(rooms)));

    console.log("rooms: ", rooms);
    console.log("users size", users.size);
    console.log(username, socket.id);
    console.log(count);
  });
};
