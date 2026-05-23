import React, { useState, useRef, useEffect } from 'react';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { ChatPrompts } from './ChatPrompts';
import { sendChatMessage } from '../../utils/api';
import './Chat.css';

const CHARS_PER_TICK = 8;
const TICK_MS = 25;
const STATUS_CYCLE_MS = 3000;

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [showPrompts, setShowPrompts] = useState(true);
  const [statusIndex, setStatusIndex] = useState(0);

  const typingRef = useRef(null);
  const statusRef = useRef(null);

  useEffect(() => () => {
    clearInterval(typingRef.current);
    clearInterval(statusRef.current);
  }, []);

  const stopTyping = () => {
    clearInterval(typingRef.current);
    clearInterval(statusRef.current);
    setIsGenerating(false);
    if (currentText) {
      setMessages((prev) => [...prev, { sender: 'bot', text: currentText }]);
    }
    setCurrentText('');
    setStatusIndex(0);
    setShowPrompts(true);
  };

  const sendMessage = async (text) => {
    const question = (text || input).trim();
    if (!question) return;

    setMessages((prev) => [...prev, { sender: 'user', text: question }]);
    setInput('');
    setIsGenerating(true);
    setShowPrompts(false);
    setStatusIndex(0);

    statusRef.current = setInterval(() => {
      setStatusIndex((i) => i + 1);
    }, STATUS_CYCLE_MS);

    try {
      const answer = await sendChatMessage(question);

      clearInterval(statusRef.current);
      setStatusIndex(0);

      let index = 0;
      typingRef.current = setInterval(() => {
        index += CHARS_PER_TICK;
        setCurrentText(answer.slice(0, index));
        if (index >= answer.length) {
          clearInterval(typingRef.current);
          setMessages((prev) => [...prev, { sender: 'bot', text: answer }]);
          setCurrentText('');
          setIsGenerating(false);
          setShowPrompts(true);
        }
      }, TICK_MS);
    } catch (err) {
      clearInterval(statusRef.current);
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: err.message || 'An unexpected error occurred.' },
      ]);
      setIsGenerating(false);
      setCurrentText('');
      setShowPrompts(true);
    }
  };

  const handlePromptSelect = (text) => {
    sendMessage(text);
  };

  return (
    <div className="chat-root">
      <ChatPrompts visible={showPrompts && messages.length === 0} onSelect={handlePromptSelect} />
      <ChatMessages
        messages={messages}
        currentText={currentText}
        isGenerating={isGenerating}
        statusIndex={statusIndex}
      />
      {showPrompts && messages.length > 0 && (
        <ChatPrompts visible onSelect={handlePromptSelect} />
      )}
      <ChatInput
        value={input}
        onChange={setInput}
        onSend={() => sendMessage()}
        onStop={stopTyping}
        isGenerating={isGenerating}
      />
    </div>
  );
}

export default Chat;
