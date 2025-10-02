const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // frontend dev server
    methods: ["GET", "POST"],
  },
});

// Socket.io handling
io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  // Handle drawing events
  socket.on("draw", (data) => {
    socket.broadcast.emit("draw", data);
  });

  // Handle cursor movement
  socket.on("cursor", (data) => {
    socket.broadcast.emit("cursor", { id: socket.id, x: data.x, y: data.y });
  });

  // Handle chat
  socket.on("chat", (msg) => {
    socket.broadcast.emit("chat", msg);
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
    socket.broadcast.emit("cursor_leave", { id: socket.id });
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
