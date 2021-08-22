import { createNewRoom, joinRoom, signalPeerData } from "./wss";
import Peer from "simple-peer";
import { connectionVar, sessionVar } from "../graphql/reactiveVar";

let localStream;
export const getLocalPreviewAndRoomConnection = async () => {
  const { isHost, roomId, name } = connectionVar();
  const session = sessionVar();

  const availableDevices = await navigator.mediaDevices.enumerateDevices();
  console.log("availableDevices");
  console.log({ availableDevices });
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: {
      width: "480",
      height: "360",
    },
  });
  localStream = stream;
  // console.log({ stream });
  showLocalStream(stream);
  sessionVar({ ...session, isLoading: false });
  isHost ? createNewRoom(name) : joinRoom(name, roomId);
};

let peers = {};
let streams = [];

const getConfig = () => {
  return {
    iceServers: [
      {
        urls: "stun:stun.l.google.com.:19302",
      },
    ],
  };
};

export const prepareNewPeerConnection = (connUserSocketId, isInitiator) => {
  const config = getConfig();
  peers[connUserSocketId] = new Peer({
    initiator: isInitiator,
    config,
    stream: localStream,
  });

  peers[connUserSocketId].on("signal", (data) => {
    const signalData = {
      signal: data,
      connUserSocketId: connUserSocketId,
    };
    signalPeerData(signalData);
  });

  peers[connUserSocketId].on("stream", (stream) => {
    console.log("new stream");
    addStream(stream, connUserSocketId);
    streams = [...streams, stream];
  });
};

export const removePeerConnection = (data) => {
  const { socketId } = data;
  const videoContainer = document.getElementById(socketId);
  const videoElement = document.getElementById(`${socketId}-video`);
  if (videoContainer && videoElement) {
    const tracks = videoElement.srcObject.getTracks();
    tracks.forEach((t) => t.stop());

    videoElement.srcObject = null;
    videoContainer.removeChild(videoElement);
    videoContainer.parentNode.removeChild(videoContainer);
    if (peers[socketId]) {
      peers[socketId].destroy();
    }
    delete peers[socketId];
  }
};

export const handleSignalingData = (data) => {
  peers[data.connUserSocketId].signal(data.signal);
};

// ui videos

const addStream = (stream, connUserSocketId) => {
  const videosContainer = document.getElementById("video_portals");
  const videoContainer = document.createElement("div");
  videoContainer.id = connUserSocketId;
  videoContainer.classList.add("p-2");

  const videoElement = document.createElement("video");
  videoElement.style.width = "100%";
  videoElement.style.height = "100%";
  videoElement.style.boxShadow = "2px 2px black";
  videoElement.classList.add(
    "border-2",
    "p-2",
    "border-black",
    "flex",
    "items-center",
    "justify-center",
    "rounded-lg",
    "m-4"
  );
  videoElement.autoplay = true;
  videoElement.muted = true;
  videoElement.srcObject = stream;
  videoElement.id = `${connUserSocketId}-video`;
  videoElement.onloadedmetadata = () => {
    videoElement.play();
  };
  videoContainer.appendChild(videoElement);
  videosContainer.appendChild(videoContainer);
};

export const showLocalStream = (stream) => {
  console.log("Show local stream");
  console.log({ stream });
  const videosContainer = document.getElementById("video_portals");
  videosContainer.classList.add("w-full", "flex", "gap-1", "flex-wrap");
  videosContainer.style.height = "calc(100vh - 13em)";
  videosContainer.style.display = "grid";
  videosContainer.style.gridTemplateRows = "1fr 1fr";
  videosContainer.style.gridTemplateColumns = "1fr 1fr";
  const videoContainer = document.createElement("div");
  videoContainer.classList.add("p-2");
  const videoElement = document.createElement("video");
  videoElement.style.width = "100%";
  videoElement.style.height = "100%";
  videoElement.style.boxShadow = "2px 2px black";
  videoElement.classList.add(
    "border-2",
    "p-2",
    "border-black",
    "flex",
    "items-center",
    "justify-center",
    "rounded-lg",
    "m-4"
  );
  videoElement.autoplay = true;
  videoElement.muted = true;
  videoElement.srcObject = stream;
  videoElement.onloadedmetadata = () => {
    videoElement.play();
  };
  videoContainer.appendChild(videoElement);
  videosContainer.appendChild(videoContainer);
};

// button logic
export const toggleMic = (isMuted) => {
  localStream.getAudioTracks()[0].enabled = isMuted ? false : true;
};

export const toggleCamera = (isDisabled) => {
  localStream.getVideoTracks()[0].enabled = isDisabled ? false : true;
};

export const toggleScreenShare = (isScreenShareActive, screenStream = null) => {
  if (isScreenShareActive) {
    switchVideoTracks(localStream);
  } else {
    switchVideoTracks(screenStream);
  }
};

export const switchVideoTracks = (stream) => {
  for (let socket_id in peers) {
    for (let index in peers[socket_id].streams[0].getTracks()) {
      for (let index2 in stream.getTracks()) {
        if (
          peers[socket_id].streams[0].getTracks()[index].kind ===
          stream.getTracks()[index2].kind
        ) {
          peers[socket_id].replaceTrack(
            peers[socket_id].streams[0].getTracks()[index],
            stream.getTracks()[index2],
            peers[socket_id].streams[0]
          );
          break;
        }
      }
    }
  }
};
