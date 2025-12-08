import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import './Floride.css'; // Assuming you have this CSS file in the same directory

const Floride = () => {
  // Helper function to generate a detailed timestamp
  const generateTimestamp = () => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const ms = String(now.getMilliseconds()).padStart(3, '0');
    return `${mm}:${dd}:${hh}:${min}:${ss}:${ms}`;
  };

  // State for messages, user input, and loading status
  const [messages, setMessages] = useState([{ role: 'assistant', name: 'Floride', content: `Hi :D`, timestamp: generateTimestamp() }]);
  const [input, setInput] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const messagesEndRef = useRef(null);

  // Load puter.js and require login
  useEffect(() => {
    const initPuter = async () => {
      if (window.puter) {
        try {
          await window.puter.auth.requireLogin();
        } catch (error) {
          console.error("Puter login required:", error);
        }
      }
    };
    initPuter();
  }, []);


  // Auto-scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Clear chat history
  const handleClearChat = () => {
    setMessages([{ role: 'assistant', name: 'Floride', content: `Hi :D`, timestamp: generateTimestamp() }]);
  };

  // Handle sending a message
  const handleSend = async () => {
    if (!input.trim() || isReplying) return;

    if (!window.puter) {
        alert("Puter is not available. Please try again later.");
        return;
    }

    const userMessage = { role: 'user', name: 'You', content: input, timestamp: generateTimestamp() };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput('');
    setIsReplying(true);

    try {
      // Format messages for the puter.ai.chat API, excluding the initial assistant message
      const chatHistoryForPuter = newMessages.slice(1).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Use the global puter.ai.chat function
      const response = await puter.ai.chat(chatHistoryForPuter);
      const aiMessage = {
        role: 'assistant',
        name: 'Floride',
        content: response.content,
        timestamp: generateTimestamp()
      };
      setMessages([...newMessages, aiMessage]);

    } catch (error) {
      console.error("Error fetching AI response:", error);
      const errorMessage = {
        role: 'assistant',
        name: 'Floride',
        content: `Sorry, something went wrong. Please try again. Error: ${error.message}`,
        timestamp: generateTimestamp()
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsReplying(false);
    }
  };

  // Render the chat component
  return (
    <div className="floride-container">
      <button className="clear-chat-button" onClick={handleClearChat}>Clear</button>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <div className="message-header">
              <span className="message-name">{msg.name}</span>
              <span className="message-timestamp">{msg.timestamp}</span>
            </div>
            <div className="message-content-wrapper">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {msg.content}
              </ReactMarkdown>
              {isReplying && msg.role === 'assistant' && index === messages.length - 1 && !msg.content && (
                <span className="typing-indicator"></span>
              )}
            </div>
          </div>
        ))}
        {isReplying && messages[messages.length-1].role === 'user' && (
            <div className="message assistant">
                <div className="message-header">
                    <span className="message-name">Floride</span>
                    <span className="message-timestamp">{generateTimestamp()}</span>
                </div>
                <div className="message-content-wrapper">
                    <span className="typing-indicator"></span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isReplying && handleSend()}
          placeholder="> Type your message..."
          disabled={isReplying}
        />
        <button onClick={handleSend} disabled={isReplying}>Send</button>
      </div>
    </div>
  );
};

export default Floride;
