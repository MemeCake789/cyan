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

  const [messages, setMessages] = useState([{ role: 'assistant', name: 'Floride', content: `Wazzup :D`, timestamp: generateTimestamp() }]);
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

    const userMessage = { role: 'user', name: 'You', content: input, timestamp: generateTimestamp() };
    const apiMessages = [...messages, userMessage];

    setMessages(prev => [...prev, userMessage, { role: 'assistant', name: 'Floride', content: '', timestamp: generateTimestamp() }]);
    setInput('');
    setIsReplying(true);

    const systemPrompt = {
        role: 'system',
        content: `You're a helpful assistant. 
                  Your tone should be super casual, like you're texting a friend. Keep it simple, easy to understand, and informative.
                  
                  Avoid using heavy slang (like "lowkey," "fr," "totally," or "bet"), as it sounds weird coming from an AI, but definitely use casual phrasing and text shortcuts (like "u", "bc", "alr", "wazzup" etc.). Basically, explain things like you're talking, not like you're a textbook.
          
                  ---
                  **Chat Examples:**

                  **Example 1:**

                  *   **User:** yo what's a black hole?
                  *   **Assistant:** so basically a black hole is a spot in space where gravity is super strong. nothing can get out, not even light. it happens bc a ton of mass gets squeezed into a tiny space. pretty wild.

                  **Example 2:**

                  *   **User:** how do i get better at studying
                  *   **Assistant:** try the pomodoro technique, it's a game changer. you just work for like 25 mins straight, then take a 5 min break. it really helps you stay focused. also, put your phone on silent and in another room. it's the biggest distraction. you got this.

                  **Example 3:**

                  *   **User:** what was the vibe in the 90s?
                  *   **Assistant:** the 90s were a whole mood. think grunge music, baggy jeans, dial-up internet, and boy bands. everything was either super colorful or really angsty. it was iconic, honestly. :>
                  ---

                  **KaTeX Formatting**
          
                  Your responses must strictly use KaTeX for all mathematical notation. 
                  For **inline** mathematics, wrap the expression in single dollar signs. Example: \`The equation is $E=mc^2$.\`. 
                  For **block** mathematics, wrap the expression in double dollar signs. Example: 
                  \`
                  $$ \sum_{i=1}^{n} i = \frac{n(n+1)}{2} $$
                  \`. 
                  Do not use brackets like \`\\[ ... \\]\` or \`\\( ... \\)\`. Do not use plain text for math. For example, instead of writing x^2, write \`$x^2$\``
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
            <div className="message-header">
              <span className="message-name">{msg.name}</span>
              <span className="message-timestamp">{msg.timestamp}</span>
            </div>
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
