import { useReactiveVar } from "@apollo/client";
import { useRouter } from "next/dist/client/router";
import { useEffect, useState } from "react";
import { connectionVar } from "../graphql/reactiveVar";

const JoinRoom = (props) => {
  const { query } = useRouter();
  const connection = useReactiveVar(connectionVar);
  const router = useRouter();

  const { isHost, roomId } = connection;

  useEffect(() => {
    console.log({ query });
    if (query?.host && !isHost) {
      connectionVar({ ...connection, isHost: query?.host });
    }
  }, []);

  const joinRoom = async () => {
    const URL = `https://roomie.up.railway.app:7525/api/room-exist/${roomId}`;
    // const URL = `http://localhost:3001/api/room-exist/${roomId}`;
    const res = await fetch(URL, {
      method: "GET",
    });
    const { roomExist, full } = await res.json();
    if (roomExist) {
      if (full) {
        connectionVar({
          ...connection,
          error: "Meeting is full. Please try again later.",
        });
      } else {
        connectionVar({ ...connection, roomId });
        router.push("/room");
      }
    } else {
      connectionVar({
        ...connection,
        error: "Room not found. Check your meeting ID",
      });
    }
  };

  const createRoom = async () => {
    router.push("/room");
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center flex-col">
      <div
        style={{ boxShadow: "7px 7px black", height: "fit-content" }}
        className="w-96 border-2 p-4 border-black rounded-lg "
      >
        {isHost ? (
          <div className="flex flex-col justify-between items-between h-full">
            <div>
              <p className="font-center font-bold text-2xl">Host meeting</p>
              <Inputs />
            </div>
            <div className="flex items-center w-full justify-between">
              <a className="font-bold" href="/">
                Back
              </a>
              <button
                onClick={() => createRoom()}
                className="bg-black text-white p-2 rounded-lg font-bold"
              >
                Create room
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-between items-between h-full">
            <div>
              <p className="font-bold text-2xl">Join meeting</p>
              <Inputs />
            </div>
            <div className="flex items-center w-full justify-between">
              <a className="font-bold" href="/">
                Back
              </a>
              <button
                onClick={() => joinRoom()}
                className="bg-black text-white p-2 rounded-lg font-bold"
              >
                Join room
              </button>
            </div>
          </div>
        )}
      </div>
      <Error />
    </div>
  );
};

export default JoinRoom;

const Inputs = () => {
  const connection = useReactiveVar(connectionVar);
  const { isHost, isAudioOnly, name } = connection;

  return (
    <div className="w-full">
      {!isHost && (
        <input
          style={{ boxShadow: "2px 2px black" }}
          className="border-2 p-2 border-black rounded-md font-bold w-full mt-4"
          placeholder="Enter meeting ID"
          onChange={(e) => {
            connectionVar({ ...connection, roomId: e.target.value });
          }}
          type="text"
        />
      )}
      <input
        style={{ boxShadow: "2px 2px black" }}
        className="border-2 p-2 border-black rounded-md font-bold w-full mt-4"
        placeholder="Enter name"
        value={name}
        onChange={(e) => connectionVar({ ...connection, name: e.target.value })}
        type="text"
      />
      <div className="flex items-center mt-2 py-4">
        <input
          className="border-2 p-2 border-black rounded-md h-4 w-4 checked:bg-black"
          type="checkbox"
          checked={isAudioOnly}
          onChange={(e) => connectionVar({ ...connection, isAudioOnly })}
        />
        <p
          className="ml-2 cursor-pointer"
          onClick={() =>
            connectionVar({ ...connection, isAudioOnly: !isAudioOnly })
          }
        >
          Only Audio
        </p>
      </div>
    </div>
  );
};

const Error = () => {
  const { error } = useReactiveVar(connectionVar);
  return (
    <>
      {!!error && (
        <div
          style={{ boxShadow: "7px 7px #7F1D1D" }}
          className="mt-4 w-96 text-center font-bold text-lg text-red-900 
					border-red-900 border-2 my-2 p-2 rounded-lg relative"
        >
          {error}
        </div>
      )}
    </>
  );
};
