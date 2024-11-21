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
    hidden: { opacity: 0, y: -200},
    showTexts: {
      opacity: 1,
      y: 350,
      transition: { 
        duration: 2,
        ease: "easeOut"
      }
    },
    hideTexts: {
      opacity: 0,
      y: 0,
      transition: { 
        duration: 0.8,
        ease: "easeIn",
        delay: 1
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
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#dbd8d5] to-[#8C8278]">
      <LogoLink />
      <div className="text-[#35312d] w-100 max-w-3xl text-center mb-4 mt-20 flex-grow flex flex-col items-center justify-center">
        <motion.h1
          variants={textVariants}
          initial="hidden"
          animate={controls}
          className="text-5xl font-light mb-4 tracking-tight"
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
          I'm Frank. Nice to e-meet you.
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
        className="w-100 text-[#35312d] max-w-4xl flex-none h-[85vh] flex items-center justify-center"
      >
        <Chat />
      </motion.div>
      <FooterText />
    </div>
  );
}

export default Home;