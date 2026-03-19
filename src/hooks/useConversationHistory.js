import { useState, useCallback } from 'react';

/**
 * Each message shape:
 * { id, speakerName, lang: 'vi'|'en', original, translated, timestamp: Date }
 */
export function useConversationHistory() {
  const [messages, setMessages] = useState([]);

  const addMessage = useCallback(({ speakerName, lang, original, translated }) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), speakerName, lang, original, translated, timestamp: new Date() },
    ]);
  }, []);

  const clearHistory = useCallback(() => setMessages([]), []);

  const exportAsText = useCallback(
    (avatar1Name, avatar2Name) => {
      if (messages.length === 0) return;

      const header = [
        '╔══════════════════════════════════════════════╗',
        '║         CONVERSATION TRANSCRIPT              ║',
        `║  ${new Date().toLocaleString().padEnd(44)}║`,
        '╚══════════════════════════════════════════════╝',
        '',
      ].join('\n');

      const body = messages
        .map((msg) => {
          const time = msg.timestamp.toLocaleTimeString();
          const srcFlag = msg.lang === 'vi' ? '🇻🇳' : '🇺🇸';
          const dstFlag = msg.lang === 'vi' ? '🇺🇸' : '🇻🇳';
          return [
            `[${time}] ${msg.speakerName}`,
            `  ${srcFlag}  ${msg.original}`,
            `  ${dstFlag}  ${msg.translated}`,
            '',
          ].join('\n');
        })
        .join('\n');

      const footer = `\n──────────────────────────────────────────────\n${avatar1Name} (🇻🇳 Vietnamese) ↔ ${avatar2Name} (🇺🇸 English)\nExported by VoiceTranslate AI\n`;

      const content = header + body + footer;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversation-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [messages]
  );

  return { messages, addMessage, clearHistory, exportAsText };
}
