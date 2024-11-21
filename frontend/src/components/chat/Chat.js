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
  const [statusMessage, setStatusMessage] = useState(null); // New state variable
  const statusTimeouts = useRef([]); // To track timeouts

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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
    // Clear status messages
    statusTimeouts.current.forEach(clearTimeout);
    statusTimeouts.current = [];
    etStatusMessage(null);
  };

  const statusMessages = [
    "Looking up my resume...",
    "Getting you the best response...",
    "Almost there...",
  ];

  const cycleStatusMessages = () => {
    let messageIndex = 0;
    const interval = setInterval(() => {
      setStatusMessage(statusMessages[messageIndex]);
      messageIndex = (messageIndex + 1) % statusMessages.length;
    }, 3000);
    return interval;
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { sender: 'user', text: input }]);
    setInput('');
    setIsGenerating(true);
    setShowSuggestions(false);
    setSuggestedPrompts((prev) => prev.filter((prompt) => prompt !== input));

    // Set initial status message immediately
    setStatusMessage(statusMessages[0]);
    
    // Start cycling status messages from the second message
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
      // Clear the cycling interval
      clearInterval(messageInterval);
      setStatusMessage(null);
      
      if (response.data.sessionId) {
        setSessionId(response.data.sessionId);
      }
      const botMessage = response.data.answer;
      let index = 0;
      const charsPerIteration = 5; // Add multiple characters per iteration

      // Clear status messages before starting to display the bot's response
      statusTimeouts.current.forEach(clearTimeout);
      statusTimeouts.current = [];
      setStatusMessage(null);

      typingInterval.current = setInterval(() => {
        setCurrentText(botMessage.slice(0, index));
        index += charsPerIteration; // Increment by multiple characters
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
      }, 0.5); // Reduced from 3ms to 1ms
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
            ? 'max-w-xl bg-[#8C8278]/25 hover:bg-[#7b7774]/30 text-[#433e39]'
            : 'w-80vw max-w-[90%] bg-white/5 hover:bg-[#7b7774]/30 text-[#433e39]'
        } px-4 py-2 rounded-lg backdrop-blur-sm transition-all duration-100`}
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
    <div className="w-[100vh] h-[85vh] flex flex-col overflow-scroll text-[#433e39]">
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-4 text-[#433e39]">
        {messages.map((msg, idx) => renderMessage(msg, idx))}
        {isGenerating && (
          <div className="flex justify-start py-2">
            <div className="w-fit max-w-[80%] px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm">
              {currentText ? (
                <div className="prose prose-sm max-w-none prose-headings:text-[#433e39] prose-p:text-[#433e39] prose-strong:text-[#433e39] prose-em:text-[#433e39] prose-ul:text-[#433e39] prose-ol:text-[#433e39] prose-li:text-[#433e39] prose-hr:border-[#433e39]">
                  <ReactMarkdown components={renderers} remarkPlugins={[remarkGfm]}>{sanitizeHtml(currentText)}</ReactMarkdown>
                </div>
              ) : (
                <div className="italic text-[11px] animate-pulse text-[#433e39]">{statusMessage}</div>
              )}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {showSuggestions && (
        <div className="px-4 space-y-2 backdrop-blur-sm mt-2">
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
            <div>
              {suggestedPrompts
                .filter(suggestion => !suggestion.used)
                .map((suggestion, index) => (
                  <button
                    key={index}
                    className="px-4 py-2 rounded-lg w-full text-left bg-[#a29a92] bg-opacity-50 hover:bg-opacity-90"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion.title}
                  </button>
                ))}
            </div>
          )}
        </div>
      )}
        <div className="flex backdrop-blur-sm bg-white/5 rounded-lg border border-[#8C8278]/20 mt-4">
          <input
            className="flex-1 p-4 bg-transparent border-none focus:outline-none text-[#433e39] placeholder-custom"
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isGenerating && sendMessage()}
            disabled={isGenerating}
          />
          <button
            className={`px-8 font-medium ${
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