import React from 'react';

export const FooterText = () => {
  return (
    <div className="w-full p-4 mt-4">
      <p className="text-center text-sm font-light text-agent-light/40 hover:text-agent-light/60 transition-all duration-200">
        © {new Date().getFullYear()} samfranklin.dev • Powered by AI
      </p>
    </div>
  );
};
