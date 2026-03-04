export default function Avatar({ config, state = 'idle' }) {
  // state: 'idle' | 'listening' | 'translating' | 'speaking'
  return (
    <div className={`avatar-wrapper avatar-state-${state}`}>
      {/* Outer animated ring */}
      <div className="avatar-ring" />

      {/* Avatar circle */}
      <div
        className="avatar-circle"
        style={{ background: config.bgColor }}
      >
        {config.imageUrl ? (
          <img src={config.imageUrl} alt={config.name} className="avatar-img" />
        ) : (
          <span className="avatar-emoji">{config.emoji}</span>
        )}
      </div>

      {/* Sound bars shown while speaking */}
      {state === 'speaking' && (
        <div className="sound-bars">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={`sound-bar sound-bar-${i}`} />
          ))}
        </div>
      )}

      {/* Avatar name */}
      <div className="avatar-name">{config.name}</div>

      {/* State label */}
      {state !== 'idle' && (
        <div className="avatar-state-label">
          {state === 'listening' && '🎤 Listening...'}
          {state === 'translating' && '⚙️ Translating...'}
          {state === 'speaking' && '🔊 Speaking...'}
        </div>
      )}
    </div>
  );
}
