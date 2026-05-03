import http from "http";
import { Server } from "socket.io";
import { createClient } from "redis";

const server = http.createServer();
const io = new Server(server, { cors: { origin: "*" } });

const redis = createClient({ url: process.env.REDIS_URL || "redis://localhost:6379" });
await redis.connect();

io.on("connection", (socket) => {
  console.log("user connected");

  socket.on("join", (room) => {
    socket.join(room);
  });

  socket.on("event", async ({ room, payload }) => {
    const event = { room, payload, timestamp: Date.now() };

    io.to(room).emit("event", event);
    await redis.publish(room, JSON.stringify(event));
  });
});

server.listen(3002, () => console.log("WS running on 3002"));
