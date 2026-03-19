import Avatar from './Avatar';

export default function HomeScreen({ avatar1, avatar2, onStart, onPractice, onConfigureAvatars }) {
  return (
    <div className="home-screen">
      <header className="home-header">
        <h1 className="home-title">
          Voice<span className="home-title-accent">Translate</span>
        </h1>
        <p className="home-subtitle">Real-time Bilingual Conversation</p>
        <div className="home-badge">AI-Powered · On-Device</div>
      </header>

      {/* Two avatars preview */}
      <div className="home-duo">
        <div className="home-duo-side">
          <Avatar config={avatar1} state="idle" />
          <span className="home-duo-lang">🇻🇳 Vietnamese</span>
        </div>

        <div className="home-duo-vs">
          <div className="home-duo-arrow">↔</div>
          <div className="home-duo-label">translates</div>
        </div>

        <div className="home-duo-side">
          <Avatar config={avatar2} state="idle" />
          <span className="home-duo-lang">🇺🇸 English</span>
        </div>
      </div>

      <div className="home-actions">
        <button className="btn-primary" onClick={onStart}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
          Dịch VI ↔ EN
        </button>

        {/* Practice mode — prominent card */}
        <button className="practice-home-card" onClick={onPractice}>
          <div className="practice-home-card-left">
            <span className="practice-home-icon">🎓</span>
            <div>
              <div className="practice-home-title">Luyện Nói Tiếng Anh</div>
              <div className="practice-home-sub">AI conversation partner · Sửa lỗi ngữ pháp</div>
            </div>
          </div>
          <span className="practice-home-arrow">→</span>
        </button>

        <button className="btn-secondary" onClick={onConfigureAvatars}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
          </svg>
          Tuỳ chỉnh Avatar
        </button>
      </div>

      <div className="home-features">
        <div className="feature-chip">🎤 Voice input</div>
        <div className="feature-chip">🔄 Bidirectional</div>
        <div className="feature-chip">💾 Save history</div>
        <div className="feature-chip">🤖 Claude AI</div>
      </div>
    </div>
  );
}
