import { useReactiveVar } from "@apollo/client";
import { useRouter } from "next/dist/client/router";
import { useEffect, useRef, useState } from "react";
import {
  connectionVar,
  messagesVar,
  participantsVar,
  sessionVar,
} from "../graphql/reactiveVar";
import {
  getLocalPreviewAndRoomConnection,
  toggleCamera,
  toggleMic,
  toggleScreenShare,
} from "../utils/webRTCHandler";

const Room = (props) => {
  const session = useReactiveVar(sessionVar);
  const { isLoading } = session;

  useEffect(() => {
    getLocalPreviewAndRoomConnection();
  }, []);

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <Participant />
      <Videos />
      <Chat />
      {isLoading && <Loading />}
    </div>
  );
};

export default Room;

const Participant = () => {
  const participants = useReactiveVar(participantsVar);
  return (
    <div style={{ flex: "2" }} className="h-full p-4">
      <div
        style={{ boxShadow: "7px 7px black" }}
        className="border-2 border-black h-full w-full rounded-lg p-4"
      >
        <h2
          style={{ boxShadow: "2px 2px black" }}
          className="text-bold text-xl mb-4 font-bold p-2 border-black 
					border-2 rounded-lg"
        >
          Participant
        </h2>
        {participants.map(({ name }, index) => (
          <div
            key={name + index}
            className="text-lg hover:bg-gray-200 py-2 pl-2 rounded-lg font-bold"
          >
            {name}
          </div>
        ))}
      </div>
    </div>
  );
};

const Videos = () => {
  const session = useReactiveVar(sessionVar);
  const { isMute, isCameraDisabled, isScreenShareActive, isLoading } = session;
  const router = useRouter();
  const connection = useReactiveVar(connectionVar);
  const [screenStream, setScreenStream] = useState(null);
  const leaveRoom = () => {
    router.replace("/");
    connectionVar({ ...connection, error: "" });
  };

  return (
    <div style={{ flex: "7" }} className="h-full w-full p-4">
      <div
        style={{ boxShadow: "7px 7px black" }}
        className="border-2 border-black h-full w-full rounded-lg 
				p-4 justify-between flex flex-col"
      >
        <div className="h-full">
          <RoomId />
          <div id="video_portals" className="my-4">
            {isScreenShareActive && <ScreenPreview stream={screenStream} />}
          </div>
        </div>
        <div className="w-full h-8 flex items-center justify-center">
          <button
            onClick={() => {
              toggleMic(!isMute);
              sessionVar({ ...session, isMute: !isMute });
            }}
            style={{ boxShadow: "2px 2px black" }}
            className="h-full border-2 p-4 border-black rounded-lg 
						flex items-center mx-2 font-bold"
          >
            <span
              className={`rounded-full h-4 w-4 ${
                isMute ? "bg-red-900" : "bg-green-900"
              } mr-2`}
            />
            Microphone
          </button>
          <button
            onClick={() => {
              toggleCamera(!isCameraDisabled);
              sessionVar({ ...session, isCameraDisabled: !isCameraDisabled });
            }}
            style={{ boxShadow: "2px 2px black" }}
            className="h-full border-2 p-4 border-black rounded-lg flex 
						items-center mx-2 font-bold"
          >
            <span
              className={`rounded-full h-4 w-4 ${
                isCameraDisabled ? "bg-red-900" : "bg-green-900"
              } mr-2`}
            />
            Camera
          </button>
          <button
            onClick={async () => {
              console.log("screenshare clicked");
              sessionVar({
                ...session,
                isScreenShareActive: !isScreenShareActive,
              });
              if (!isScreenShareActive) {
                let stream = null;
                try {
                  stream = await navigator.mediaDevices.getDisplayMedia({
                    audio: false,
                    video: true,
                  });
                } catch (err) {
                  console.log({ err });
                }
                if (stream) {
                  setScreenStream(stream);
                  console.log("entering toggl");
                  toggleScreenShare(isScreenShareActive, stream);
                  sessionVar({
                    ...session,
                    isScreenShareActive: true,
                  });
                }
              } else {
                console.log("exiting toggl");
                toggleScreenShare(isScreenShareActive);
                sessionVar({
                  ...session,
                  isScreenShareActive: false,
                });
                screenStream?.getTracks().forEach((t) => t.stop());
                setScreenStream(null);
              }
            }}
            style={{ boxShadow: "2px 2px black" }}
            className="h-full border-2 p-4 border-black rounded-lg flex 
						items-center mx-2 font-bold leading-none"
          >
            <span
              className={`rounded-full h-4 w-4 ${
                !isScreenShareActive ? "bg-red-900" : "bg-green-900"
              } mr-2`}
            />
            Screen Share
          </button>
          <button
            onClick={() => leaveRoom()}
            style={{ boxShadow: "2px 2px #7F1D1D" }}
            className="h-full border-2 p-4 border-red-900 rounded-lg flex 
						items-center mx-2 font-bold text-red-900 leading-none"
          >
            Leave Room
          </button>
        </div>
      </div>
    </div>
  );
};

