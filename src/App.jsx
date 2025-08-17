import React, { useState, useEffect } from "react";

import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";



import Addnote from "./Components/Addnote";

import Sidepanel from "./Components/Sidepanel";

import Maincontent from "./Components/Maincontent";



function App() {

  const location = useLocation();

  const isGroupSelected = location.pathname.startsWith("/group/");



  const [isMobile, setIsMobile] = useState(window.innerWidth <= 360);



  useEffect(() => {

    const handleResize = () => setIsMobile(window.innerWidth <= 360);

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);

  }, []);



  return (

    <div className="app-container" style={{ display: "flex", height: "100vh" }}>

      {/* Sidepanel: always visible on desktop, only visible on mobile if group not selected */}

      {(!isMobile || (isMobile && !isGroupSelected)) && <Sidepanel />}



      <div className="main-content" style={{ flex: 1 }}>

        <Routes>

          {/* Load Maincontent ONLY if not mobile */}

          {!isMobile && <Route path="/" element={<Maincontent />} />}

          <Route path="/group/:id" element={<Addnote />} />

        </Routes>

      </div>

    </div>

  );

}



export default App;