import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import { Analytics } from "@vercel/analytics/react";
import GamesList from './GamesList';
import GamePage from './GamePage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<GamesList />} />
          <Route path="/game/:title" element={<GamePage />} />
        </Routes>
        <Analytics />
      </div>
    </Router>
  );
}

export default App;