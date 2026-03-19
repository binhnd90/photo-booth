import { useState } from 'react';
import { BUILTIN_TOPICS, LEVELS, loadCustomTopics, saveCustomTopics } from '../hooks/useAIConversation';
import CustomTopicModal from './CustomTopicModal';

export default function TopicSelector({ selectedTopic, selectedLevel, onSelect, onStart }) {
  const [customTopics, setCustomTopics] = useState(() => loadCustomTopics());
  const [modal, setModal] = useState(null); // null | 'new' | { ...topic }

  const allTopics = [...BUILTIN_TOPICS, ...customTopics];

  const handleSaveCustom = (topic) => {
    const updated = customTopics.find((t) => t.id === topic.id)
      ? customTopics.map((t) => (t.id === topic.id ? topic : t))
      : [...customTopics, topic];
    setCustomTopics(updated);
    saveCustomTopics(updated);
    setModal(null);
    onSelect(topic, selectedLevel);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    const updated = customTopics.filter((t) => t.id !== id);
    setCustomTopics(updated);
    saveCustomTopics(updated);
    if (selectedTopic?.id === id) onSelect(BUILTIN_TOPICS[0], selectedLevel);
  };

  return (
    <>
      <div className="topic-selector">
        <p className="topic-selector-heading">Chọn chủ đề</p>
        <div className="topic-grid">
          {allTopics.map((t) => (
            <div key={t.id} className="topic-card-wrap">
              <button
                className={`topic-card ${selectedTopic?.id === t.id ? 'topic-card--active' : ''}`}
                onClick={() => onSelect(t, selectedLevel)}
              >
                <span className="topic-emoji">{t.emoji}</span>
                <span className="topic-name">{t.name}</span>
                {t.nameVi && <span className="topic-name-vi">{t.nameVi}</span>}
                {t.custom && <span className="topic-custom-badge">tuỳ chỉnh</span>}
              </button>
              {t.custom && (
                <div className="topic-card-actions">
                  <button
                    className="topic-action-btn"
                    onClick={(e) => { e.stopPropagation(); setModal(t); }}
                    title="Sửa"
                  >✏️</button>
                  <button
                    className="topic-action-btn topic-action-btn--delete"
                    onClick={(e) => handleDelete(e, t.id)}
                    title="Xoá"
                  >🗑️</button>
                </div>
              )}
            </div>
          ))}

          {/* Add custom button */}
          <button className="topic-card topic-card--add" onClick={() => setModal('new')}>
            <span className="topic-emoji">➕</span>
            <span className="topic-name">Tạo mới</span>
            <span className="topic-name-vi">Custom</span>
          </button>
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

      {modal && (
        <CustomTopicModal
          topic={modal === 'new' ? null : modal}
          onSave={handleSaveCustom}
          onCancel={() => setModal(null)}
        />
      )}
    </>
  );
}
