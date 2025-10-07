import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import gamesData from './games.json';
import './GamePage.css';
import createGameHtml from './GameLoader';

const GamePage = () => {
  const { title } = useParams();
  const game = gamesData.games.find((g) => g.title === decodeURIComponent(title));
  const iframeRef = useRef(null);
  
  const [gameLaunched, setGameLaunched] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [animateControls, setAnimateControls] = useState(false);

  useEffect(() => {
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach(canvas => { canvas.remove(); });
    
    if (game) {
      if (game.type === 'HTML') {
        setHtmlContent('');
      } else {
        const generatedHtml = createGameHtml(game);
        setHtmlContent(generatedHtml);
      }
    }
  }, [game]);

  useEffect(() => {
    if (gameLaunched) {
      setIsFullScreen(true);
    }
  }, [gameLaunched]);

  useEffect(() => {
    let timer;
    if (isFullScreen) {
      setAnimateControls(true);
      timer = setTimeout(() => {
        setAnimateControls(false);
      }, 4000); // Animation duration is 4s
    } else {
      setAnimateControls(false);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isFullScreen]);

  if (!game) {
    return <div>Game not found</div>;
  }

  const handleLaunchGame = () => {
    setGameLaunched(true);
  };

  const handleDownloadHtml = () => {
    if (htmlContent) {
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${game.title.replace(/[^a-zA-Z0-9]/g, '_')}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className={`game-page-container ${isFullScreen ? 'fullscreen' : ''}`}>
      {isFullScreen && (
        <div className="fullscreen-controls-container">
          <div className="arrow"></div>
          <div className={`fullscreen-controls ${animateControls ? 'animate-initial' : ''}`}>
            <button onClick={() => setIsFullScreen(false)}>
              [ Unfullscreen ]
            </button>
            <Link to="/">
              [ Back ]
            </Link>
          </div>
        </div>
      )}
      <div className="game-page-header">
        <span>{game.title}</span>
        <div>
          <button onClick={() => setIsFullScreen(true)} className="fullscreen-button">[ Fullscreen ]</button>
          <Link to="/" className="back-button">[ Back ]</Link>
        </div>
      </div>

      <div className="game-content-container">
        {gameLaunched ? (
          game.type === 'HTML' ? (
            <iframe ref={iframeRef} src={`/${game.link.startsWith('public/') ? game.link.substring('public/'.length) : game.link}`} title={game.title} className="game-iframe" allowFullScreen sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-popups allow-modals allow-orientation-lock allow-presentation allow-downloads allow-top-navigation-by-user-activation allow-top-navigation" />
          ) : game.type === 'ZIP' ? (
            <iframe ref={iframeRef} src={`/api/zip-proxy?zipPath=${game.link}`} title={game.title} className="game-iframe" allowFullScreen />
          ) : (
            <iframe ref={iframeRef} srcDoc={htmlContent} title={game.title} className="game-iframe" allowFullScreen />
          )
        ) : (
          <div className="launch-screen">
            <div className='launch-controls'>
              <button className="launch-button-game" onClick={handleLaunchGame}>
                {'>'} Launch
              </button>
              <p className="cdn-loaded-text">
                Game:{game.title} <br></br>
                Type: {game.type} <br></br>
                CDN: {game.link}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="game-page-footer">
        <span>Genre: {game.genre} | Type: {game.type}</span>
        <div className="game-status">
          <span className="status-tag">Status:</span>
          <span className={`status-text ${game.status[0].toLowerCase()}`}>{game.status[0]}</span>
          <span className={`status-reason ${game.status[0].toLowerCase()}`}>{game.status[1]}</span>
        </div>
      </div>
    </div>
  );
};

export default GamePage;