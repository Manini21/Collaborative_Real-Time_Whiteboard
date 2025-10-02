import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

export default function App() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const [color, setColor] = useState("black");
  const [lineWidth, setLineWidth] = useState(2);
  const [tool, setTool] = useState("pen"); // pen, eraser, rectangle, circle, line

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const lastPos = useRef({ x: null, y: null });
  const startPos = useRef({ x: null, y: null });
  const undoStack = useRef([]);
  const redoStack = useRef([]);

  const [cursors, setCursors] = useState({}); // {socketId: {x, y}}

  // Setup canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.8;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctxRef.current = ctx;

    // Load from localStorage
    const savedData = localStorage.getItem("board");
    if (savedData) {
      const img = new Image();
      img.src = savedData;
      img.onload = () => ctx.drawImage(img, 0, 0);
    }
  }, []);

  // Update pen/eraser settings
  useEffect(() => {
    if (ctxRef.current) {
      ctxRef.current.strokeStyle = tool === "eraser" ? "white" : color;
      ctxRef.current.lineWidth = lineWidth;
    }
  }, [color, lineWidth, tool]);

  // Handle drawing & cursor from other clients
  useEffect(() => {
    socket.on("draw", (data) => drawFromSocket(data));
    socket.on("chat", (msg) => setMessages((prev) => [...prev, msg]));
    socket.on("cursor", ({ id, x, y }) => {
      setCursors((prev) => ({ ...prev, [id]: { x, y } }));
    });
    socket.on("cursor_leave", ({ id }) => {
      setCursors((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    });

    return () => {
      socket.off("draw");
      socket.off("chat");
      socket.off("cursor");
      socket.off("cursor_leave");
    };
  }, []);

  const drawFromSocket = (data) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.strokeStyle = data.tool === "eraser" ? "white" : data.color;
    ctx.lineWidth = data.lineWidth;

    if (data.tool === "pen" || data.tool === "eraser") {
      ctx.beginPath();
      ctx.moveTo(data.x[0], data.y[0]);
      for (let i = 1; i < data.x.length; i++) ctx.lineTo(data.x[i], data.y[i]);
      ctx.stroke();
      ctx.closePath();
    } else if (data.tool === "rectangle") {
      ctx.strokeRect(data.startX, data.startY, data.w, data.h);
    } else if (data.tool === "circle") {
      ctx.beginPath();
      ctx.ellipse(data.cx, data.cy, data.rx, data.ry, 0, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.closePath();
    } else if (data.tool === "line") {
      ctx.beginPath();
      ctx.moveTo(data.startX, data.startY);
      ctx.lineTo(data.endX, data.endY);
      ctx.stroke();
      ctx.closePath();
    }
  };

  // Start drawing
  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    setIsDrawing(true);
    lastPos.current = { x: offsetX, y: offsetY };
    startPos.current = { x: offsetX, y: offsetY };
    if (tool === "pen" || tool === "eraser") ctxRef.current.beginPath();
  };

  // Draw
  const draw = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;

    // Send cursor position to others
    socket.emit("cursor", { x: offsetX, y: offsetY });

    if (!isDrawing) return;
    const ctx = ctxRef.current;

    if (tool === "pen" || tool === "eraser") {
      ctx.lineTo(offsetX, offsetY);
      ctx.stroke();
      socket.emit("draw", {
        x: [lastPos.current.x, offsetX],
        y: [lastPos.current.y, offsetY],
        color,
        lineWidth,
        tool,
      });
      lastPos.current = { x: offsetX, y: offsetY };
    }
  };

  // Stop drawing
  const stopDrawing = ({ nativeEvent }) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const ctx = ctxRef.current;

    if (["rectangle", "circle", "line"].includes(tool)) {
      const { offsetX, offsetY } = nativeEvent;
      const startX = startPos.current.x;
      const startY = startPos.current.y;

      if (tool === "rectangle") {
        const w = offsetX - startX;
        const h = offsetY - startY;
        ctx.strokeRect(startX, startY, w, h);
        socket.emit("draw", { tool, startX, startY, w, h, color, lineWidth });
      } else if (tool === "line") {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
        ctx.closePath();
        socket.emit("draw", { tool, startX, startY, endX: offsetX, endY: offsetY, color, lineWidth });
      } else if (tool === "circle") {
        const cx = (startX + offsetX) / 2;
        const cy = (startY + offsetY) / 2;
        const rx = Math.abs(offsetX - startX) / 2;
        const ry = Math.abs(offsetY - startY) / 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.closePath();
        socket.emit("draw", { tool, cx, cy, rx, ry, color, lineWidth });
      }
    }

    // Save for undo
    undoStack.current.push(canvasRef.current.toDataURL());
    redoStack.current = [];
    localStorage.setItem("board", canvasRef.current.toDataURL());
  };

  // Undo/Redo
  const undo = () => {
    if (!undoStack.current.length) return;
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    redoStack.current.push(canvas.toDataURL());
    const prev = undoStack.current.pop();
    const img = new Image();
    img.src = prev;
    img.onload = () => ctx.drawImage(img, 0, 0);
    localStorage.setItem("board", prev);
  };

  const redo = () => {
    if (!redoStack.current.length) return;
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    undoStack.current.push(canvas.toDataURL());
    const next = redoStack.current.pop();
    const img = new Image();
    img.src = next;
    img.onload = () => ctx.drawImage(img, 0, 0);
    localStorage.setItem("board", next);
  };

  // Chat
  const sendMessage = () => {
    if (input.trim() === "") return;
    socket.emit("chat", input);
    setInput("");
  };

  return (
    <div style={{ display: "flex" }}>
      {/* Whiteboard */}
      <div style={{ position: "relative" }}>
        <canvas
          ref={canvasRef}
          style={{ border: "1px solid black", background: "white" }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
        {/* Render other users' cursors */}
        {Object.entries(cursors).map(([id, pos]) => (
          <div
            key={id}
            style={{
              position: "absolute",
              left: pos.x,
              top: pos.y,
              width: 10,
              height: 10,
              background: "red",
              borderRadius: "50%",
              pointerEvents: "none",
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </div>

      {/* Chat */}
      <div style={{ marginLeft: "20px", width: "250px" }}>
        <h3>Chat</h3>
        <div
          style={{
            border: "1px solid black",
            height: "400px",
            overflowY: "auto",
            marginBottom: "10px",
            padding: "5px",
            background: "#f9f9f9",
          }}
        >
          {messages.map((msg, i) => (
            <div key={i}>{msg}</div>
          ))}
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type message..."
        />
        <button onClick={sendMessage}>Send</button>
        <div style={{ marginTop: "10px" }}>
          <button onClick={() => setTool("pen")}>Pen</button>
          <button onClick={() => setTool("eraser")}>Eraser</button>
          <button onClick={() => setTool("rectangle")}>Rectangle</button>
          <button onClick={() => setTool("circle")}>Circle</button>
          <button onClick={() => setTool("line")}>Line</button>
          <button onClick={undo}>Undo</button>
          <button onClick={redo}>Redo</button>

          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            style={{ marginLeft: "10px" }}
          />
          <label style={{ marginLeft: "10px" }}>
            Size:
            <input
              type="range"
              min="1"
              max="20"
              value={lineWidth}
              onChange={(e) => setLineWidth(e.target.value)}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
