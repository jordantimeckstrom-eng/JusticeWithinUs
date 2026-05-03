import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3002");

export default function Home() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    socket.emit("join", "room-1");

    const onEvent = (e: any) => {
      setEvents((prev) => [...prev, e]);
    };

    socket.on("event", onEvent);

    return () => {
      socket.off("event", onEvent);
    };
  }, []);

  const sendEvent = () => {
    socket.emit("event", {
      room: "room-1",
      payload: { type: "click" },
    });
  };

  return (
    <div>
      <button onClick={sendEvent}>Send Event</button>
      <pre>{JSON.stringify(events, null, 2)}</pre>
    </div>
  );
}
