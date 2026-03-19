import { TOPICS, LEVELS } from '../hooks/useClaudeConversation';

export default function TopicSelector({ selectedTopic, selectedLevel, onSelect, onStart }) {
  return (
    <div className="topic-selector">
      <p className="topic-selector-heading">Chọn chủ đề</p>
      <div className="topic-grid">
        {TOPICS.map((t) => (
          <button
            key={t.id}
            className={`topic-card ${selectedTopic?.id === t.id ? 'topic-card--active' : ''}`}
            onClick={() => onSelect(t, selectedLevel)}
          >
            <span className="topic-emoji">{t.emoji}</span>
            <span className="topic-name">{t.name}</span>
            <span className="topic-name-vi">{t.nameVi}</span>
          </button>
        ))}
      </div>

      <p className="topic-selector-heading" style={{ marginTop: '16px' }}>Trình độ</p>
      <div className="level-row">
        {LEVELS.map((l) => (
          <button
            key={l.id}
            className={`level-btn ${selectedLevel?.id === l.id ? 'level-btn--active' : ''}`}
            onClick={() => onSelect(selectedTopic, l)}
          >
            <span className="level-label">{l.label}</span>
            <span className="level-vi">{l.labelVi}</span>
          </button>
        ))}
      </div>

      <button
        className="btn-primary practice-start-btn"
        disabled={!selectedTopic || !selectedLevel}
        onClick={onStart}
      >
        Bắt đầu luyện tập →
      </button>
    </div>
  );
}
