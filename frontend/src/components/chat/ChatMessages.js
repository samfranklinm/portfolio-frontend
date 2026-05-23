import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { ChatThinking } from './ChatThinking';
import './ChatMessages.css';

const mdComponents = {
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="chat-md-link">
      {children}
    </a>
  ),
  code: ({ inline, children }) =>
    inline ? (
      <code className="chat-md-code-inline">{children}</code>
    ) : (
      <pre className="chat-md-pre"><code>{children}</code></pre>
    ),
};

const BotMessage = ({ text }) => (
  <div className="chat-msg chat-msg--bot">
    <div className="chat-msg-accent" aria-hidden="true" />
    <div className="chat-msg-body">
      <div className="chat-md prose prose-sm max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSanitize]}
          components={mdComponents}
        >
          {text}
        </ReactMarkdown>
      </div>
      <p className="chat-msg-disclaimer">
        AI-generated — accuracy not guaranteed. Contact Sam for clarification.
      </p>
    </div>
  </div>
);

const UserMessage = ({ text }) => (
  <div className="chat-msg chat-msg--user">
    <div className="chat-msg-user-bubble">{text}</div>
  </div>
);

export const ChatMessages = ({ messages, currentText, isGenerating, statusIndex }) => {
  const endRef = useRef(null);

  useEffect(() => {
    const el = endRef.current;
    if (!el) return;
    const container = el.parentElement;
    const start = container.scrollTop;
    const end = container.scrollHeight - container.clientHeight;
    const duration = 400;
    const startTime = performance.now();

    const scroll = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      container.scrollTop = start + (end - start) * ease;
      if (progress < 1) requestAnimationFrame(scroll);
    };

    requestAnimationFrame(scroll);
  }, [messages, currentText, isGenerating]);

  return (
    <div
      className="chat-messages"
      role="log"
      aria-live="polite"
      aria-label="Conversation"
    >
      <AnimatePresence initial={false}>
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {msg.sender === 'user' ? (
              <UserMessage text={msg.text} />
            ) : (
              <BotMessage text={msg.text} />
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {currentText ? (
            <BotMessage text={currentText} />
          ) : (
            <ChatThinking statusIndex={statusIndex} />
          )}
        </motion.div>
      )}

      <div ref={endRef} />
    </div>
  );
};
