# DrawSync - Real-Time Collaborative Whiteboard

A beautiful, interactive real-time whiteboard application with collaborative drawing, live cursors, and chat functionality.

## ✨ Features

### 🎨 Beautiful UI
- **Stunning Homepage** with interactive animated dot background that responds to mouse movements
- **Floating Objects** (quill, inkpot, palette, brush) with smooth animations
- **Modern Design** with gradient accents and smooth transitions
- **Responsive** layout that works on all devices

### 🔐 Authentication
- **Google Sign-In** mock implementation (ready for Firebase integration)
- **Email/Password** authentication UI
- Clean sign-in/sign-up flow

### 🖌️ Drawing Features
- **Multiple Tools**: Pen, Eraser
- **Color Palette**: 8 pre-selected colors
- **Brush Sizes**: 5 different sizes (1px to 15px)
- **Real-time Collaboration**: See other users drawing in real-time
- **Live Cursors**: Track other users' mouse positions
- **Clear Canvas**: Reset the canvas anytime

### 💬 Chat System
- **Real-time Chat**: Communicate with other users
- **Sliding Panel**: Toggleable chat interface
- **Message Timestamps**: Know when messages were sent

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Backend Setup**
```bash
cd backend
npm install
node index.js
```
The server will start on `http://localhost:5000`

2. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```
The app will open on `http://localhost:5173`


## 🛠️ Technology Stack

- **Frontend**: React 19, Vite
- **Backend**: Node.js, Express, Socket.io
- **Styling**: Pure CSS with modern effects
- **Real-time**: Socket.io for WebSocket connections
- **Fonts**: Playfair Display + DM Sans (Google Fonts)

## 🚧 Future Enhancements

- [ ] Shape tools (rectangle, circle, line)
- [ ] Undo/Redo functionality
- [ ] Save/Export drawings as images
- [ ] Room system for private sessions
- [ ] Drawing layers
- [ ] More brush styles
- [ ] Image upload and placement
- [ ] User presence indicators
- [ ] Real Firebase/Auth0 integration

## 📄 License

MIT License - Feel free to use this project for learning and development!

