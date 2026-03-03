import Avatar from './Avatar';

export default function HomeScreen({ avatarConfig, onStart, onConfigureAvatar }) {
  return (
    <div className="home-screen">
      <header className="home-header">
        <h1 className="home-title">
          Voice<span className="home-title-accent">Translate</span>
        </h1>
        <p className="home-subtitle">Vietnamese → American English</p>
        <div className="home-badge">AI-Powered · Local Model</div>
      </header>

      <div className="home-avatar-area">
        <Avatar config={avatarConfig} state="idle" />
      </div>

      <div className="home-actions">
        <button className="btn-primary" onClick={onStart}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
          Start Translating
        </button>

        <button className="btn-secondary" onClick={onConfigureAvatar}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
          </svg>
          Customize Avatar
        </button>
      </div>

      <div className="home-features">
        <div className="feature-chip">🎤 Real-time voice input</div>
        <div className="feature-chip">🤖 On-device AI</div>
        <div className="feature-chip">🔊 Natural TTS output</div>
      </div>
    </div>
  );
}
