import React from 'react';

export const FooterText = () => {
  return (
    <div className="w-full p-4 mt-4">
      <p className="text-center text-sm font-light transition-all duration-200" style={{ 
        color: '#858585',
        fontFamily: "'Fira Code', monospace"
      }}>
        © {new Date().getFullYear()} samfranklin.dev
      </p>
    </div>
  );
};