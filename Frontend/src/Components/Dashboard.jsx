import { useState } from 'react';
import './Dashboard.css';

const Dashboard = ({ user, recentRooms = [], onCreateRoom, onJoinRoom, onSignOut }) => {
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [roomCode, setRoomCode] = useState('');

  const handleCreateRoom = () => {
    // Generate unique room code
    const code = Math.random().toString(36).substr(2, 6).toUpperCase();
    onCreateRoom(code);
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!roomCode.trim()) {
      alert('Please enter a room code');
      return;
    }
    onJoinRoom(roomCode.toUpperCase());
  };

  const handleQuickJoin = (code) => {
    onJoinRoom(code);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="dashboard-page">
      {/* Background decorative elements */}
      <div className="dashboard-bg-circle circle-1"></div>
      <div className="dashboard-bg-circle circle-2"></div>
      <div className="dashboard-bg-circle circle-3"></div>

      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-logo">
          <svg viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="3" />
            <path d="M30 50 Q50 30, 70 50 Q50 70, 30 50" fill="currentColor" />
          </svg>
          <span>DrawSync</span>
        </div>
        <button className="sign-out-button" onClick={onSignOut}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
          Sign Out
        </button>
      </header>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* User Profile Card */}
        <div className="profile-card">
          <div className="profile-avatar-large">
            <img src={user.avatar} alt={user.name} />
          </div>
          <h2 className="profile-name">{user.name}</h2>
          <p className="profile-email">{user.email}</p>
        </div>

        {/* Actions */}
        <div className="dashboard-actions">
          <div className="action-card create-room-card" onClick={handleCreateRoom}>
            <div className="action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
            </div>
            <h3>Create Room</h3>
            <p>Start a new collaborative whiteboard session</p>
          </div>

          <div className="action-card join-room-card" onClick={() => setShowJoinModal(true)}>
            <div className="action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M13.8 12H3"/>
              </svg>
            </div>
            <h3>Join Room</h3>
            <p>Enter a room code to join an existing session</p>
          </div>
        </div>

        {/* Recent Rooms Section */}
        <div className="recent-rooms">
          <h3 className="section-title">Recent Rooms</h3>
          {recentRooms.length > 0 ? (
            <div className="room-list">
              {recentRooms.map((room) => (
                <div key={room.code} className="room-card" onClick={() => handleQuickJoin(room.code)}>
                  <div className="room-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                    </svg>
                  </div>
                  <div className="room-info">
                    <h4>{room.name}</h4>
                    <p className="room-code">Code: {room.code}</p>
                    <p className="room-time">{formatDate(room.lastAccessed)}</p>
                  </div>
                  <div className="room-arrow">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
              </svg>
              <p>No recent rooms yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Join Room Modal */}
      {showJoinModal && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Join Room</h3>
              <button className="modal-close" onClick={() => setShowJoinModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleJoinRoom}>
              <div className="modal-body">
                <label>Enter Room Code</label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="e.g., ABC123"
                  maxLength="6"
                  autoFocus
                />
                <p className="modal-hint">Ask the room creator for the 6-character code</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowJoinModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-join">
                  Join Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
