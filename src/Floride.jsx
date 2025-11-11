import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import './Floride.css'; // Assuming you have this CSS file in the same directory
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Generative AI client
// IMPORTANT: Make sure VITE_GOOGLE_API_KEY is set in your .env.local file
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY || "");

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
    if (!input.trim()) return;

    const userMessage = { role: 'user', name: 'You', content: input, timestamp: generateTimestamp() };

    // Add user message and a placeholder for assistant's reply
    setMessages(prev => [...prev, userMessage, { role: 'assistant', name: 'Floride', content: '', timestamp: generateTimestamp() }]);
    setInput('');
    setIsReplying(true);

    // System prompt defining the AI's persona and rules
    const systemPrompt = {
        role: 'system',
        content: `You're a helpful assistant. 
                  Your tone should be casual, like you're texting a friend. Keep it simple, easy to understand, and informative.
                    
                  Avoid using heavy slang (like "lowkey," "fr," "totally," "tbh," or "bet"), as it sounds weird coming from an AI. Basically, explain things like you're talking, not like you're a textbook.
          
                  ---
                  **Chat Examples:**

                  **Example 1:**

                  *   **User:** yo what's a black hole?
                  *   **Assistant:** so basically a black hole is a spot in space where gravity is super strong. nothing can get out, not even light. it happens bc a ton of mass gets squeezed into a tiny space. pretty wild.

                  **Example 2:**

                  *   **User:** how do i get better at studying
                   *   **Assistant:** try the pomodoro technique, it's a game changer. you just work for like 25 mins straight, then take a 5 min break. it really helps you stay focused. also, put your phone on silent and in another room. it's the biggest distraction. you got this.

                  **Example 3:**

                  *   **User:** what was the vibe in the 90s?
                  *   **Assistant:** the 90s were a whole mood. think grunge music, baggy jeans, dial-up internet, and boy bands. everything was either super colorful or really angsty. it was iconic, honestly. :>
                  ---

                  **KaTeX Formatting**
          
                  Your responses must strictly use KaTeX for all mathematical notation. 
                  For **inline** mathematics, wrap the expression in single dollar signs. Example: \`The equation is $E=mc^2$.\`. 
                  For **block** mathematics, wrap the expression in double dollar signs. Example: 
                  \`
                    $$ \\sum_{i=1}^{n} i = \\frac{n(n+1)}{2} $$
                  \`. 
                  Do not use brackets like \`\\[ ... \\]\` or \`\\( ... \\)\`. Do not use plain text for math. For example, instead of writing x^2, write \`$x^2$\``
    };

    try {
      // *** MODIFICATION 1: Update model and add tools ***
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash-preview-09-2025', // Use a model that supports grounding
        systemInstruction: systemPrompt.content,
        tools: [{ "google_search": {} }] // Enable Google Search grounding
      });

      // *** MODIFICATION 2: Clean history to remove old source lists ***
      const history = messages.slice(1).filter(msg => msg.content).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        // Send only the AI's text, not the "Sources" list from previous turns
        parts: [{ text: msg.content.split('\n\n**Sources:**\n')[0] }]
      }));
      
      const chat = model.startChat({ history });
      const result = await chat.sendMessageStream(input);

      let botMessageContent = '';
      // Stream the text response chunk by chunk
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        botMessageContent += chunkText;
        setMessages(prev => {
          const updatedMessages = [...prev];
          updatedMessages[updatedMessages.length - 1].content = botMessageContent;
          return updatedMessages;
        });
      }

      // *** MODIFICATION 3: Check for grounding metadata after stream ***
      const fullResponse = await result.response;
      const candidate = fullResponse.candidates?.[0];
      
      let sources = [];
      const groundingMetadata = candidate?.groundingMetadata;
      if (groundingMetadata && groundingMetadata.groundingAttributions) {
          sources = groundingMetadata.groundingAttributions
              .map(attribution => ({
                  uri: attribution.web?.uri,
                  title: attribution.web?.title,
              }))
              .filter(source => source.uri && source.title); // Ensure sources are valid
      }

      // *** MODIFICATION 4: Append sources to the message if they exist ***
      if (sources.length > 0) {
          let sourcesMarkdown = '\n\n**Sources:**\n';
          sources.forEach((source, index) => {
              // Sanitize title in case it contains markdown characters
              const safeTitle = source.title.replace(/\[/g, '\\[')
                                            .replace(/\]/g, '\\]');
              sourcesMarkdown += `${index + 1}. [${safeTitle}](${source.uri})\n`;
          });

          const finalContent = botMessageContent + sourcesMarkdown;

          // Update the final message in state to include sources
          setMessages(prev => {
              const updatedMessages = [...prev];
              updatedMessages[updatedMessages.length - 1].content = finalContent;
              return updatedMessages;
          });
      }

    } catch (error) {
      console.error('API Error:', error);
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
