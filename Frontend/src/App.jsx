import { useState, useEffect } from 'react';
import HomePage from './Components/HomePage';
import SignInPage from './Components/SignInPage';
import Dashboard from './Components/Dashboard';
import Canvas from './Components/Canvas';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home'); // 'home', 'signin', 'dashboard', 'canvas'
  const [user, setUser] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [recentRooms, setRecentRooms] = useState([]);

  // Load recent rooms from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('recentRooms');
    if (saved) {
      setRecentRooms(JSON.parse(saved));
    }
  }, []);

  const handleSignIn = (userData) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleCreateRoom = (roomCode) => {
    const roomData = {
      code: roomCode,
      name: `Room ${roomCode}`,
      createdAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString()
    };
    
    // Add to recent rooms
    const updatedRooms = [roomData, ...recentRooms.filter(r => r.code !== roomCode)].slice(0, 5);
    setRecentRooms(updatedRooms);
    localStorage.setItem('recentRooms', JSON.stringify(updatedRooms));
    
    setCurrentRoom(roomCode);
    setCurrentPage('canvas');
  };

  const handleJoinRoom = (roomCode) => {
    const roomData = {
      code: roomCode,
      name: `Room ${roomCode}`,
      createdAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString()
    };
    
    // Add to recent rooms
    const updatedRooms = [roomData, ...recentRooms.filter(r => r.code !== roomCode)].slice(0, 5);
    setRecentRooms(updatedRooms);
    localStorage.setItem('recentRooms', JSON.stringify(updatedRooms));
    
    setCurrentRoom(roomCode);
    setCurrentPage('canvas');
  };

  const handleLeaveRoom = () => {
    setCurrentRoom(null);
    setCurrentPage('dashboard');
  };

  const handleSignOut = () => {
    setUser(null);
    setCurrentRoom(null);
    setCurrentPage('home');
  };

  return (
    <div className="App">
      {currentPage === 'home' && (
        <HomePage onNavigateToSignIn={() => setCurrentPage('signin')} />
      )}
      {currentPage === 'signin' && (
        <SignInPage 
          onSignIn={handleSignIn}
          onBack={() => setCurrentPage('home')}
        />
      )}
      {currentPage === 'dashboard' && user && (
        <Dashboard
          user={user}
          recentRooms={recentRooms}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onSignOut={handleSignOut}
        />
      )}
      {currentPage === 'canvas' && user && currentRoom && (
        <Canvas 
          user={user} 
          roomCode={currentRoom}
          onLeaveRoom={handleLeaveRoom}
          onSignOut={handleSignOut}
        />
      )}
    </div>
  );
}

export default App;
