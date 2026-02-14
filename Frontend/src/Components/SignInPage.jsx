import { useState } from 'react';
import './SignInPage.css';

const SignInPage = ({ onSignIn, onBack }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleEmailSignIn = (e) => {
    e.preventDefault();
    // Validate fields
    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }
    if (isSignUp && !name) {
      alert('Please enter your name');
      return;
    }
    
    // Mock email sign-in
    const mockUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: name || email.split('@')[0],
      email: email,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email)}&background=6464ff&color=fff`
    };
    onSignIn(mockUser);
  };

  return (
    <div className="signin-page">
      <button className="back-button" onClick={onBack}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="signin-container">
        <div className="signin-box">
          <div className="signin-header">
            <div className="signin-logo">
              <svg viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="3" />
                <path d="M30 50 Q50 30, 70 50 Q50 70, 30 50" fill="currentColor" />
              </svg>
            </div>
            <h2>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
            <p>Start collaborating on your digital canvas</p>
          </div>

          <form className="signin-form" onSubmit={handleEmailSignIn}>
            {isSignUp && (
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={isSignUp}
                />
              </div>
            )}

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {!isSignUp && (
              <div className="form-extras">
                <label className="remember-me">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <button type="button" className="forgot-password">
                  Forgot password?
                </button>
              </div>
            )}

            <button type="submit" className="submit-button">
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <div className="signin-footer">
            <p>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button onClick={() => setIsSignUp(!isSignUp)}>
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="decoration-circle circle-1"></div>
        <div className="decoration-circle circle-2"></div>
        <div className="decoration-circle circle-3"></div>
      </div>
    </div>
  );
};

export default SignInPage;
