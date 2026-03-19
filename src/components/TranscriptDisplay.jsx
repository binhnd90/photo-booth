export default function TranscriptDisplay({ vietnamese, english, isTranslating }) {
  return (
    <div className="transcript-container">
      <div className="transcript-panel">
        <div className="transcript-lang">
          <span className="lang-flag">🇻🇳</span>
          <span className="lang-label">Vietnamese</span>
        </div>
        <div className="transcript-text">
          {vietnamese || (
            <span className="transcript-placeholder">Speak in Vietnamese…</span>
          )}
        </div>
      </div>

      <div className="transcript-arrow">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
        </svg>
      </div>

      <div className="transcript-panel">
        <div className="transcript-lang">
          <span className="lang-flag">🇺🇸</span>
          <span className="lang-label">English</span>
        </div>
        <div className="transcript-text">
          {isTranslating ? (
            <span className="transcript-translating">
              <span className="dot-flashing" />
              Translating
            </span>
          ) : english ? (
            english
          ) : (
            <span className="transcript-placeholder">Translation appears here…</span>
          )}
        </div>
      </div>
    </div>
  );
}
