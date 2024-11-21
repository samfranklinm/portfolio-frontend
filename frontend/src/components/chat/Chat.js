import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import sanitizeHtml from 'sanitize-html';
import './Chat.css';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';

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
  const [statusMessage, setStatusMessage] = useState(''); // New state variable
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
    setStatusMessage('');
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { sender: 'user', text: input }]);
    setInput('');
    setIsGenerating(true);
    setShowSuggestions(false);
    setSuggestedPrompts((prev) => prev.filter((prompt) => prompt !== input));

    // Set initial status messages
    const statusMessages = [
      "Hmm... Let me think...",
      "I think I got it...",
      "Aha!"
    ];
    setStatusMessage(statusMessages[0]);

    // Clear any existing timeouts
    statusTimeouts.current.forEach(clearTimeout);
    statusTimeouts.current = [];

    // Schedule status message updates
    statusMessages.slice(1).forEach((msg, index) => {
      const timeout = setTimeout(() => {
        setStatusMessage(msg);
      }, (index + 1) * 2000); // Update every 2 seconds
      statusTimeouts.current.push(timeout);
    });

    try {
      const response = await axios.post(`http://localhost:5003/api/chat`, 
        { question: input },
        { 
          headers: { 
            'session-id': sessionId 
          }
        }
      );
      if (response.data.sessionId) {
        setSessionId(response.data.sessionId);
      }
      const botMessage = response.data.answer;
      let index = 0;

      // Clear status messages before starting to display the bot's response
      statusTimeouts.current.forEach(clearTimeout);
      statusTimeouts.current = [];
      setStatusMessage('');

      typingInterval.current = setInterval(() => {
        setCurrentText(botMessage.slice(0, index));
        index++;
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
      }, 3);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'An unexpected error occurred. Please try again later.';
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: errorMessage },
      ]);
      setIsGenerating(false);
      setShowSuggestions(true);
      setIsSuggestionsExpanded(false);
      // Clear status messages on error
      statusTimeouts.current.forEach(clearTimeout);
      statusTimeouts.current = [];
      setStatusMessage('');
    }
  };

  const toggleSuggestions = () => {
    setIsSuggestionsExpanded((prev) => !prev);
  };

  return (
    <div className="w-[100vh] h-[60vh] flex flex-col overflow-scroll">
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            } py-2`}
          >
            <div
              className={`max-w-xl px-4 py-2 rounded-lg ${
                msg.sender === 'user'
                  ? 'bg-[#8C8278]/20 hover:bg-[#8C8278]/30'
                  : 'bg-white/10 hover:bg-white/20'
              } backdrop-blur-sm transition-colors duration-200`}
            >
              <ReactMarkdown>{sanitizeHtml(msg.text)}</ReactMarkdown>
            </div>
          </div>
        ))}
        {isGenerating && (
          <div className="flex justify-start py-2">
            <div className="max-w-xl px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm">
              {currentText ? (
                <ReactMarkdown>{sanitizeHtml(currentText)}</ReactMarkdown>
              ) : (
                // Display the status message with italics and pulsing tints of #8c8278
                <div className="italic animate-pulse text-[#554e48]">{statusMessage}</div>
              )}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {showSuggestions && (
        <div className="px-4 space-y-2 backdrop-blur-sm mt-2">
          <div className="flex items-center justify-center">
            <button onClick={toggleSuggestions}>
              {isSuggestionsExpanded ? <ArrowUpward /> : <ArrowDownward />}
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
      <div className="p-4 bg-white/5 backdrop-blur-sm border-t border-[#8C8278]/20"></div>
        <div className="flex backdrop-blur-sm bg-white/5 rounded-lg border border-[#8C8278]/20">
          <input
            className="flex-1 p-4 bg-transparent border-none focus:outline-none text-black placeholder-custom"
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
                : 'text-[#554e48] hover:text-[#a29a92]'
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