// src/pages/Home.js
import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import Chat from '../components/chat/Chat';
import { LogoLink } from '../components/logo/LogoLink';
import {FooterText} from '../components/footer/FooterText';

function Home() {
  const controls = useAnimation();
  const [showInterface, setShowInterface] = useState(true); // Changed to true immediately

  useEffect(() => {
    // Skip animation, show interface immediately
    controls.start('showInterface');
  }, [controls]);

  const textVariants = {
    hidden: { 
      opacity: 0, 
      y: -100,
      scale: 0.9
    },
    showTexts: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { 
        duration: 1,
        ease: [0.43, 0.13, 0.23, 0.96]
      }
    },
    hideTexts: {
      opacity: 0,
      y: -50,
      scale: 0.95,
      transition: { 
        duration: 0.5,
        ease: "easeIn"
      }
    }
  };

  const interfaceVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    showInterface: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { 
        duration: 0.8,
        ease: [0.43, 0.13, 0.23, 0.96]
      }
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden bg-agent-dark">
      <LogoLink />
      
      {/* Main Interface - Always visible now */}
      <motion.div
        variants={interfaceVariants}
        initial="hidden"
        animate={controls}
        className="w-full max-w-7xl h-[85vh] flex flex-col lg:flex-row gap-4 px-2 sm:px-4 relative z-10"
      >
          {/* Chat Interface */}
          <div className="flex-1 lg:w-2/3">
            <Chat />
          </div>

          {/* Context Panel */}
          <div className="lg:w-1/3 hidden lg:flex flex-col gap-4">
            {/* AI Status Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glow-card rounded-xl p-6 backdrop-blur-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                <span className="text-agent-light/80 text-sm font-medium">Agent Status: Active</span>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-agent-light/60">
                  <span>Processing Power</span>
                  <span className="text-agent-accent">LLM-Enabled</span>
                </div>
                <div className="flex justify-between text-agent-light/60">
                  <span>Response Mode</span>
                  <span className="text-agent-accent">Real-time</span>
                </div>
                <div className="flex justify-between text-agent-light/60">
                  <span>Context Awareness</span>
                  <span className="text-agent-accent">Resume-trained</span>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="glow-card rounded-xl p-6 backdrop-blur-xl"
            >
              <h3 className="text-agent-light text-sm font-medium mb-4">Quick Insights</h3>
              <div className="space-y-2">
                {[
                  { label: 'Experience', value: 'Multi-domain', icon: '💼' },
                  { label: 'Specialization', value: 'Tech & AI', icon: '🤖' },
                  { label: 'Availability', value: 'Open to opportunities', icon: '✨' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-agent-darker/50 hover:bg-agent-darker transition-all">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-agent-light/60 text-xs">{item.label}</span>
                    </div>
                    <span className="text-agent-light text-xs font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Neural Activity Visualization */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="glow-card rounded-xl p-6 backdrop-blur-xl flex-1"
            >
              <h3 className="text-agent-light text-sm font-medium mb-4">Neural Activity</h3>
              <div className="space-y-3">
                {[85, 92, 78, 88].map((value, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs text-agent-light/60">
                      <span>Layer {idx + 1}</span>
                      <span>{value}%</span>
                    </div>
                    <div className="h-1.5 bg-agent-darker rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                        transition={{ duration: 1, delay: 0.8 + (idx * 0.1) }}
                        className="h-full bg-gradient-to-r from-agent-accent to-agent-glow"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      
      <FooterText />
    </div>
  );
}

export default Home;