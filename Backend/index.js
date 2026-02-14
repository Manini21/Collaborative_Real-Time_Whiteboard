const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin:[
    "https://collaborative-real-time-whiteboard-eight.vercel.app"],
    methods: ["GET", "POST"],
  },
});

// Socket.io handling
io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  // Handle joining a room
  socket.on("join_room", (data) => {
    const { roomCode, user } = data;
    socket.join(roomCode);
    console.log(`👤 ${user} joined room: ${roomCode}`);
    
    // Notify others in the room
    socket.to(roomCode).emit("user_joined", { user, id: socket.id });
  });

  // Handle drawing events - broadcast only to room
  socket.on("draw", (data) => {
    if (data.roomCode) {
      socket.to(data.roomCode).emit("draw", data);
    }
  });

  // Handle cursor movement - broadcast only to room
  socket.on("cursor", (data) => {
    if (data.roomCode) {
      socket.to(data.roomCode).emit("cursor", { id: socket.id, x: data.x, y: data.y });
    }
  });

  // Handle chat - broadcast only to room
  socket.on("chat", (data) => {
    if (data.roomCode) {
      console.log(`💬 Chat in room ${data.roomCode}:`, data.message);
      socket.to(data.roomCode).emit("chat", data.message);
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
    // Notify all rooms (socket.io handles this automatically)
    socket.broadcast.emit("cursor_leave", { id: socket.id });
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
