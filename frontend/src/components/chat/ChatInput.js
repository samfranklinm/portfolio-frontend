import React, { useEffect, useRef } from 'react';
import './ChatInput.css';

export const ChatInput = ({ value, onChange, onSend, onStop, isGenerating }) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isGenerating) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="chat-input-wrap">
      <textarea
        ref={textareaRef}
        className="chat-input-textarea"
        placeholder="Ask about Sam's professional life…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isGenerating}
        rows={1}
        aria-label="Chat input"
        aria-multiline="true"
      />
      <button
        className={`chat-input-btn ${isGenerating ? 'chat-input-btn--stop' : ''}`}
        onClick={isGenerating ? onStop : onSend}
        disabled={!isGenerating && !value.trim()}
        aria-label={isGenerating ? 'Stop generation' : 'Send message'}
      >
        {isGenerating ? (
          <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14" aria-hidden="true">
            <rect x="4" y="4" width="12" height="12" rx="1" />
          </svg>
        ) : (
          <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14" aria-hidden="true">
            <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
          </svg>
        )}
      </button>
    </div>
  );
};
