import { useState } from 'react';
import Avatar from './Avatar';
import { AVATAR_PRESETS } from '../utils/avatarPresets';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

export default function AvatarConfigScreen({ currentConfig, onSave, onCancel }) {
  const [config, setConfig] = useState({ ...currentConfig });
  const { voices } = useSpeechSynthesis();

  const update = (patch) => setConfig((c) => ({ ...c, ...patch }));

  const handlePresetSelect = (preset) => {
    update({ emoji: preset.emoji, bgColor: preset.bgColor, imageUrl: null });
  };

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
        <button className="icon-btn" onClick={onCancel} aria-label="Cancel">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </button>
        <h2 className="config-title">Customize Avatar</h2>
        <button className="save-btn" onClick={() => onSave(config)}>
          Save
        </button>
      </div>

      {/* Live preview */}
      <div className="config-preview">
        <Avatar config={config} state="idle" />
      </div>

      {/* Name */}
      <div className="config-section">
        <label className="config-label">Name</label>
        <input
          className="config-input"
          value={config.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="Avatar name"
          maxLength={20}
        />
      </div>

      {/* Preset avatars */}
      <div className="config-section">
        <label className="config-label">Avatar Style</label>
        <div className="preset-grid">
          {AVATAR_PRESETS.map((preset) => (
            <button
              key={preset.id}
              className={`preset-item ${config.emoji === preset.emoji && !config.imageUrl ? 'preset-item--selected' : ''}`}
              onClick={() => handlePresetSelect(preset)}
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
            value={config.bgColor}
            onChange={(e) => update({ bgColor: e.target.value })}
          />
          <span className="color-value">{config.bgColor}</span>
        </div>
      </div>

      {/* Custom image */}
      <div className="config-section">
        <label className="config-label">Custom Photo</label>
        <div className="upload-row">
          <label className="btn-upload">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
            </svg>
            Upload Image
            <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
          </label>
          {config.imageUrl && (
            <button className="btn-remove" onClick={() => update({ imageUrl: null })}>
              Remove
            </button>
          )}
        </div>
      </div>

      {/* Voice selector */}
      <div className="config-section">
        <label className="config-label">English Voice</label>
        {voices.length === 0 ? (
          <p className="config-hint">No voices available on this device.</p>
        ) : (
          <select
            className="config-select"
            value={config.voiceURI || ''}
            onChange={(e) => update({ voiceURI: e.target.value || null })}
          >
            <option value="">System default</option>
            {voices.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name} ({v.lang}){v.localService ? ' ★' : ''}
              </option>
            ))}
          </select>
        )}
        <p className="config-hint">★ = local voice (works offline)</p>
      </div>

      {/* Bottom save */}
      <div className="config-footer">
        <button className="btn-primary" onClick={() => onSave(config)}>
          Save Changes
        </button>
      </div>
    </div>
  );
}
