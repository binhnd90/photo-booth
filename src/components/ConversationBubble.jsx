// isLeft = true  → Vietnamese speaker (avatar1), bubble on left
// isLeft = false → English  speaker (avatar2), bubble on right
export default function ConversationBubble({ message, avatar1, avatar2 }) {
  const isLeft = message.lang === 'vi';
  const cfg = isLeft ? avatar1 : avatar2;

  const srcFlag = isLeft ? '🇻🇳' : '🇺🇸';
  const dstFlag = isLeft ? '🇺🇸' : '🇻🇳';

  const time = message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`bubble-row ${isLeft ? 'bubble-row--left' : 'bubble-row--right'}`}>
      {/* Avatar chip */}
      <div
        className="bubble-avatar"
        style={{ background: cfg.bgColor }}
        aria-label={cfg.name}
      >
        {cfg.imageUrl
          ? <img src={cfg.imageUrl} alt={cfg.name} className="bubble-avatar-img" />
          : <span>{cfg.emoji}</span>
        }
      </div>

      {/* Bubble body */}
      <div className={`bubble ${isLeft ? 'bubble--left' : 'bubble--right'}`}>
        <div className="bubble-header">
          <span className="bubble-name">{cfg.name}</span>
          <span className="bubble-time">{time}</span>
        </div>

        <div className="bubble-original">
          <span className="bubble-flag">{srcFlag}</span>
          {message.original}
        </div>

        <div className="bubble-translated">
          <span className="bubble-flag">{dstFlag}</span>
          {message.translated}
        </div>
      </div>
    </div>
  );
}
