import React, { useState, useEffect } from "react";
import "./MessageTicker.css";

const MessageTicker = () => {
  const [messages, setMessages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch('/api/messages');
        const data = await response.json();
        setMessages(data.messages || []);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 30000); // Fetch every 30 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (messages.length === 0) return;

    const messageInterval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 10000); // Change message every 10 seconds

    return () => clearInterval(messageInterval);
  }, [messages]);

  const currentMessage = messages[currentIndex];

  return (
    <div className="message-ticker">
      <div className="ticker-content">
        {currentMessage ? `${currentMessage.name}: ${currentMessage.message}` : 'No messages yet'}
      </div>
    </div>
  );
};

export default MessageTicker;