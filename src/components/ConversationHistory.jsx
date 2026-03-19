import { useEffect, useRef } from 'react';
import ConversationBubble from './ConversationBubble';

export default function ConversationHistory({ messages, avatar1, avatar2 }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-history">
      {messages.length === 0 ? (
        <div className="chat-empty">
          <p className="chat-empty-icon">💬</p>
          <p className="chat-empty-title">Start a conversation</p>
          <p className="chat-empty-hint">
            Tap <strong>🇻🇳 Nói</strong> to speak Vietnamese<br />
            Tap <strong>🇺🇸 Speak</strong> to speak English
          </p>
        </div>
      ) : (
        messages.map((msg) => (
          <ConversationBubble key={msg.id} message={msg} avatar1={avatar1} avatar2={avatar2} />
        ))
      )}
      <div ref={endRef} />
    </div>
  );
}
