import { io } from "socket.io-client";
import { connectionVar, participantsVar } from "../graphql/reactiveVar";
import {
  handleSignalingData,
  prepareNewPeerConnection,
  removePeerConnection,
} from "./webRTCHandler";

let socket = null;
const SERVER = "http://roomie.up.railway.app:3001";
// const SERVER = "http://localhost:3001";

export const connectWithSocketIOServer = () => {
  const connection = connectionVar();
  const participants = participantsVar();

  console.log(SERVER);
  socket = io(SERVER);
  socket.on("connect", () => {
    console.log(`succesfully connected: ${socket.id}`);
  });
  socket.on("room-id", (data) => {
    const { roomId } = data;
    console.log(roomId);
    connectionVar({ ...connection, roomId });
  });
  socket.on("room-update", (data) => {
    console.log("room update event");
    console.log({ data });
    const { connectedUsers } = data;
    participantsVar(connectedUsers);
  });
  socket.on("conn-prepare", (data) => {
    const { connUserSocketId } = data;
    prepareNewPeerConnection(connUserSocketId, false);
    socket.emit("conn-init", { connUserSocketId: connUserSocketId });
  });
  socket.on("conn-signal", (data) => {
    handleSignalingData(data);
  });
  socket.on("conn-init", (data) => {
    const { connUserSocketId } = data;
    prepareNewPeerConnection(connUserSocketId, true);
  });
  socket.on("user-disconnected", (data) => {
    console.log("user-disconnected: " + data);
    removePeerConnection(data);
  });
};
export const createNewRoom = (name) => {
  const data = { name };
  console.log(`Creating a new room`);
  socket.emit("create-new-room", data);
};

export const joinRoom = (name, roomId) => {
  const data = { name, roomId };
  console.log(`Joining a new room`);
  socket.emit("join-room", data);
};

export const signalPeerData = (data) => {
  socket.emit("conn-signal", data);
};
