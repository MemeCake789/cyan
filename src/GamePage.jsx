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
  const [iframeSrc, setIframeSrc] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [animateControls, setAnimateControls] = useState(false);

  useEffect(() => {
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach(canvas => { canvas.remove(); });
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
    switch (game.type) {
      case 'HTML':
        setIframeSrc(game.link);
        break;
      case 'FLASH':
        setHtmlContent(`
          <!DOCTYPE html>
          <html>
          <head>
            <base href="/">
            <title>${game.title}</title>
            <meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">
            <style>
              body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
              #ruffle-player { width: 100%; height: 100%; }
            </style>
            <script src="/ruffle.js"></script>
          </head>
          <body>
            <div id="ruffle-player"></div>
            <script>
              window.RufflePlayer = window.RufflePlayer || {};
              window.RufflePlayer.config = {
                  "scale": "exactfit",
              };
              var ruffle = window.RufflePlayer.newest();
              var player = ruffle.createPlayer();
              player.id = "player";
              player.style.width = "100%";
              player.style.height = "100%";
              document.getElementById("ruffle-player").appendChild(player);
               player.load("${game.link}");
            </script>
          </body>
          </html>`);
        break;
      case 'EMULATOR':
        setIframeSrc(`/emulator.html?core=${game.core}&gameUrl=${encodeURIComponent(game.link)}`);
        break;
      default:
        break;
    }
    setGameLaunched(true);
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
          game.type === 'FLASH' ? (
            <iframe ref={iframeRef} srcDoc={htmlContent} title={game.title} className="game-iframe" allowFullScreen sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-popups allow-modals allow-orientation-lock allow-presentation allow-downloads allow-top-navigation-by-user-activation allow-top-navigation" />
          ) : (
            <iframe ref={iframeRef} src={iframeSrc} title={game.title} className="game-iframe" allowFullScreen sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-popups allow-modals allow-orientation-lock allow-presentation allow-downloads allow-top-navigation-by-user-activation allow-top-navigation" />
          )
         ) : (
           <div className="launch-screen">
             <div className='launch-controls'>
               <button className="launch-button-game" onClick={handleLaunchGame}>
                 &gt; Launch
               </button>
                <p className="cdn-loaded-text">
                  Game: {game.title} <br></br>
                  Type: {game.type} <br></br>
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
