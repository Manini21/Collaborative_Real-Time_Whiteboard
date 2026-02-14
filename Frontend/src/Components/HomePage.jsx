import { useEffect, useRef } from 'react';
import './HomePage.css';

const HomePage = ({ onNavigateToSignIn }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create dot grid
    const spacing = 40;
    const dotRadius = 2;
    const dots = [];

    for (let x = 0; x < canvas.width; x += spacing) {
      for (let y = 0; y < canvas.height; y += spacing) {
        dots.push({ x, y, baseX: x, baseY: y });
      }
    }

    // Mouse interaction
    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    // Animation
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      dots.forEach(dot => {
        const dx = mouseX - dot.x;
        const dy = mouseY - dot.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 150;

        if (distance < maxDistance) {
          const force = (maxDistance - distance) / maxDistance;
          dot.x = dot.baseX + dx * force * 0.3;
          dot.y = dot.baseY + dy * force * 0.3;
        } else {
          dot.x += (dot.baseX - dot.x) * 0.1;
          dot.y += (dot.baseY - dot.y) * 0.1;
        }

        const opacity = distance < maxDistance ? 0.8 : 0.3;
        ctx.fillStyle = `rgba(100, 100, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="homepage">
      <canvas ref={canvasRef} className="dot-canvas" />
      
      {/* Floating Objects */}
      <div className="floating-object quill">
        <svg viewBox="0 0 100 100" fill="none">
          <path d="M50 10 Q30 30, 40 60 L45 90 L50 60 Q70 30, 50 10Z" fill="currentColor" />
        </svg>
      </div>
      
      <div className="floating-object inkpot">
        <svg viewBox="0 0 100 100" fill="none">
          <rect x="30" y="40" width="40" height="40" rx="5" fill="currentColor" />
          <circle cx="50" cy="30" r="15" fill="currentColor" />
        </svg>
      </div>

      <div className="floating-object palette">
        <svg viewBox="0 0 100 100" fill="none">
          <ellipse cx="50" cy="50" rx="35" ry="30" fill="currentColor" />
          <circle cx="40" cy="40" r="5" fill="white" />
          <circle cx="60" cy="40" r="5" fill="white" />
          <circle cx="50" cy="55" r="5" fill="white" />
        </svg>
      </div>

      <div className="floating-object brush">
        <svg viewBox="0 0 100 100" fill="none">
          <rect x="45" y="10" width="10" height="50" fill="currentColor" />
          <path d="M40 60 L50 90 L60 60 Z" fill="currentColor" />
        </svg>
      </div>

      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-left">
          <button className="nav-link">About</button>
          <button className="nav-link">Features</button>
        </div>
        
        <div className="nav-center">
          <div className="logo">
            <svg viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="3" />
              <path d="M30 50 Q50 30, 70 50 Q50 70, 30 50" fill="currentColor" />
            </svg>
            <span>DrawSync</span>
          </div>
        </div>
        
        <div className="nav-right">
          <button className="nav-link" onClick={onNavigateToSignIn}>Sign In</button>
          <button className="btn-primary" onClick={onNavigateToSignIn}>Get Started</button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero">
        <h1 className="hero-title">
          <span className="title-line">Create</span>
          <span className="title-line gradient-text">Together</span>
          <span className="title-line">In Real-Time</span>
        </h1>
        <p className="hero-subtitle">
          A collaborative whiteboard that brings your ideas to life
        </p>
        <button className="btn-hero" onClick={onNavigateToSignIn}>
          Start Drawing
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default HomePage;
