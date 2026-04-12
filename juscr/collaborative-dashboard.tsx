// JUSCR Collaborative Dashboard UI (React)

import React, { useEffect, useRef, useState } from "react";
import { loadWidget } from "./widget-system";
import { multiUserSystem } from "./multi-user-layer";

const socket = new WebSocket("ws://localhost:8080");

export default function CollaborativeDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const containerRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    multiUserSystem.onEvent((event) => {
      if (event.type === "USER_JOIN") {
        setUsers((prev) => [...prev, event.payload]);
      }

      if (event.type === "USER_LEAVE") {
        setUsers((prev) => prev.filter(u => u.id !== event.userId));
      }
    });

    socket.onmessage = (msg) => {
      const event = JSON.parse(msg.data);
      multiUserSystem["emit"]?.(event);
    };

    multiUserSystem.onEvent((event) => {
      socket.send(JSON.stringify(event));
    });
  }, []);

  useEffect(() => {
    users.forEach(user => {
      const ref = containerRefs.current[user.id];
      if (ref) {
        loadWidget("core", ref, { message: user.name + " active" });
      }
    });
  }, [users]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
      {users.map(user => (
        <div key={user.id} style={{ border: "1px solid #ccc", padding: "10px" }}>
          <h3>{user.name}</h3>
          <div ref={(el) => (containerRefs.current[user.id] = el)} />
        </div>
      ))}
    </div>
  );
}
