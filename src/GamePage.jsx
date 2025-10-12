import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import './GamePage.css';

const GamePage = () => {
  const { title } = useParams();
  const [gamesData, setGamesData] = useState({ games: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/games.json')
      .then(response => response.json())
      .then(data => {
        setGamesData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading games data:', error);
        setLoading(false);
      });
  }, []);

  const game = gamesData.games.find((g) => g.title === decodeURIComponent(title));
  const iframeRef = useRef(null);

   const [gameLaunched, setGameLaunched] = useState(false);
   const [htmlContent, setHtmlContent] = useState('');
   const [isDownloading, setIsDownloading] = useState(false);
   const [isFullScreen, setIsFullScreen] = useState(false);
   const [animateControls, setAnimateControls] = useState(false);

  useEffect(() => {
    if (iframeRef.current && htmlContent) {
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      iframeRef.current.src = url;

      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [htmlContent]);

  useEffect(() => {
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach(canvas => { canvas.remove(); });

    if (game) {
      if (game.type === 'HTML') {
        setHtmlContent('');
      } else {
        // For EMULATOR or FLASH games, keep existing logic if any
        // For now, we'll just clear htmlContent for HTML games
        setHtmlContent('');
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!game) {
    return <div>Game not found</div>;
  }

   const handleLaunchGame = async () => {
     if (game.type === 'HTML') {
       setIsDownloading(true);
       if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
         navigator.serviceWorker.controller.postMessage({
           type: 'CACHE_GAME',
           gameLink: game.link,
           gameTitle: game.title,
         });
       } else {
         alert('Service Worker not active. Please refresh the page.');
         setIsDownloading(false);
       }
     } else {
       // For EMULATOR or FLASH games, keep existing logic if any, or set launched directly
       setGameLaunched(true);
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
             <iframe ref={iframeRef} title={game.title} className="game-iframe" allowFullScreen sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-popups allow-modals allow-orientation-lock allow-presentation allow-downloads allow-top-navigation-by-user-activation allow-top-navigation" />
           ) : (
             <iframe ref={iframeRef} title={game.title} className="game-iframe" allowFullScreen />
           )
         ) : (
          <div className="launch-screen">
            <div className='launch-controls'>
              <button className="launch-button-game" onClick={handleLaunchGame} disabled={isDownloading}>
                {isDownloading ? 'Downloading...' : '> Launch'}
              </button>
              <p className="cdn-loaded-text">
                Game: {game.title} <br></br>
                Type: {game.type} <br></br>
                Status: {isDownloading ? 'Downloading from GitHub...' : game.link}
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