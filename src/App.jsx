import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Addnote from "./Components/Addnote";
import Sidepanel from "./Components/Sidepanel";
import Maincontent from "./Components/Maincontent";

function App() {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Determine if viewing a group
  const isGroupRoute = /^\/group\/\d+$/.test(location.pathname);

  return (
    <div className="container" style={{ display: "flex", minHeight: "100vh" }}>
      <Sidepanel />
      <div style={{ flex: 1, position: "relative" }}>
        <Routes>
          {/* Route for group: show chat/messages (Addnote), nothing else */}
          <Route path="/group/:id" element={<Addnote />} />
          {/* Route for home/root: show Maincontent (illustration) */}
          <Route path="/" element={!isMobile ? <Maincontent /> : null} />
          {/* Add other routes as needed */}
        </Routes>
      </div>


      
    </div>
  );
}

export default App;

