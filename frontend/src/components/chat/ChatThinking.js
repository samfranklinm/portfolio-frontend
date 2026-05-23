import React from 'react';
import { motion } from 'framer-motion';
import './ChatThinking.css';

const STATUS_MESSAGES = [
  'Analyzing resume context…',
  'Processing your question…',
  'Generating response…',
];

export const ChatThinking = ({ statusIndex = 0 }) => (
  <motion.div
    className="chat-thinking"
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -4 }}
    transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
    aria-live="polite"
    aria-label="Generating response"
  >
    <div className="chat-thinking-dots">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="chat-thinking-dot"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.18,
          }}
        />
      ))}
    </div>
    <span className="chat-thinking-label">
      {STATUS_MESSAGES[statusIndex % STATUS_MESSAGES.length]}
    </span>
  </motion.div>
);
