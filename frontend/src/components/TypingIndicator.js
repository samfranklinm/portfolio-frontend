// src/components/TypingIndicator.js
import React from 'react';

const TypingIndicator = () => {
  return (
    <div className="flex space-x-1 p-2">
      <div className="w-2 h-2 rounded-full animate-bounce [animation-delay:-0.3s]" style={{ backgroundColor: '#433e39' }}></div>
      <div className="w-2 h-2 rounded-full animate-bounce [animation-delay:-0.15s]" style={{ backgroundColor: '#676259' }}></div>
      <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#8b8680' }}></div>
    </div>
  );
};

export default TypingIndicator;