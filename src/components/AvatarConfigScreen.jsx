import { useState } from 'react';
import Avatar from './Avatar';
import { AVATAR_PRESETS } from '../utils/avatarPresets';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

export default function AvatarConfigScreen({ avatar1, avatar2, onSave, onCancel }) {
  const [tab, setTab] = useState(1); // 1 = VI avatar, 2 = EN avatar
  const [cfg1, setCfg1] = useState({ ...avatar1 });
  const [cfg2, setCfg2] = useState({ ...avatar2 });

  const { voicesFor } = useSpeechSynthesis();

  const cfg = tab === 1 ? cfg1 : cfg2;
  const setcfg = tab === 1 ? setCfg1 : setCfg2;
  const update = (patch) => setcfg((c) => ({ ...c, ...patch }));

  const voiceList = voicesFor(cfg.lang || (tab === 1 ? 'vi' : 'en'));

  const handlePreset = (preset) => update({ emoji: preset.emoji, bgColor: preset.bgColor, imageUrl: null });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => update({ imageUrl: ev.target.result });
    reader.readAsDataURL(file);
  };

  return (
    <div className="config-screen">
      {/* Header */}
      <div className="config-header">
        <button className="icon-btn" onClick={onCancel}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </button>
        <h2 className="config-title">Customize Avatars</h2>
        <button className="save-btn" onClick={() => onSave(cfg1, cfg2)}>Save</button>
      </div>

      {/* Avatar tabs */}
      <div className="avatar-tabs">
        <button
          className={`avatar-tab ${tab === 1 ? 'avatar-tab--active' : ''}`}
          onClick={() => setTab(1)}
        >
          <span>{cfg1.emoji}</span>
          <span>{cfg1.name}</span>
          <span className="tab-lang">🇻🇳 VI</span>
        </button>
        <button
          className={`avatar-tab ${tab === 2 ? 'avatar-tab--active' : ''}`}
          onClick={() => setTab(2)}
        >
          <span>{cfg2.emoji}</span>
          <span>{cfg2.name}</span>
          <span className="tab-lang">🇺🇸 EN</span>
        </button>
      </div>

      {/* Live preview */}
      <div className="config-preview">
        <Avatar config={cfg} state="idle" />
      </div>

      {/* Name */}
      <div className="config-section">
        <label className="config-label">Name</label>
        <input
          className="config-input"
          value={cfg.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="Avatar name"
          maxLength={20}
        />
      </div>

      {/* Preset grid */}
      <div className="config-section">
        <label className="config-label">Avatar Style</label>
        <div className="preset-grid">
          {AVATAR_PRESETS.map((preset) => (
            <button
              key={preset.id}
              className={`preset-item ${cfg.emoji === preset.emoji && !cfg.imageUrl ? 'preset-item--selected' : ''}`}
              onClick={() => handlePreset(preset)}
              style={{ '--preset-bg': preset.bgColor }}
              title={preset.name}
            >
              <span className="preset-emoji">{preset.emoji}</span>
              <span className="preset-name">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Background color */}
      <div className="config-section">
        <label className="config-label">Background Color</label>
        <div className="color-row">
          <input
            type="color"
            className="color-picker"
            value={cfg.bgColor}
            onChange={(e) => update({ bgColor: e.target.value })}
          />
          <span className="color-value">{cfg.bgColor}</span>
        </div>
      </div>

      {/* Upload */}
      <div className="config-section">
        <label className="config-label">Custom Photo</label>
        <div className="upload-row">
          <label className="btn-upload">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
            </svg>
            Upload Photo
            <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
          </label>
          {cfg.imageUrl && (
            <button className="btn-remove" onClick={() => update({ imageUrl: null })}>Remove</button>
          )}
        </div>
      </div>

      {/* Voice */}
      <div className="config-section">
        <label className="config-label">
          Voice {tab === 1 ? '(Vietnamese 🇻🇳)' : '(English 🇺🇸)'}
        </label>
        {voiceList.length === 0 ? (
          <p className="config-hint">No {tab === 1 ? 'Vietnamese' : 'English'} voices found on this device.</p>
        ) : (
          <select
            className="config-select"
            value={cfg.voiceURI || ''}
            onChange={(e) => update({ voiceURI: e.target.value || null })}
          >
            <option value="">System default</option>
            {voiceList.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name} ({v.lang}){v.localService ? ' ★' : ''}
              </option>
            ))}
          </select>
        )}
        <p className="config-hint">★ = local (works offline)</p>
      </div>

      <div className="config-footer">
        <button className="btn-primary" onClick={() => onSave(cfg1, cfg2)}>Save Changes</button>
      </div>
    </div>
  );
}
