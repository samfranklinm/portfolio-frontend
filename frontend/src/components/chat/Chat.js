import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import sanitizeHtml from 'sanitize-html';
import './Chat.css';
import { ArrowDownward } from '@mui/icons-material';
import { motion } from 'framer-motion';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState([
    {
      title: "Professional Journey",
      prompt: "Walk me through your career journey, highlighting key achievements at each role.",
      used: false
    },
    {
      title: "Technical Skills",
      prompt: "What are your core technical skills and how have you applied them in real projects?",
      used: false
    },
    {
      title: "Impactful Project",
      prompt: "Describe your most impactful project and the specific challenges you overcame.",
      used: false
    },
    {
      title: "Career Goals",
      prompt: "Where do you see your career heading and what excites you most about that path?",
      used: false
    },
    {
      title: "Contact Information",
      prompt: "What's the best way to reach you for professional opportunities?",
      used: false
    }
  ]);
  const typingInterval = useRef(null);
  const messagesEndRef = useRef(null);
  const [isSuggestionsExpanded, setIsSuggestionsExpanded] = useState(true);
  const [statusMessage, setStatusMessage] = useState(null);
  const statusTimeouts = useRef([]);
  const [thinkingProgress, setThinkingProgress] = useState(0);

  const handleSuggestionClick = (selectedPrompt) => {
    setInput(selectedPrompt.prompt);
    setShowSuggestions(false);
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
      const scrollContainer = messagesEndRef.current.parentElement;
      const scrollHeight = scrollContainer.scrollHeight;
      
      const start = scrollContainer.scrollTop;
      const end = scrollHeight - scrollContainer.clientHeight;
      const duration = 600;
      const startTime = performance.now();
      
      const scroll = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Smooth ease-out cubic
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        scrollContainer.scrollTop = start + (end - start) * easeOut;
        
        if (progress < 1) {
          requestAnimationFrame(scroll);
        }
      };
      
      requestAnimationFrame(scroll);
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
    "Analyzing resume context...",
    "Processing your question...",
    "Generating response...",
  ];

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { sender: 'user', text: input }]);
    setInput('');
    setIsGenerating(true);
    setShowSuggestions(false);
    setSuggestedPrompts((prev) => prev.filter((prompt) => prompt !== input));
    setThinkingProgress(0);

    setStatusMessage(statusMessages[0]);
    
    // Simulate thinking progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress > 90) progress = 90;
      setThinkingProgress(progress);
    }, 300);
    
    let messageIndex = 1;
    const messageInterval = setInterval(() => {
      setStatusMessage(statusMessages[messageIndex]);
      messageIndex = (messageIndex + 1) % statusMessages.length;
    }, 3000);

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
      clearInterval(progressInterval);
      setThinkingProgress(100);
      setStatusMessage(null);
      
      if (response.data.sessionId) {
        setSessionId(response.data.sessionId);
      }
      const botMessage = response.data.answer;
      let index = 0;
      const charsPerIteration = 5;

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
          setIsSuggestionsExpanded(false);
        }
      }, 20); // Smoother, more natural typing speed
    } catch (error) {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
      setThinkingProgress(0);
      setStatusMessage(null);
      const errorMessage = error.response?.data?.error || 'An unexpected error occurred. Please try again later.';
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: errorMessage },
      ]);
      setIsGenerating(false);
      setShowSuggestions(true);
      setIsSuggestionsExpanded(false);
      statusTimeouts.current.forEach(clearTimeout);
      statusTimeouts.current = [];
      setStatusMessage(null);
    }
  };

  const toggleSuggestions = () => {
    setIsSuggestionsExpanded((prev) => !prev);
  };

  const renderers = {
    a: ({ node, href, children }) => (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer" 
        style={{ 
          color: '#433e39', 
          fontWeight: 'bold', 
          textDecoration: 'underline' 
        }}
      >
        {children}
      </a>
    ),
  };

  const renderMessage = (msg, idx) => (
    <motion.div
      key={idx}
      initial={{ opacity: 0, y: 15, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.25, 0.1, 0.25, 1],
        delay: idx * 0.05
      }}
      className={`flex ${
        msg.sender === 'user' ? 'justify-end' : 'justify-start'
      } py-2`}
    >
      {msg.sender === 'bot' && (
        <div className="flex flex-col items-end mr-3 pt-1" style={{ minWidth: '40px' }}>
          {msg.text.split('\n').map((_, lineIdx) => (
            <div key={lineIdx} className="text-xs leading-6" style={{ color: '#858585', fontFamily: "'Fira Code', monospace" }}>
              {idx * 10 + lineIdx + 1}
            </div>
          ))}
        </div>
      )}
      <motion.div
        layout
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          duration: 0.3, 
          ease: [0.25, 0.1, 0.25, 1]
        }}
        className={`markdown-content ${
          msg.sender === 'user'
            ? 'max-w-xl'
            : 'w-80vw max-w-[90%]'
        } px-4 py-2 rounded transition-all duration-200`}
        style={{
          background: msg.sender === 'user' 
            ? '#0e639c'
            : '#2d2d2d',
          color: msg.sender === 'user' ? '#ffffff' : '#d4d4d4',
          border: msg.sender === 'bot' ? '1px solid #3e3e42' : 'none',
          fontFamily: "'Fira Code', monospace",
          fontSize: '13px',
          lineHeight: '1.6'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = msg.sender === 'user'
            ? '#1177bb'
            : '#333333';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = msg.sender === 'user'
            ? '#0e639c'
            : '#2d2d2d';
        }}
      >
        <div className="prose prose-sm max-w-none prose-headings:text-[#433e39] prose-p:text-[#433e39] prose-strong:text-[#433e39] prose-em:text-[#433e39] prose-ul:text-[#433e39] prose-ol:text-[#433e39] prose-li:text-[#433e39] prose-hr:border-[#433e39]">
          <ReactMarkdown components={renderers} remarkPlugins={[remarkGfm]}>
            {sanitizeHtml(msg.text)}
          </ReactMarkdown>
          {msg.sender === 'bot' && (
            <div className="mt-2 text-xs italic text-[#433e39]/60">
              This is an AI-generated response, therefore, accuracy is not guaranteed. Please contact me for clarification, if needed.
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="w-full lg:w-[100vh] h-[80vh] sm:h-[85vh] flex rounded-xl overflow-hidden" style={{
      backgroundColor: '#1e1e1e',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      fontFamily: "'Fira Code', monospace"
    }}>
      {/* Sidebar - File Explorer */}
      <div className={`${sidebarCollapsed ? 'w-0' : 'w-48'} transition-all duration-300 overflow-hidden`} style={{
        backgroundColor: '#252526',
        borderRight: '1px solid #3e3e42'
      }}>
        <div className="p-2">
          <div className="text-xs text-gray-400 uppercase mb-2 px-2">Explorer</div>
          {[
            { icon: '📁', label: 'Experience', prompt: 'Tell me about your professional experience' },
            { icon: '📁', label: 'Skills', prompt: 'What are your technical skills?' },
            { icon: '📁', label: 'Projects', prompt: 'What projects have you worked on?' },
            { icon: '📁', label: 'Education', prompt: 'Tell me about your education background' },
            { icon: '📁', label: 'Contact', prompt: 'How can I contact you?' }
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInput(item.prompt);
                setShowSuggestions(false);
              }}
              className="w-full text-left px-2 py-1.5 text-sm hover:bg-[#2a2d2e] transition-colors rounded flex items-center gap-2"
              style={{ color: '#cccccc' }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Tab Bar */}
        <div style={{ backgroundColor: '#2d2d2d', borderBottom: '1px solid #3e3e42' }} className="flex items-center px-2">
          <div className="flex items-center gap-1 py-1.5 px-3 text-sm" style={{
            backgroundColor: '#1e1e1e',
            borderRight: '1px solid #3e3e42',
            color: '#cccccc'
          }}>
            <span className="mr-2">💬</span>
            <span>about_my_professional_life.chat</span>
            <button className="ml-2 hover:bg-[#3e3e42] rounded px-1">×</button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto scroll-smooth px-4 pb-4" style={{ backgroundColor: '#1e1e1e' }}>
        {messages.map((msg, idx) => renderMessage(msg, idx))}
        {isGenerating && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex justify-start py-2"
          >
            <div className="w-fit max-w-[80%] px-4 py-2 rounded-lg backdrop-blur-sm" style={{
              background: 'rgba(255, 255, 255, 0.15)',
              boxShadow: '0 2px 8px rgba(140, 130, 120, 0.1)'
            }}>
              {currentText ? (
                <div className="prose prose-sm max-w-none prose-headings:text-[#433e39] prose-p:text-[#433e39] prose-strong:text-[#433e39] prose-em:text-[#433e39] prose-ul:text-[#433e39] prose-ol:text-[#433e39] prose-li:text-[#433e39] prose-hr:border-[#433e39]">
                  <ReactMarkdown components={renderers} remarkPlugins={[remarkGfm]}>{sanitizeHtml(currentText)}</ReactMarkdown>
                </div>
              ) : (
                <div>
                  <motion.div 
                    className="flex items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="flex gap-1">
                      <motion.div 
                        className="h-1.5 w-1.5 rounded-full bg-[#8C8278]"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                      />
                      <motion.div 
                        className="h-1.5 w-1.5 rounded-full bg-[#8C8278]"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                      />
                      <motion.div 
                        className="h-1.5 w-1.5 rounded-full bg-[#8C8278]"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                      />
                    </div>
                    <span className="italic text-[11px] text-[#433e39]/70">{statusMessage}</span>
                  </motion.div>
                  {/* Progress Bar */}
                  <div className="mt-2 w-full">
                    <div className="h-1 bg-[#433e39]/10 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-[#8C8278] to-[#a29a92] rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${thinkingProgress}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                    <div className="text-[10px] text-[#433e39]/50 mt-1 text-right">
                      {Math.round(thinkingProgress)}%
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{ backgroundColor: '#2d2d2d', borderTop: '1px solid #3e3e42' }} className="p-3">
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: '#858585' }}>{'>'}</span>
          <input
            className="flex-1 bg-transparent border-none focus:outline-none text-sm"
            style={{ color: '#cccccc', fontFamily: "'Fira Code', monospace" }}
            type="text"
            placeholder="Ask about Sam's professional life..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isGenerating && sendMessage()}
            disabled={isGenerating}
          />
          <button
            onClick={isGenerating ? stopTyping : sendMessage}
            disabled={!input.trim() && !isGenerating}
            className="px-4 py-1.5 rounded text-xs font-medium transition-all"
            style={{
              backgroundColor: isGenerating ? '#c72e2e' : (input.trim() ? '#0e639c' : '#2d2d2d'),
              color: isGenerating ? '#ffffff' : (input.trim() ? '#ffffff' : '#858585'),
              border: '1px solid #3e3e42',
              minHeight: '28px'
            }}
          >
            {isGenerating ? 'Stop' : 'Send'}
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div style={{ backgroundColor: '#007acc', color: '#ffffff' }} className="flex items-center justify-between px-3 py-1 text-xs">
        <div className="flex items-center gap-4">
          <span>Ln {messages.length + 1}, Col {input.length}</span>
          <span>UTF-8</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400"></span>
            AI Agent Active
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span>{messages.length} messages</span>
          <span>about_my_professional_life.chat</span>
        </div>
      </div>
    </div>
  </div>
        <div className="px-2 sm:px-4 space-y-2 backdrop-blur-sm mt-2 max-w-[100vw] lg:max-w-none">
          <div className="flex items-center justify-center">
            <button 
              onClick={toggleSuggestions}
              className="transform transition-all duration-700 ease-in hover:scale-110"
            >
              <div 
                className={`transition-transform duration-700 ease-out ${
                  isSuggestionsExpanded ? 'rotate-0' : 'rotate-180'
                }`}
              >
                <ArrowDownward style={{ color: '#433e39' }} />
              </div>
            </button>
          </div>
          {isSuggestionsExpanded && (
            <motion.div 
              className="grid grid-cols-1 gap-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {suggestedPrompts
                .filter(suggestion => !suggestion.used)
                .map((suggestion, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: index * 0.08,
                      ease: [0.25, 0.1, 0.25, 1]
                    }}
                    className="px-4 py-3 sm:px-4 sm:py-2 rounded-lg w-full text-left text-base sm:text-sm transition-all duration-200"
                    style={{
                      background: 'rgba(162, 154, 146, 0.5)',
                      boxShadow: '0 2px 8px rgba(67, 62, 57, 0.1)',
                      border: '1px solid rgba(67, 62, 57, 0.1)',
                      minHeight: '44px' // Better mobile touch target
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(162, 154, 146, 0.7)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(67, 62, 57, 0.2)';
                      e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(162, 154, 146, 0.5)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(67, 62, 57, 0.1)';
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    }}
                    onTouchStart={(e) => {
                      e.currentTarget.style.background = 'rgba(162, 154, 146, 0.7)';
                    }}
                    onTouchEnd={(e) => {
                      e.currentTarget.style.background = 'rgba(162, 154, 146, 0.5)';
                    }}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion.title}
                  </motion.button>
                ))}
            </motion.div>
          )}
        </div>
      )}
      <div 
        className="flex backdrop-blur-sm rounded-lg border mt-4 mx-2 sm:mx-0 max-w-[100vw] lg:max-w-none transition-all duration-300"
        style={{
          background: 'rgba(255, 255, 255, 0.08)',
          borderColor: 'rgba(140, 130, 120, 0.25)',
          boxShadow: '0 2px 8px rgba(140, 130, 120, 0.08)'
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'rgba(140, 130, 120, 0.4)';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(140, 130, 120, 0.15), 0 0 0 3px rgba(140, 130, 120, 0.08)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'rgba(140, 130, 120, 0.25)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(140, 130, 120, 0.08)';
        }}
      >
        <input
          className="flex-1 p-3 sm:p-4 bg-transparent border-none focus:outline-none text-sm sm:text-base text-[#433e39] placeholder-custom"
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isGenerating && sendMessage()}
          disabled={isGenerating}
        />
        <button
          className={`px-6 sm:px-8 py-3 sm:py-0 text-base sm:text-sm font-medium transition-all duration-200 ${
            isGenerating
              ? 'text-red-600 hover:text-red-700'
              : 'text-[#433e39] hover:text-[#686460]'
          }`}
          onClick={isGenerating ? stopTyping : sendMessage}
          style={{
            transform: 'scale(1)',
            opacity: (!input.trim() && !isGenerating) ? 0.4 : 1,
            minHeight: '44px', // Better mobile touch target
            minWidth: '60px'
          }}
          onMouseEnter={(e) => {
            if (input.trim() || isGenerating) {
              e.currentTarget.style.transform = 'scale(1.05)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          onMouseDown={(e) => {
            if (input.trim() || isGenerating) {
              e.currentTarget.style.transform = 'scale(0.95)';
            }
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
        >
          {isGenerating ? 'Stop' : 'Send'}
        </button>
      </div>
    </div>
  );
}

export default Chat;
