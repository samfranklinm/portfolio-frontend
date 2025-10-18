// Contact.js
import React from 'react';
import { motion } from 'framer-motion';

function Contact() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glow-card rounded-2xl p-8 backdrop-blur-xl"
      >
        <h2 className="text-3xl font-light mb-2 text-agent-light bg-gradient-to-r from-agent-light via-agent-glow to-agent-light bg-clip-text text-transparent">
          Get In Touch
        </h2>
        <p className="text-agent-light/60 text-sm mb-6">
          Let's discuss opportunities and collaborations
        </p>
        
        <form className="flex flex-col space-y-4">
          <div>
            <label className="text-agent-light/80 text-sm mb-2 block">Name</label>
            <input 
              className="w-full p-3 bg-agent-darker/50 border border-agent-accent/20 rounded-lg text-agent-light placeholder-agent-light/40 focus:outline-none focus:border-agent-accent/40 transition-all" 
              type="text" 
              placeholder="Your name" 
            />
          </div>
          
          <div>
            <label className="text-agent-light/80 text-sm mb-2 block">Email</label>
            <input 
              className="w-full p-3 bg-agent-darker/50 border border-agent-accent/20 rounded-lg text-agent-light placeholder-agent-light/40 focus:outline-none focus:border-agent-accent/40 transition-all" 
              type="email" 
              placeholder="your@email.com" 
            />
          </div>
          
          <div>
            <label className="text-agent-light/80 text-sm mb-2 block">Message</label>
            <textarea 
              className="w-full p-3 bg-agent-darker/50 border border-agent-accent/20 rounded-lg text-agent-light placeholder-agent-light/40 focus:outline-none focus:border-agent-accent/40 transition-all resize-none" 
              placeholder="Your message..." 
              rows="5"
            ></textarea>
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full p-3 bg-gradient-to-r from-agent-accent to-agent-glow text-white rounded-lg font-medium hover:shadow-lg hover:shadow-agent-accent/20 transition-all"
            type="submit"
          >
            Send Message
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

export default Contact;