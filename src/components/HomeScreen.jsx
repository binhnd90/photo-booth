import BrandLogo from './BrandLogo';

export default function HomeScreen({ onStart, onPractice, onNotebookLM, onConfigureAvatars }) {
  return (
    <div className="home-screen">
      {/* Hero — chunky rounded brand wordmark */}
      <div className="hero">
        <BrandLogo size={72} className="hero-logo" />
        <h1 className="hero-title">
          <span className="hero-line">speak</span>
          <span className="hero-line">English</span>
          <span className="hero-line">with <span className="hero-ai">Ai</span></span>
        </h1>
        <p className="hero-sub">Luyện nói · Dịch thuật · Trò chuyện thông minh</p>
      </div>

      {/* Actions */}
      <div className="home-actions">
        <button className="action-card action-card--primary" onClick={onPractice}>
          <div className="action-card-icon">🎤</div>
          <div className="action-card-body">
            <div className="action-card-title">Luyện Nói Tiếng Anh</div>
            <div className="action-card-sub">AI conversation · Sửa lỗi ngữ pháp</div>
          </div>
          <span className="action-card-arrow">→</span>
        </button>

        <button className="action-card action-card--blue" onClick={onStart}>
          <div className="action-card-icon">🗣️</div>
          <div className="action-card-body">
            <div className="action-card-title">Dịch VI ↔ EN</div>
            <div className="action-card-sub">Real-time bilingual translator</div>
          </div>
          <span className="action-card-arrow">→</span>
        </button>

        <button className="action-card action-card--amber" onClick={onNotebookLM}>
          <div className="action-card-icon">📓</div>
          <div className="action-card-body">
            <div className="action-card-title">NotebookLM Voice</div>
            <div className="action-card-sub">Talk to your Google notebooks</div>
          </div>
          <span className="action-card-arrow">→</span>
        </button>

        <button className="action-card action-card--ghost" onClick={onConfigureAvatars}>
          <div className="action-card-icon">🎨</div>
          <div className="action-card-body">
            <div className="action-card-title">Tuỳ chỉnh Avatar</div>
            <div className="action-card-sub">Customize your speaker avatars</div>
          </div>
          <span className="action-card-arrow">→</span>
        </button>
      </div>

      <div className="home-features">
        <div className="feature-chip">🎤 Voice</div>
        <div className="feature-chip">🔄 Bidirectional</div>
        <div className="feature-chip">🤖 Claude · GPT · Gemini</div>
      </div>
    </div>
  );
}
