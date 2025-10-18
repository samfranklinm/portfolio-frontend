import React from 'react';

export const FooterText = () => {
  return (
    <div className="w-full p-4 mt-4">
      <p className="text-center text-sm font-light text-[#675f57] hover:text-[#332f2a] transition-all duration-200">
        © {new Date().getFullYear()} samfranklin.dev
      </p>
    </div>
  );
};