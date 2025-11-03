import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import { Analytics } from "@vercel/analytics/react";
import GamesList from "./GamesList";
import GamePage from "./GamePage";
import Browser from "./Browser";

function App() {
  // useEffect(() => {
  //   alert(
  //     "PSA : Most of the games on this site are not working becuase I am currently working on a new loading system. check back in a day :P",
  //   );
  // }, []);
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<GamesList />} />
          <Route path="/game/:title" element={<GamePage />} />
          <Route path="/browser" element={<Browser />} />
        </Routes>
        <Analytics />
      </div>
    </Router>
  );
}

export default App;
