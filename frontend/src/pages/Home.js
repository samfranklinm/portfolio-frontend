// src/pages/Home.js
import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import Chat from '../components/chat/Chat';
import { LogoLink } from '../components/logo/LogoLink';
import {FooterText} from '../components/footer/FooterText';

function Home() {
  const controls = useAnimation();

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
        duration: 1.2,
        ease: "easeOut"
      }
    },
    hideTexts: {
      opacity: 0,
      y: -100,
      transition: { 
        duration: 0.6,
        ease: "easeIn",
        delay: 0.5
      }
    }
  };

  const chatVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    showChat: {
      opacity: 1,
      scale: 1,
      transition: { 
        duration: 0.8,
        ease: "easeOut" 
      }
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-[#dbd8d5] to-[#8C8278]">
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(rgba(67, 62, 57, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(67, 62, 57, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px'
      }} />
      
      <LogoLink />
      <div className="absolute top-[20%] text-[#35312d] w-full max-w-3xl text-center px-4">
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
          className="text-xl text-[#35312d]-500 font-light"
        >
          I'm Sam. Nice to e-meet you.
        </motion.h2>
        <motion.h3
          variants={textVariants}
          initial="hidden"
          animate={controls}
          transition={{ delay: 1 }}
          className="text-md text-[#35312d]-300 font-light"
        >
          I'm sure you're eager to get to know me... Let's chat!
        </motion.h3>
      </div>
      <motion.div
        variants={chatVariants}
        initial="hidden"
        animate={controls}
        className="w-full text-[#35312d] lg:max-w-4xl h-[80vh] sm:h-[85vh] flex items-center justify-center px-2 sm:px-4 relative"
        style={{
          filter: 'drop-shadow(0 20px 40px rgba(67, 62, 57, 0.15))'
        }}
      >
        <Chat />
      </motion.div>
      <FooterText />
    </div>
  );
}

export default Home;