export default function RecordButton({ isListening, isDisabled, onToggle }) {
  return (
    <button
      className={`record-btn ${isListening ? 'record-btn--active' : ''}`}
      onClick={onToggle}
      disabled={isDisabled}
      aria-label={isListening ? 'Stop recording' : 'Start recording'}
    >
      <div className="record-btn__ripple" />
      <div className="record-btn__inner">
        {isListening ? (
          /* Stop icon */
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        ) : (
          /* Mic icon */
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        )}
      </div>
      <span className="record-btn__label">
        {isListening ? 'Stop' : 'Speak'}
      </span>
    </button>
  );
}
