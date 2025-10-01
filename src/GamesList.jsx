import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './GamesList.css';
import gamesData from './games.json';
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
  
  
  const [activeView, setActiveView] = useState('floride'); 

  useEffect(() => {
    setGames(gamesData.games);
    const timer = setTimeout(() => {
      setActiveView('games');
    }, 400);
    return () => clearTimeout(timer);
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

  const handleSort = () => {
    setSortOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };

  const isNew = (gameDate) => {
    if (!gameDate) return false;
    const gameAddedDate = new Date(gameDate);
    const fiveDaysInMs = 5 * 24 * 60 * 60 * 1000;
    const now = new Date();
    return (now - gameAddedDate) < fiveDaysInMs;
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
      <div className="btop-container" onMouseMove={handleMouseMove}>
        
        <Nav 
          activeView={activeView}
          onCyanideClick={() => handleNavClick('games')}
          onSulfurClick={() => handleNavClick('proxy')}
          onFlorideClick={() => handleNavClick('floride')}
        />

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
              <iframe src="https://sulfur-inky.vercel.app/rx" title="Sulfur Proxy" width="100%" height="100%" style={{ border: 'none' }} />
            </div>
            <div className="floride-page">
              {/* <h1>W.I.P</h1> <p>i need to fix the billing for the api</p> */}

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
