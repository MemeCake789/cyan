import React, { useState, useEffect } from "react";
import "./StatusBar.css";

const StatusBar = () => {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000); // Update every second

    return () => {
      clearInterval(timer);
    };
  }, []);

  const formattedDate = dateTime.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = dateTime.toLocaleTimeString();

  return (
    <div className="status-bar">
      <div className="status-left">
        cyλn 2.0 BETA | {formattedDate} | {formattedTime}
      </div>
      <div className="status-right">
         2.4c (Floride (AI) Fix (Using Gemini 2.5 Fash))
      </div>
    </div>
  );
};

export default StatusBar;
