import { useRouter } from "next/dist/client/router";
import Head from "next/head";
import { useEffect } from "react";
import { connectWithSocketIOServer } from "../utils/wss";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    connectWithSocketIOServer();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <p className="h-full p-4 text-3xl mb-4 font-bold ">roomie</p>
        <div
          style={{ boxShadow: "7px 7px black" }}
          className="w-96 h-full border-2 p-4 border-black rounded-lg "
        >
          <div
            style={{ boxShadow: "2px 2px black" }}
            className="border-2 p-2 border-black rounded-md w-full"
          >
            call someone, connect, go wild
          </div>
          <div className="flex justify-between w-full pt-8">
            <button
              onClick={() => router.push("/join-room")}
              className="border-2 p-2 border-black rounded-md bg-black font-bold text-white"
              style={{ width: "fit-content" }}
            >
              Join Room
            </button>
            <button
              onClick={() =>
                router.push({ pathname: "join-room", query: "host=true" })
              }
              className="border-2 p-2 border-black rounded-md bg-black font-bold text-white"
              style={{ width: "fit-content" }}
            >
              Create Room
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
