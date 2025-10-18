import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import sanitizeHtml from 'sanitize-html';
import './Chat.css';
import { motion, AnimatePresence } from 'framer-motion';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [suggestedPrompts, setSuggestedPrompts] = useState([
    {
      title: "Professional Journey",
      prompt: "Walk me through your career journey, highlighting key achievements at each role.",
      icon: "🚀",
      used: false
    },
    {
      title: "Technical Skills",
      prompt: "What are your core technical skills and how have you applied them in real projects?",
      icon: "⚡",
      used: false
    },
    {
      title: "Impactful Project",
      prompt: "Describe your most impactful project and the specific challenges you overcame.",
      icon: "💡",
      used: false
    },
    {
      title: "Career Goals",
      prompt: "Where do you see your career heading and what excites you most about that path?",
      icon: "🎯",
      used: false
    },
    {
      title: "Contact Information",
      prompt: "What's the best way to reach you for professional opportunities?",
      icon: "📧",
      used: false
    }
  ]);
  const typingInterval = useRef(null);
  const messagesEndRef = useRef(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const statusTimeouts = useRef([]);

  const handleSuggestionClick = (selectedPrompt) => {
    setInput(selectedPrompt.prompt);
    setSuggestedPrompts(prevPrompts =>
      prevPrompts.map(p => 
        p.prompt === selectedPrompt.prompt 
          ? { ...p, used: true }
          : p
      )
    );
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentText]);

  const stopTyping = () => {
    clearInterval(typingInterval.current);
    setIsGenerating(false);
    setMessages((prev) => [
      ...prev,
      { sender: 'bot', text: currentText },
    ]);
    setCurrentText('');
    statusTimeouts.current.forEach(clearTimeout);
    statusTimeouts.current = [];
    setStatusMessage(null);
  };

  const statusMessages = [
    "Analyzing resume data...",
    "Processing context...",
    "Generating insights...",
    "Finalizing response..."
  ];

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { sender: 'user', text: input }]);
    setInput('');
    setIsGenerating(true);
    setShowSuggestions(false);

    setStatusMessage(statusMessages[0]);
    
    let messageIndex = 1;
    const messageInterval = setInterval(() => {
      setStatusMessage(statusMessages[messageIndex]);
      messageIndex = (messageIndex + 1) % statusMessages.length;
    }, 2000);

    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URI}/api/chat`, 
        { question: input },
        { 
          headers: { 
            'session-id': sessionId 
          }
        }
      );
      
      clearInterval(messageInterval);
      setStatusMessage(null);
      
      if (response.data.sessionId) {
        setSessionId(response.data.sessionId);
      }
      
      const botMessage = response.data.answer;
      let index = 0;
      const charsPerIteration = 3;

      statusTimeouts.current.forEach(clearTimeout);
      statusTimeouts.current = [];
      setStatusMessage(null);

      typingInterval.current = setInterval(() => {
        setCurrentText(botMessage.slice(0, index));
        index += charsPerIteration;
        if (index > botMessage.length) {
          clearInterval(typingInterval.current);
          setIsGenerating(false);
          setMessages((prev) => [
            ...prev,
            { sender: 'bot', text: botMessage },
          ]);
          setCurrentText('');
          setShowSuggestions(true);
        }
      }, 15);
    } catch (error) {
      clearInterval(messageInterval);
      setStatusMessage(null);
      const errorMessage = error.response?.data?.error || 'An unexpected error occurred. Please try again later.';
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: errorMessage },
      ]);
      setIsGenerating(false);
      setShowSuggestions(true);
      statusTimeouts.current.forEach(clearTimeout);
      statusTimeouts.current = [];
      setStatusMessage(null);
    }
  };

  const renderers = {
    a: ({ node, href, children }) => (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-agent-accent hover:text-agent-glow transition-colors underline"
      >
        {children}
      </a>
    ),
  };

  const renderMessage = (msg, idx) => (
    <motion.div
      key={idx}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`relative group ${
        msg.sender === 'user'
          ? 'max-w-xl'
          : 'max-w-[85%]'
      }`}>
        {/* Message bubble */}
        <div className={`${
          msg.sender === 'user'
            ? 'bg-gradient-to-br from-agent-accent to-agent-glow text-white'
            : 'bg-agent-gray/80 border border-agent-accent/30 text-agent-light'
        } px-5 py-3 rounded-2xl backdrop-blur-xl transition-all duration-200 group-hover:shadow-lg ${
          msg.sender === 'bot' ? 'group-hover:border-agent-accent/50' : ''
        }`}>
          <div className="prose prose-sm max-w-none prose-invert prose-headings:text-inherit prose-p:text-inherit prose-strong:text-inherit prose-a:text-agent-glow">
            <ReactMarkdown components={renderers} remarkPlugins={[remarkGfm]}>
              {sanitizeHtml(msg.text)}
            </ReactMarkdown>
          </div>
          {msg.sender === 'bot' && (
            <div className="mt-3 pt-2 border-t border-agent-light/10 text-[10px] text-agent-light/40 italic">
              AI-generated • Verify important details
            </div>
          )}
        </div>
        
        {/* Timestamp */}
        <div className={`text-[10px] text-agent-light/30 mt-1 ${
          msg.sender === 'user' ? 'text-right' : 'text-left'
        }`}>
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="h-full flex flex-col glow-card rounded-2xl backdrop-blur-xl overflow-hidden shadow-xl shadow-agent-accent/10" data-testid="chat-container">
      {/* Header */}
      <div className="px-6 py-4 border-b border-agent-accent/30 bg-agent-darker/70">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <div className="absolute inset-0 h-2 w-2 rounded-full bg-green-500 animate-ping" />
            </div>
            <div>
              <h2 className="text-agent-light font-medium text-sm">Professional AI Agent</h2>
              <p className="text-agent-light/60 text-xs">Resume-trained • Real-time responses</p>
            </div>
          </div>
          <div className="text-xs text-agent-light/40">
            {messages.length} interactions
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 scroll-smooth custom-scrollbar">
        {messages.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-full flex items-center justify-center"
          >
            <div className="text-center space-y-4 max-w-md">
              <div className="text-5xl">🤖</div>
              <h3 className="text-agent-light text-lg font-medium">Start a Conversation</h3>
              <p className="text-agent-light/60 text-sm">
                Ask me anything about Sam's professional experience, skills, or projects.
                I'm powered by AI and trained on the complete resume.
              </p>
            </div>
          </motion.div>
        )}
        
        {messages.map((msg, idx) => renderMessage(msg, idx))}
        
        {/* Typing Indicator */}
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start mb-4"
          >
            <div className="max-w-[85%]">
              <div className="bg-agent-gray border border-agent-accent/20 px-5 py-3 rounded-2xl backdrop-blur-xl">
                {currentText ? (
                  <div className="prose prose-sm max-w-none prose-invert prose-headings:text-agent-light prose-p:text-agent-light">
                    <ReactMarkdown components={renderers} remarkPlugins={[remarkGfm]}>
                      {sanitizeHtml(currentText)}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 rounded-full bg-agent-accent animate-pulse" style={{animationDelay: '0ms'}} />
                      <div className="h-2 w-2 rounded-full bg-agent-accent animate-pulse" style={{animationDelay: '150ms'}} />
                      <div className="h-2 w-2 rounded-full bg-agent-accent animate-pulse" style={{animationDelay: '300ms'}} />
                    </div>
                    <span className="text-agent-light/60 text-xs italic">{statusMessage}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      <AnimatePresence>
        {showSuggestions && messages.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="px-6 pb-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {suggestedPrompts.filter(s => !s.used).slice(0, 3).map((suggestion, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-3 rounded-xl bg-agent-gray/50 border border-agent-accent/20 hover:border-agent-accent/40 hover:bg-agent-gray transition-all text-left group"
                  onClick={() => handleSuggestionClick(suggestion)}
                  data-testid={`suggestion-${index}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{suggestion.icon}</span>
                    <span className="text-agent-light/80 group-hover:text-agent-light text-xs font-medium">
                      {suggestion.title}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="px-6 py-4 border-t border-agent-accent/30 bg-agent-darker/70">
        <div className="flex items-center gap-3 bg-agent-gray/70 rounded-xl border border-agent-accent/30 focus-within:border-agent-accent/50 transition-all px-4 py-3">
          <input
            className="flex-1 bg-transparent border-none focus:outline-none text-agent-light placeholder-agent-light/40 text-sm"
            type="text"
            placeholder="Ask about experience, skills, projects..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isGenerating && sendMessage()}
            disabled={isGenerating}
            data-testid="chat-input"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-6 py-2 rounded-lg font-medium text-sm transition-all ${
              isGenerating
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-gradient-to-r from-agent-accent to-agent-glow text-white hover:shadow-lg hover:shadow-agent-accent/20'
            }`}
            onClick={isGenerating ? stopTyping : sendMessage}
            disabled={!input.trim() && !isGenerating}
            data-testid="send-button"
          >
            {isGenerating ? '⏸ Stop' : '→ Send'}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default Chat;