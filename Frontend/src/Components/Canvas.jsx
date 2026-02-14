import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import './Canvas.css';

const Canvas = ({ user, roomCode, onLeaveRoom, onSignOut }) => {
  const canvasRef = useRef(null);
  const chatMessagesRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#6464ff');
  const [lineWidth, setLineWidth] = useState(3);
  const [tool, setTool] = useState('pen'); // 'pen', 'eraser', 'line', 'rectangle', 'circle'
  const [cursors, setCursors] = useState({});
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [showRoomInfo, setShowRoomInfo] = useState(false);

  const colors = ['#6464ff', '#ff6464', '#64ff64', '#ffff64', '#ff64ff', '#64ffff', '#ffffff', '#000000'];
  const widths = [1, 3, 5, 10, 15];

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    const newSocket = io('https://your-backend-name.onrender.com');
    setSocket(newSocket);

    // Join the specific room
    newSocket.emit('join_room', { roomCode, user: user.name });

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas size
    const resizeCanvas = () => {
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      tempCtx.drawImage(canvas, 0, 0);

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      ctx.drawImage(tempCanvas, 0, 0);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Socket events
    newSocket.on('draw', (data) => {
      drawLine(ctx, data.x0, data.y0, data.x1, data.y1, data.color, data.width);
    });

    newSocket.on('cursor', (data) => {
      setCursors(prev => ({ ...prev, [data.id]: { x: data.x, y: data.y } }));
    });

    newSocket.on('cursor_leave', (data) => {
      setCursors(prev => {
        const newCursors = { ...prev };
        delete newCursors[data.id];
        return newCursors;
      });
    });

    newSocket.on('chat', (data) => {
      console.log('Received chat message:', data);
      // Handle both formats: direct message or wrapped in data.message
      const message = data.message || data;
      setChatMessages(prev => [...prev, message]);
    });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      newSocket.disconnect();
    };
  }, []);

  const drawLine = (ctx, x0, y0, x1, y1, color, width) => {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.closePath();
  };

  const handleMouseDown = (e) => {
    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    canvasRef.current.lastX = x;
    canvasRef.current.lastY = y;
  };

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Emit cursor position with room code
    if (socket) {
      socket.emit('cursor', { x, y, roomCode });
    }

    if (!isDrawing) return;

    const ctx = canvasRef.current.getContext('2d');
    const lastX = canvasRef.current.lastX;
    const lastY = canvasRef.current.lastY;

    const drawColor = tool === 'eraser' ? '#1a1a2e' : color;
    drawLine(ctx, lastX, lastY, x, y, drawColor, lineWidth);

    if (socket) {
      socket.emit('draw', {
        x0: lastX,
        y0: lastY,
        x1: x,
        y1: y,
        color: drawColor,
        width: lineWidth,
        roomCode
      });
    }

    canvasRef.current.lastX = x;
    canvasRef.current.lastY = y;
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !socket) return;

    const message = {
      user: user.name,
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    console.log('Sending message:', message, 'to room:', roomCode);
    socket.emit('chat', { message, roomCode });
    setChatMessages(prev => [...prev, message]);
    setChatInput('');
  };

  return (
    <div className="canvas-page">
      {/* Top Navbar */}
      <nav className="canvas-navbar">
        <div className="navbar-left">
          <div className="logo-small">
            <svg viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="3" />
              <path d="M30 50 Q50 30, 70 50 Q50 70, 30 50" fill="currentColor" />
            </svg>
            <span>DrawSync</span>
          </div>
        </div>

        <div className="navbar-center">
          <button 
            className={`tool-btn ${tool === 'pen' ? 'active' : ''}`}
            onClick={() => setTool('pen')}
            title="Pen"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 19l7-7 3 3-7 7-3-3z"/>
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
              <path d="M2 2l7.586 7.586"/>
            </svg>
          </button>

          <button 
            className={`tool-btn ${tool === 'eraser' ? 'active' : ''}`}
            onClick={() => setTool('eraser')}
            title="Eraser"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 20H7L3 16l10-10 8 8-1 6z"/>
            </svg>
          </button>

          <div className="divider-vertical"></div>

          <div className="width-selector">
            {widths.map(w => (
              <button
                key={w}
                className={`width-btn ${lineWidth === w ? 'active' : ''}`}
                onClick={() => setLineWidth(w)}
                title={`${w}px`}
              >
                <div style={{ width: `${w * 2}px`, height: `${w * 2}px` }} />
              </button>
            ))}
          </div>

          <div className="divider-vertical"></div>

          <button className="tool-btn" onClick={clearCanvas} title="Clear Canvas">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            </svg>
          </button>
        </div>

        <div className="navbar-right">
          <button 
            className="tool-btn"
            onClick={() => setShowRoomInfo(!showRoomInfo)}
            title="Room Info"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          </button>

          <button 
            className="tool-btn"
            onClick={() => setShowChat(!showChat)}
            title="Toggle Chat"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
            {chatMessages.length > 0 && <span className="badge">{chatMessages.length}</span>}
          </button>

          <div className="user-info">
            <img src={user.avatar} alt={user.name} />
            <span>{user.name}</span>
          </div>

          <button className="leave-room-btn" onClick={onLeaveRoom} title="Leave Room">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
          </button>

          <button className="sign-out-btn" onClick={onSignOut}>
            Sign Out
          </button>
        </div>
      </nav>

      {/* Room Info Popup */}
      {showRoomInfo && (
        <div className="room-info-popup">
          <div className="room-info-header">
            <h4>Room Code</h4>
            <button onClick={() => setShowRoomInfo(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div className="room-code-display">{roomCode}</div>
          <p className="room-info-text">Share this code with others to invite them</p>
          <button 
            className="copy-code-btn"
            onClick={() => {
              navigator.clipboard.writeText(roomCode);
              alert('Room code copied to clipboard!');
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
            Copy Code
          </button>
        </div>
      )}

      {/* Left Sidebar - Color Palette */}
      <div className="left-sidebar">
        <div className="color-palette-vertical">
          <h4>Colors</h4>
          {colors.map(c => (
            <button
              key={c}
              className={`color-btn-vertical ${color === c ? 'active' : ''}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
              title={c}
            />
          ))}
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="drawing-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: tool === 'eraser' ? 'crosshair' : 'crosshair' }}
      />

      {/* Other users' cursors */}
      {Object.entries(cursors).map(([id, pos]) => (
        <div
          key={id}
          className="cursor-pointer"
          style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
        />
      ))}

      {/* Chat Panel */}
      {showChat && (
        <div className="chat-panel">
          <div className="chat-header">
            <h3>Chat</h3>
            <button onClick={() => setShowChat(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div className="chat-messages" ref={chatMessagesRef}>
            {chatMessages.length === 0 ? (
              <div className="chat-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
                <p>No messages yet</p>
              </div>
            ) : (
              chatMessages.map((msg, i) => (
                <div key={i} className={`chat-message ${msg.user === user.name ? 'own-message' : ''}`}>
                  <div className="message-header">
                    <strong>{msg.user}</strong>
                    <span className="timestamp">{msg.timestamp}</span>
                  </div>
                  <p>{msg.text}</p>
                </div>
              ))
            )}
          </div>

          <form className="chat-input-form" onSubmit={sendMessage}>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type a message..."
            />
            <button type="submit">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Canvas;
