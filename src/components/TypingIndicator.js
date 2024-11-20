// src/components/TypingIndicator.js
import React from 'react';

const TypingIndicator = () => {
  return (
    <div className="flex space-x-1 p-2">
      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
    </div>
  );
};

export default TypingIndicator;