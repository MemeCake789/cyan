import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './GamesList.css';
import StatusBar from './StatusBar';
import Nav from './Nav'

import Floride from './Floride';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

const GamesList = () => {
  const [games, setGames] = useState([]);
  const [previewData, setPreviewData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef(null);

  const [activeView, setActiveView] = useState('floride');
  const [isFullscreen, setIsFullscreen] = useState(false); 

  useEffect(() => {
    fetch('/games.json')
      .then(response => response.json())
      .then(data => setGames(data.games));

    const timer = setTimeout(() => {
      setActiveView('games');
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);



  

  const handleMouseMove = (e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const getPreviewTopPosition = () => {
    return mousePosition.y > window.innerHeight * 0.6 ? mousePosition.y - 220 : mousePosition.y + 15; 
  };

  const handleGameClick = (game) => {
    navigate(`/game/${game.title}`);
  };

  const handleNavClick = (view) => {
    setActiveView(view);
  };

  const handleRecommendClick = async () => {
    const gameName = prompt('What game would you like to recommend?');
    if (gameName) {
      try {
        const response = await fetch('/api/recommend', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ gameName }),
        });
        const result = await response.json();
        alert(result.message);
      } catch (error) {
        console.error('Error recommending game:', error);
        alert('Failed to recommend game.');
      }
    }
  };

  const handleSort = () => {
    setSortOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };

  const handleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  const handleClose = () => {
    window.close();
  };

  const isNew = (gameDate) => {
    if (!gameDate) return false;
    const gameAddedDate = new Date(gameDate);
    const time = 13 * 24 * 60 * 60 * 1000;
    const now = new Date();
    return (now - gameAddedDate) < time;
  };

  const isFixed = (gameFixedDate) => {
    if (!gameFixedDate) return false;
    const gameFixedDateObj = new Date(gameFixedDate);
    const time = 13 * 24 * 60 * 60 * 1000;
    const now = new Date();
    return (now - gameFixedDateObj) < time;
  };

  const sortedAndFilteredGames = games
    .filter(game => game.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.title.localeCompare(b.title);
      } else {
        return b.title.localeCompare(a.title);
      }
    });

  const initalSlidingContainerStyle = {
    transform: 'translateX(66.666%)',
  };


  return (
    <>
      <div ref={containerRef} className={`btop-container ${isFullscreen ? 'fullscreen' : ''}`} onMouseMove={handleMouseMove}>

        <Nav
          activeView={activeView}
          onCyanideClick={() => handleNavClick('games')}
          onSulfurClick={() => handleNavClick('proxy')}
          onFlorideClick={() => handleNavClick('floride')}
          className={isFullscreen ? 'hidden' : ''}
        />

        <div className={`top-buttons ${isFullscreen ? 'hidden' : ''}`}>
          <button onClick={handleFullscreen} className="top-fullscreen-button" title="Fullscreen"><span class="material-symbols-outlined">fullscreen</span></button>
          <button onClick={handleClose} className="top-close-button" title="Close"><span class="material-symbols-outlined">power_settings_new</span></button>
        </div>

        <div className="btop-box">
          <div className={`sliding-container ${activeView} `}>
            <div className="games-list">
              <div className="search-bar-container">
                <input
                  type="text"
                  placeholder="Search games..."
                  className="search-bar"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="btop-table-container">
                <table className="btop-table">
                  <thead>
                    <tr>
                      <th onClick={handleSort} style={{ cursor: 'pointer' }}>
                        Title: {sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />}
                      </th>
                      <th>Genre:</th>
                      <th>Status:</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr onClick={handleRecommendClick} className="recommend-row">
                      <td className="game-title recommend-title">
                        <span style={{ color: 'white', marginRight: '5px' }}>[+]</span>
                        Recommend a game
                      </td>
                      <td className="game-genre"></td>
                      <td className="game-status-text unknown"></td>
                    </tr>
                    {sortedAndFilteredGames.map((game, index) => (
                      <tr key={index} onClick={() => handleGameClick(game)}>
                         <td
                           onMouseEnter={() => setPreviewData({
                             src: game.imageSrc,
                             title: game.title,
                             description: game.description,
                             genre: game.genre
                           })}
                           onMouseLeave={() => setPreviewData(null)}
                           className="game-title"
                         >
                           {isFixed(game.fixedDate) && <span style={{ color: 'white', marginRight: '5px' }}>[FIXED]</span>}
                           {isNew(game.date) && <span style={{ color: 'white', marginRight: '5px' }}>[NEW]</span>}
                           {game.title}
                         </td>
                        <td className="game-genre">{game.genre}</td>
                        <td className={`game-status-text ${game.status[0].toLowerCase()}`}>{game.status[0]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="proxy-page">
              <iframe src="https://sulfur-cyanide.vercel.app/rx" title="Sulfur Proxy" width="100%" height="100%" style={{ border: 'none' }} />
            </div>
            <div className="floride-page">
              <Floride />
            </div>
          </div>
        </div>

        {previewData && (
          <div
            className="game-preview"
            style={{
              top: `${getPreviewTopPosition()}px`,
              left: `${mousePosition.x + 15}px`
            }}
          >
            <img src={previewData.src} alt="Game Preview" className="preview-image" />
            <div className="preview-details">
              <p className="preview-title">{previewData.title}</p>
              <p className="preview-genre">{previewData.genre}</p>
              {/* <p className="preview-description">{previewData.description || 'No description available.'}</p> */}
            </div>
          </div>
        )}
      </div>
      <StatusBar />
    </>
  );
};

export default GamesList;