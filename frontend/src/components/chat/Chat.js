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
          color: msg.sender === 'user' ? '#ffffff' : '#cccccc',
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
        <div className="prose prose-sm max-w-none prose-headings:text-white prose-p:text-white prose-strong:text-white prose-em:text-white prose-ul:text-white prose-ol:text-white prose-li:text-white prose-a:text-white prose-code:text-white" style={{ color: '#ffffff' }}>
          <ReactMarkdown components={renderers} remarkPlugins={[remarkGfm]}>
            {sanitizeHtml(msg.text)}
          </ReactMarkdown>
          {msg.sender === 'bot' && (
            <div className="mt-2 text-xs italic" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
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
      fontFamily: "'Fira Code', monospace",
      position: 'relative',
      zIndex: 50
    }}>
      {/* Sidebar - File Explorer */}
      <div className={`${sidebarCollapsed ? 'w-0' : 'w-48'} transition-all duration-300 overflow-hidden`} style={{
        backgroundColor: '#252526',
        borderRight: '1px solid #3e3e42'
      }}>
        <div className="p-2">
          <div className="text-xs text-gray-400 uppercase mb-2 px-2">Explorer</div>
          {[
            { icon: '📁', label: 'Professional Journey', prompt: 'Walk me through your career journey, highlighting key achievements at each role.' },
            { icon: '📁', label: 'Technical Skills', prompt: 'What are your core technical skills and how have you applied them in real projects?' },
            { icon: '📁', label: 'Impactful Project', prompt: 'Describe your most impactful project and the specific challenges you overcame.' },
            { icon: '📁', label: 'Career Goals', prompt: 'Where do you see your career heading and what excites you most about that path?' },
            { icon: '📁', label: 'Contact Info', prompt: "What's the best way to reach you for professional opportunities?" }
          ].map((item, idx) => (
            <div
              key={idx}
              onClick={(e) => {
                console.log('Clicked:', item.label);
                e.preventDefault();
                e.stopPropagation();
                setInput(item.prompt);
                setShowSuggestions(false);
                return false;
              }}
              onMouseDown={(e) => {
                console.log('MouseDown:', item.label);
                e.preventDefault();
                return false;
              }}
              className="w-full text-left px-2 py-1.5 text-sm hover:bg-[#2a2d2e] transition-colors rounded flex items-center gap-2 cursor-pointer"
              style={{ color: '#cccccc' }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
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
            <div className="w-fit max-w-[80%] px-4 py-2 rounded" style={{
              background: '#2d2d2d',
              border: '1px solid #3e3e42'
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
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: '#007acc' }}
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                      />
                      <motion.div 
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: '#007acc' }}
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                      />
                      <motion.div 
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: '#007acc' }}
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                      />
                    </div>
                    <span className="italic text-[11px]" style={{ color: '#858585' }}>{statusMessage}</span>
                  </motion.div>
                  {/* Progress Bar */}
                  <div className="mt-2 w-full">
                    <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: '#3e3e42' }}>
                      <motion.div 
                        className="h-full rounded-full"
                        style={{ backgroundColor: '#007acc' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${thinkingProgress}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                    <div className="text-[10px] mt-1 text-right" style={{ color: '#858585' }}>
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
  );
}

export default Chat;
