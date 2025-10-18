// src/pages/Home.js
import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import Chat from '../components/chat/Chat';
import { LogoLink } from '../components/logo/LogoLink';
import {FooterText} from '../components/footer/FooterText';

function Home() {
  const controls = useAnimation();
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    const sequence = async () => {
      // Show texts in sequence
      await controls.start('showTexts');
      // Hold position
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Hide texts
      await controls.start('hideTexts');
      // Show chat
      await controls.start('showChat');
    };
    sequence();
  }, [controls]);

  const textVariants = {
    hidden: { 
      opacity: 0, 
      y: -200
    },
    showTexts: {
      opacity: 1,
      y: 50,
      transition: { 
        duration: 1,
        ease: [0.25, 0.1, 0.25, 1]
      }
    },
    hideTexts: {
      opacity: 0,
      y: -100,
      scale: 0.98,
      transition: { 
        duration: 0.5,
        ease: [0.43, 0.13, 0.23, 0.96],
        delay: 0.3
      }
    }
  };

  const chatVariants = {
    hidden: { opacity: 0, scale: 0.96, y: 10 },
    showChat: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { 
        duration: 0.7,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  return (
    <div className={`relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 transition-colors duration-500 ${
      darkMode 
        ? 'bg-gradient-to-b from-[#1a1816] to-[#2d2a26]'
        : 'bg-gradient-to-b from-[#dbd8d5] to-[#8C8278]'
    }`}>
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(rgba(67, 62, 57, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(67, 62, 57, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px'
      }} />
      
      {/* Dark Mode Toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className={`fixed top-4 right-4 sm:top-6 sm:right-6 z-50 p-2.5 sm:p-3 rounded-full transition-all duration-300 ${
          darkMode 
            ? 'bg-[#3d3a36] text-[#f5f3f0] hover:bg-[#4d4a46]'
            : 'bg-white/30 text-[#433e39] hover:bg-white/50'
        }`}
        style={{
          boxShadow: darkMode 
            ? '0 4px 12px rgba(0, 0, 0, 0.3)'
            : '0 4px 12px rgba(140, 130, 120, 0.2)',
          backdropFilter: 'blur(10px)'
        }}
        aria-label="Toggle dark mode"
      >
        {darkMode ? (
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </button>
      
      <LogoLink />
      <div className={`absolute top-[20%] w-full max-w-3xl text-center px-4 transition-colors duration-500 ${
        darkMode ? 'text-[#e7e5e2]' : 'text-[#35312d]'
      }`}>
        <motion.h1
          variants={textVariants}
          initial="hidden"
          animate={controls}
          className="text-3xl sm:text-5xl font-light mb-4 tracking-tight"
        >
          You made it!
        </motion.h1>
        <motion.h2
          variants={textVariants}
          initial="hidden"
          animate={controls}
          transition={{ delay: 0.5 }}
          className={`text-xl font-light ${darkMode ? 'text-[#e7e5e2]' : 'text-[#35312d]'}`}
        >
          I'm Sam. Nice to e-meet you.
        </motion.h2>
        <motion.h3
          variants={textVariants}
          initial="hidden"
          animate={controls}
          transition={{ delay: 1 }}
          className={`text-md font-light ${darkMode ? 'text-[#c7c5c2]' : 'text-[#35312d]'}`}
        >
          I'm sure you're eager to get to know me... Let's chat!
        </motion.h3>
      </div>
      <motion.div
        variants={chatVariants}
        initial="hidden"
        animate={controls}
        className={`w-full lg:max-w-4xl h-[80vh] sm:h-[85vh] flex items-center justify-center px-2 sm:px-4 relative transition-colors duration-500 ${
          darkMode ? 'text-[#e7e5e2]' : 'text-[#35312d]'
        }`}
        style={{
          filter: 'drop-shadow(0 20px 40px rgba(67, 62, 57, 0.15))'
        }}
      >
        <Chat darkMode={darkMode} />
      </motion.div>
      <FooterText />
    </div>
  );
}

export default Home;