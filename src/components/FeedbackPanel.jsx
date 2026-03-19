export default function FeedbackPanel({ feedback }) {
  if (!feedback) return null;

  const { score, corrections, praise, tip, new_word } = feedback;
  const hasCorrections = corrections && corrections.length > 0;

  const scoreColor =
    score >= 80 ? '#43e97b' :
    score >= 60 ? '#f9c74f' : '#f72585';

  return (
    <div className="feedback-panel">
      <div className="feedback-header">
        <span className="feedback-title">📝 Nhận xét</span>
        {score != null && (
          <div className="feedback-score" style={{ '--score-color': scoreColor }}>
            <svg viewBox="0 0 36 36" width="44" height="44">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke={scoreColor} strokeWidth="3"
                strokeDasharray={`${score} ${100 - score}`}
                strokeDashoffset="25"
                strokeLinecap="round"
              />
            </svg>
            <span className="score-num" style={{ color: scoreColor }}>{score}</span>
          </div>
        )}
      </div>

      {/* Praise */}
      {praise && (
        <div className="feedback-item feedback-item--praise">
          <span className="feedback-icon">✅</span>
          <span>{praise}</span>
        </div>
      )}

      {/* Corrections */}
      {hasCorrections && (
        <div className="feedback-corrections">
          <p className="feedback-sub">Sửa lỗi:</p>
          {corrections.map((c, i) => (
            <div key={i} className="correction-row">
              <div className="correction-wrong">
                <span className="corr-icon">✗</span>
                <span>{c.original}</span>
              </div>
              <div className="correction-right">
                <span className="corr-icon">✓</span>
                <span>{c.corrected}</span>
              </div>
              {c.explanation && (
                <div className="correction-explain">{c.explanation}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {!hasCorrections && (
        <div className="feedback-item feedback-item--perfect">
          <span className="feedback-icon">🎯</span>
          <span>English chính xác!</span>
        </div>
      )}

      {/* Tip */}
      {tip && (
        <div className="feedback-item feedback-item--tip">
          <span className="feedback-icon">💡</span>
          <span>{tip}</span>
        </div>
      )}

      {/* New word */}
      {new_word && (
        <div className="feedback-word">
          <span className="feedback-icon">📖</span>
          <div>
            <span className="word-word">{new_word.word}</span>
            <span className="word-meaning"> — {new_word.meaning}</span>
            {new_word.example && (
              <div className="word-example">"{new_word.example}"</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
