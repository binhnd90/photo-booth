import { useState } from 'react';

const EMOJI_SUGGESTIONS = ['🗣️','📚','🏋️','🎮','🎵','🌍','💡','🏥','🏠','👔','🎓','🚀','💰','❤️','🍕','⚽'];

export default function CustomTopicModal({ topic, onSave, onCancel }) {
  const editing = !!topic;
  const [form, setForm] = useState({
    emoji:   topic?.emoji   || '🗣️',
    name:    topic?.name    || '',
    nameVi:  topic?.nameVi  || '',
    context: topic?.context || '',
    starter: topic?.starter || '',
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const valid = form.name.trim() && form.context.trim() && form.starter.trim();

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{editing ? 'Sửa kịch bản' : 'Tạo kịch bản mới'}</span>
          <button className="icon-btn" onClick={onCancel}>✕</button>
        </div>

        {/* Emoji */}
        <div className="modal-field">
          <label className="config-label">Biểu tượng</label>
          <div className="emoji-row">
            <input
              className="config-input emoji-input"
              value={form.emoji}
              onChange={(e) => set('emoji', e.target.value)}
              maxLength={4}
            />
            <div className="emoji-suggestions">
              {EMOJI_SUGGESTIONS.map((e) => (
                <button
                  key={e}
                  className={`emoji-chip ${form.emoji === e ? 'emoji-chip--active' : ''}`}
                  onClick={() => set('emoji', e)}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Names */}
        <div className="modal-field">
          <label className="config-label">Tên chủ đề (English) *</label>
          <input
            className="config-input"
            placeholder="e.g. Doctor Visit"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            maxLength={40}
          />
        </div>
        <div className="modal-field">
          <label className="config-label">Tên chủ đề (Tiếng Việt)</label>
          <input
            className="config-input"
            placeholder="vd. Khám bác sĩ"
            value={form.nameVi}
            onChange={(e) => set('nameVi', e.target.value)}
            maxLength={40}
          />
        </div>

        {/* Context */}
        <div className="modal-field">
          <label className="config-label">Mô tả kịch bản (cho AI) *</label>
          <textarea
            className="config-input config-textarea"
            placeholder="Describe the scenario, the AI's role, and what kind of conversation to have. Example: You are a doctor at a clinic. The user is a patient describing symptoms."
            value={form.context}
            onChange={(e) => set('context', e.target.value)}
            rows={3}
          />
        </div>

        {/* Starter */}
        <div className="modal-field">
          <label className="config-label">Câu mở đầu của AI *</label>
          <textarea
            className="config-input config-textarea"
            placeholder="The first thing the AI says to start the conversation. Example: Good morning! What brings you in today?"
            value={form.starter}
            onChange={(e) => set('starter', e.target.value)}
            rows={2}
          />
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onCancel}>Huỷ</button>
          <button
            className="btn-primary"
            disabled={!valid}
            onClick={() => onSave({ ...form, id: topic?.id || `custom-${Date.now()}`, custom: true })}
          >
            {editing ? 'Lưu thay đổi' : 'Tạo kịch bản'}
          </button>
        </div>
      </div>
    </div>
  );
}
