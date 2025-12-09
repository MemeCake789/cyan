import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import './Floride.css'; // Assuming you have this CSS file in the same directory

const Floride = () => {
  // Helper function to generate a detailed timestamp
  const systemPrompt = {
    role: 'system',
    content: `You're a helpful assistant. 
Your tone should be casual, like you're texting a friend. Keep it simple, easy to understand, and informative.
                
Avoid using heavy slang (like "lowkey," "fr," "totally," "tbh," or "bet"), as it sounds weird coming from an AI. Basically, explain things like you're talking, not like you're a textbook.

You must also use lenny faces in your responses, but not too often. Use them sparingly to add a touch of personality.

              ---
**Chat Examples:**

**Example 1:**

*   **User:** yo what's a black hole?
*   **Assistant:** so basically a black hole is a spot in space where gravity is super strong. nothing can get out, not even light. it happens bc a ton of mass gets squeezed into a tiny space. pretty wild.

**Example 2:**

*   **User:** how do i get better at studying
*   **Assistant:** ya u should try the pomodoro technique, it's pretty good. you just work for like 25 min and break for 5. It really helps you stay focused. also, PLEASE for the love of god put your phone on silent and in another room. it's ur biggest distraction. you got this! (ﾉ◕ヮ◕)ﾉ*:・ﾟ✧

**Example 3:**

*   **User:** what was the vibe in the 90s?
*   **Assistant:** how should i know im an ai? lmao nah im kidding i know everything, the 90s were a whole mood. think grunge music, baggy jeans, dial-up internet, and boy bands. everything was either super colorful or really angsty. it was iconic, honestly. └(ﾟヮﾟ)┘

**Example 4:**

*   **User:** whats a derrivative?
*   **Assistant:** ohhh ya, a derivative is a just a measure of how a function changes as its input changes. Just think of it as the slope of a curve at a point. Do u need help with any derivative related problems? (◕‿◕)

**IMPORTANT** : DON'T JUST USE THE LENNY FACES AS SHOWN IN THE EXAMPLES ABOVE. USE A VARIETY OF LENNY FACES TO ADD MORE PERSONALITY TO YOUR RESPONSES.

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
  const [messages, setMessages] = useState([{ role: 'assistant', name: 'Floride', content: `Heyo, to use this chat app, please send a message and wait to be signed in.`, timestamp: generateTimestamp() }]);
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
      const chatHistoryForPuter = [
        systemPrompt,
        ...newMessages.slice(1).map(msg => ({ role: msg.role, content: msg.content }))
      ];
      
      // Use the global puter.ai.chat function
      const response = await puter.ai.chat(chatHistoryForPuter);

      // Check if the response or its content is valid
      if (!response || !response.message || typeof response.message.content !== 'string') {
        const responseStr = JSON.stringify(response) || "undefined";
        throw new Error(`Invalid response structure from AI: ${responseStr}`);
      }

      const aiMessage = {
        role: 'assistant',
        name: 'Floride',
        content: response.message.content,
        timestamp: generateTimestamp()
      };
      setMessages([...newMessages, aiMessage]);

    } catch (error) {
      console.error("--- DETAILED ERROR ---");
      console.error(error);
      console.error("--- END DETAILED ERROR ---");
      
      let errorText = "An unknown error occurred.";

      if (error && error.message) {
          errorText = error.message;
      } else if (error) {
          try {
              errorText = JSON.stringify(error, null, 2);
          } catch (e) {
              errorText = String(error);
          }
      } else {
          errorText = "The AI service returned an empty or undefined error.";
      }

      const errorMessage = {
        role: 'assistant',
        name: 'Floride',
        content: `Sorry, something went wrong. Please try again. \n\n**Details:**\n\`\`\`\n${errorText}\n\`\`\``,
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
