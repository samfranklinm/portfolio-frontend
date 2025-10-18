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
      const duration = 500;
      const startTime = performance.now();
      
      const scroll = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
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

    setStatusMessage(statusMessages[0]);
    
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
      }, 0.5);
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`flex ${
        msg.sender === 'user' ? 'justify-end' : 'justify-start'
      } py-2`}
    >
      <motion.div
        layout
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={`markdown-content ${
          msg.sender === 'user'
            ? 'max-w-xl text-[#433e39]'
            : 'w-80vw max-w-[90%] text-[#433e39]'
        } px-4 py-2 rounded-lg backdrop-blur-sm transition-all duration-200`}
        style={{
          background: msg.sender === 'user' 
            ? 'rgba(140, 130, 120, 0.25)'
            : 'rgba(255, 255, 255, 0.08)',
          boxShadow: '0 2px 12px rgba(140, 130, 120, 0.1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = msg.sender === 'user'
            ? 'rgba(140, 130, 120, 0.35)'
            : 'rgba(255, 255, 255, 0.12)';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(140, 130, 120, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = msg.sender === 'user'
            ? 'rgba(140, 130, 120, 0.25)'
            : 'rgba(255, 255, 255, 0.08)';
          e.currentTarget.style.boxShadow = '0 2px 12px rgba(140, 130, 120, 0.1)';
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
    <div className="w-full lg:w-[100vh] h-[80vh] sm:h-[85vh] flex flex-col overflow-hidden text-[#433e39] rounded-xl shadow-lg" style={{
      boxShadow: '0 8px 32px rgba(140, 130, 120, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
    }}>
      <div className="flex-1 overflow-y-auto scroll-smooth px-2 sm:px-4 pb-4 text-[#433e39] max-w-[100vw] lg:max-w-none fade-edges">
        {messages.map((msg, idx) => renderMessage(msg, idx))}
        {isGenerating && (
          <div className="flex justify-start py-2">
            <div className="w-fit max-w-[80%] px-4 py-2 rounded-lg backdrop-blur-sm" style={{
              background: 'rgba(255, 255, 255, 0.15)',
              boxShadow: '0 2px 8px rgba(140, 130, 120, 0.1)'
            }}>
              {currentText ? (
                <div className="prose prose-sm max-w-none prose-headings:text-[#433e39] prose-p:text-[#433e39] prose-strong:text-[#433e39] prose-em:text-[#433e39] prose-ul:text-[#433e39] prose-ol:text-[#433e39] prose-li:text-[#433e39] prose-hr:border-[#433e39]">
                  <ReactMarkdown components={renderers} remarkPlugins={[remarkGfm]}>{sanitizeHtml(currentText)}</ReactMarkdown>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#8C8278] animate-pulse" style={{animationDelay: '0ms'}} />
                    <div className="h-1.5 w-1.5 rounded-full bg-[#8C8278] animate-pulse" style={{animationDelay: '200ms'}} />
                    <div className="h-1.5 w-1.5 rounded-full bg-[#8C8278] animate-pulse" style={{animationDelay: '400ms'}} />
                  </div>
                  <span className="italic text-[11px] text-[#433e39]/70">{statusMessage}</span>
                </div>
              )}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {showSuggestions && (
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
            <div className="grid grid-cols-1 gap-2">
              {suggestedPrompts
                .filter(suggestion => !suggestion.used)
                .map((suggestion, index) => (
                  <button
                    key={index}
                    className="px-3 py-2 sm:px-4 rounded-lg w-full text-left text-sm sm:text-base bg-[#a29a92] bg-opacity-50 hover:bg-opacity-90"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion.title}
                  </button>
                ))}
            </div>
          )}
        </div>
      )}
      <div className="flex backdrop-blur-sm rounded-lg border mt-4 mx-2 sm:mx-0 max-w-[100vw] lg:max-w-none transition-all duration-200" style={{
        background: 'rgba(255, 255, 255, 0.08)',
        borderColor: 'rgba(140, 130, 120, 0.25)',
        boxShadow: '0 2px 8px rgba(140, 130, 120, 0.08)'
      }}>
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
          className={`px-4 sm:px-8 text-sm sm:text-base font-medium ${
            isGenerating
              ? 'text-red-600 hover:text-red-700'
              : 'text-[#433e39] hover:text-[#686460]'
          } transition-colors`}
          onClick={isGenerating ? stopTyping : sendMessage}
        >
          {isGenerating ? 'Stop' : 'Send'}
        </button>
      </div>
    </div>
  );
}

export default Chat;
