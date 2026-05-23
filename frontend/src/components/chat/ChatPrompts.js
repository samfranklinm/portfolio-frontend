import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ChatPrompts.css';

const PROMPTS = [
  { label: 'Career journey', text: 'Walk me through your career journey, highlighting key achievements at each role.' },
  { label: 'Technical skills', text: 'What are your core technical skills and how have you applied them in real projects?' },
  { label: 'Impactful project', text: 'Describe your most impactful project and the specific challenges you overcame.' },
  { label: 'Career goals', text: 'Where do you see your career heading and what excites you most about that path?' },
  { label: 'Contact info', text: "What's the best way to reach you for professional opportunities?" },
];

export const ChatPrompts = ({ visible, onSelect }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        className="chat-prompts"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        aria-label="Suggested questions"
      >
        {PROMPTS.map((p) => (
          <motion.button
            key={p.label}
            className="chat-prompt-chip"
            onClick={() => onSelect(p.text)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.12 }}
          >
            {p.label}
          </motion.button>
        ))}
      </motion.div>
    )}
  </AnimatePresence>
);