const Chat = () => {
  return (
    <div style={{ flex: "3" }} className="h-full w-full p-4">
      <div
        style={{ boxShadow: "7px 7px black" }}
        className="border-2 border-black h-full w-full rounded-lg p-4 justify-between flex flex-col"
      >
        <div className="overflow-y-auto">
          <div
            style={{ boxShadow: "2px 2px black", width: "fit-content" }}
            className="font-bold px-4 h-12 flex items-center border-2 border-black rounded-lg text-black bg-white text-xl"
          >
            Chat
          </div>
          <Messages />
        </div>
        <MessageBox />
      </div>
    </div>
  );
};

const MessageBox = () => {
  const [message, setMessage] = useState("");
  const enterMessage = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };
  const sendMessage = () => {
    console.log("sending message to other users");
    setMessage("");
  };
  return (
    <div
      style={{ boxShadow: "2px 2px black" }}
      className="h-20 w-full border-black border-2 p-2 rounded-lg flex pr-4 items-center"
    >
      <input
        onChange={(e) => setMessage(e.target.value)}
        value={message}
        type="text"
        onKeyDown={(e) => enterMessage(e)}
        placeholder="Type your message"
        className="h-full w-full border-0 p-2"
      />
      <button className="bg-black p-2 h-10 rounded-lg text-white font-bold ml-4">
        Send
      </button>
    </div>
  );
};

const Messages = () => {
  const messages = useReactiveVar(messagesVar);
  return (
    <div className=" w-full">
      {messages.map(({ content, name, messageCreateByMe }, index) => {
        const sameAuthor = index > 0 && name === messages[index - 1].name;
        return (
          <div
            key={`${content} ${index}`}
            className={`${
              messageCreateByMe ? "items-end" : "items-start"
            } flex flex-col`}
          >
            {!sameAuthor && <p className="font-bold text-xl">{name}</p>}
            <div
              style={{ boxShadow: "2px 2px black" }}
              className="w-full border-2 border-black rounded-lg w-4/5 mt-2 p-2"
            >
              {content}
              {messageCreateByMe}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const RoomId = () => {
  const { roomId } = useReactiveVar(connectionVar);
  const [showToast, setShowToast] = useState(false);
  return (
    <div
      onClick={() => {
        navigator.clipboard.writeText(roomId);
        setShowToast(true);
      }}
      style={{ boxShadow: "2px 2px black", width: "fit-content" }}
      className="font-bold px-4 h-12 flex items-center 
			border-2 border-black rounded-lg text-black bg-white text-xl cursor-pointer"
    >
      ID: {roomId}
      {showToast && <Toast>Copied: {roomId}</Toast>}
    </div>
  );
};

const Loading = () => {
  return (
    <div className="h-screen w-screen fixed flex items-center justify-center bg-white">
      <h2
        style={{ boxShadow: "2px 2px black" }}
        className="text-bold text-xl mb-4 font-bold p-2 border-black 
					border-2 rounded-lg"
      >
        Loading
      </h2>
    </div>
  );
};

const Toast = ({ children }) => {
  const [showToast, setShowToast] = useState(false);
  useEffect(() => {
    setShowToast(true);
    const interval = setTimeout(() => {
      setShowToast(false);
    }, 3000);
    return () => clearTimeout(interval);
  }, []);
  return (
    <div
      style={{ boxShadow: "2px 2px black" }}
      className={`text-bold text-xl mb-4 font-bold p-2 border-black 
					border-2 rounded-lg absolute bg-white top-2 right-2 transition-opacity 
					opacity-0 ${showToast && "opacity-100"}`}
    >
      {children}
    </div>
  );
};

const ScreenPreview = ({ stream }) => {
  const screenSharingRef = useRef();
  useEffect(() => {
    const video = screenSharingRef.current;
    video.srcObject = stream;
    video.onloadedmetadata = () => {
      video.play();
    };
  }, [stream]);
  return (
    <div className="w-full h-full">
      <video muted aotuPlay ref={screenSharingRef} />
    </div>
  );
};
