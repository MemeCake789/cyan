import React from 'react';
import './Popup.css';

const Popup = ({ handleClose }) => {
  return (
    <div className="popup-box">
      <div className="box">
        <span className="close-icon" onClick={handleClose}>x</span>
        <b>Welcome to Cyanide!</b>
        <p>This is a web-based game platform. You can play a variety of games directly in your browser.</p>
        <p>This project is still in development. More features and games are coming soon!</p>
      </div>
    </div>
  );
};

export default Popup;