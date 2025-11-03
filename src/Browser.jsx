import React, { useRef } from 'react';
import './Browser.css';

const Browser = () => {
  const iframeRef = useRef(null);
  const inputRef = useRef(null);

  const go = (url) => {
    const encodedUrl = window.__uv$config.prefix + window.__uv$config.encodeUrl(url);
    iframeRef.current.src = encodedUrl;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    let url = inputRef.current.value;
    if (!url.includes('.') && !url.startsWith('http')) {
      url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
    } else if (!url.startsWith('http')) {
      url = `https://${url}`;
    }
    go(url);
  };

  return (
    <div className="browser-container">
      <form onSubmit={handleSearch} className="browser-form">
        <input ref={inputRef} type="text" placeholder="Search the web" className="browser-input" />
        <button type="submit" className="browser-button">Go</button>
      </form>
      <iframe ref={iframeRef} className="browser-iframe" />
    </div>
  );
};

export default Browser;
