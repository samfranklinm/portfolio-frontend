// src/pages/Home.js
import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import Chat from '../components/chat/Chat';
import { LogoLink } from '../components/logo/LogoLink';
import {FooterText} from '../components/footer/FooterText';

function Home() {
  const controls = useAnimation();
  const logoControls = useAnimation();

  useEffect(() => {
    const sequence = async () => {
      // Animate logo in
      logoControls.start({
        opacity: 1,
        scale: 1,
        transition: { duration: 0.8, ease: "easeOut" }
      });
      
      // Show texts in sequence
      await controls.start('showTexts');
      // Hold position
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Hide texts
      await controls.start('hideTexts');
      
      // Slide logo to top left
      await logoControls.start({
        x: 0,
        y: 0,
        scale: 0.7,
        transition: { duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }
      });
      
      // Show chat
      await controls.start('showChat');
    };
    sequence();
  }, [controls, logoControls]);

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
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-6" style={{
      backgroundColor: '#1e1e1e'
    }}>
      <LogoLink />
      <div className="absolute top-[20%] w-full max-w-3xl text-center px-4 pointer-events-none" style={{ color: '#cccccc' }}>
        <motion.h1
          variants={textVariants}
          initial="hidden"
          animate={controls}
          className="text-3xl sm:text-5xl font-light mb-4 tracking-tight"
          style={{ fontFamily: "'Fira Code', monospace" }}
        >
          You made it!
        </motion.h1>
        <motion.h2
          variants={textVariants}
          initial="hidden"
          animate={controls}
          transition={{ delay: 0.5 }}
          className="text-xl font-light"
          style={{ color: '#cccccc', fontFamily: "'Fira Code', monospace" }}
        >
          I'm Sam. Nice to e-meet you.
        </motion.h2>
        <motion.h3
          variants={textVariants}
          initial="hidden"
          animate={controls}
          transition={{ delay: 1 }}
          className="text-md font-light"
          style={{ color: '#858585', fontFamily: "'Fira Code', monospace" }}
        >
          I'm sure you're eager to get to know me... Let's chat!
        </motion.h3>
      </div>
      <motion.div
        variants={chatVariants}
        initial="hidden"
        animate={controls}
        className="w-full lg:max-w-[1400px] h-[80vh] sm:h-[85vh] flex items-center justify-center px-2 sm:px-4 relative"
      >
        <Chat />
      </motion.div>
      <FooterText />
    </div>
  );
}

export default Home;