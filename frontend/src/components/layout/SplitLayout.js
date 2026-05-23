import React from 'react';
import { motion } from 'framer-motion';
import { IdentityPanel } from '../identity/IdentityPanel';
import Chat from '../chat/Chat';
import './SplitLayout.css';

export const SplitLayout = () => (
  <div className="split-layout">
    <motion.div
      className="split-identity"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <IdentityPanel />
    </motion.div>

    <motion.div
      className="split-chat"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Chat />
    </motion.div>
  </div>
);
