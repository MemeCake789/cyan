import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import './Floride.css';
import { PollinationsAI } from '/public/client.js';

const client = new PollinationsAI();

const Floride = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    const apiMessages = [...messages, userMessage];

    setMessages(prev => [...prev, userMessage, { role: 'assistant', content: '' }]);
    setInput('');
    setIsReplying(true);

    const systemPrompt = {
        role: 'system',
        content: 'You are a helpful assistant. Your tone will be informal. You must keep your simple and easy to understand, yet informative. Your responses must strictly use KaTeX for all mathematical notation. For **inline** mathematics, wrap the expression in single dollar signs. Example: `The equation is $E=mc^2$.` For **block** mathematics, wrap theexpression in double dollar signs. Example: `$ \sum_{i=1}^{n} i = \frac{n(n+1)}{2} $` Do not use brackets like `\[ ... \]` or `\( ... \)`. Do not use plain text for math. For example, instead of writing x^2, write `$x^2`'
    };

    try {
      const stream = await client.chat.completions.create({
        model: 'deepseek-v3',
        messages: [systemPrompt, ...apiMessages],
        stream: true,
      });

      let botMessageContent = '';
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          botMessageContent += content;
          setMessages(prev => {
            const updatedMessages = [...prev];
            updatedMessages[updatedMessages.length - 1].content = botMessageContent;
            return updatedMessages;
          });
        }
      }
    } catch (error) {
      console.error(`API Error: ${error}`);
      const errorMessage = `Error: ${error.message || 'Failed to fetch response.'}`;
      setMessages(prev => {
        const updatedMessages = [...prev];
        updatedMessages[updatedMessages.length - 1].content = errorMessage;
        return updatedMessages;
      });
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <div className="floride-container">
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <div className="message-content-wrapper"> {/* New wrapper div */}
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{msg.content}</ReactMarkdown>
              {isReplying && msg.role === 'assistant' && index === messages.length - 1 && !msg.content && (
                <span className="typing-indicator"></span>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="> Type your message..."
          disabled={isReplying}
        />
        <button onClick={handleSend} disabled={isReplying}>Send</button>
      </div>
    </div>
  );
};

export default Floride;
