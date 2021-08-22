import { makeVar } from "@apollo/client";

export const connectionVar = makeVar({
  isHost: null,
  isAudioOnly: false,
  error: "",
  roomId: 0,
  name: "",
});

export const sessionVar = makeVar({
  isMute: false,
  isCameraDisabled: false,
  isScreenShareActive: false,
  isLoading: true,
});

export const participantsVar = makeVar([]);

export const messagesVar = makeVar([
  {
    content: "hey",
    name: "Kevin",
    messageCreateByMe: true,
  },
  {
    content: "hey",
    name: "Kevin",
    messageCreateByMe: true,
  },
  {
    content: "hey",
    name: "Kevin",
    messageCreateByMe: true,
  },
  {
    content: "hey",
    name: "Kevin",
    messageCreateByMe: true,
  },
  {
    content: "hey",
    name: "boi",
    messageCreateByMe: false,
  },
]);
