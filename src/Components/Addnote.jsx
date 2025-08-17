import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/addnote.css";
import MessageList from "./MessageList";

function Addnote() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [notes, setNotes] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 360);

  const groups = JSON.parse(localStorage.getItem("groups")) || [];
  const selectedGroup = groups.find((group) => group.id === parseInt(id));

  useEffect(() => {
    const notesKey = `notes-${id}`;
    const existingNotes = JSON.parse(localStorage.getItem(notesKey)) || [];
    setNotes(existingNotes);
  }, [id]);

  // Update isMobile on window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 360);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSend = () => {
    if (!message.trim()) return;
    const notesKey = `notes-${id}`;
    const existingNotes = JSON.parse(localStorage.getItem(notesKey)) || [];
    const newNote = { text: message, date: new Date().toISOString() };
    const updatedNotes = [...existingNotes, newNote];
    localStorage.setItem(notesKey, JSON.stringify(updatedNotes));
    setNotes(updatedNotes);
    setMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Top section */}
      <div
        className="top"
        style={{
          backgroundColor: "#16008B",
          height: "100px",
          width: "100%",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          color: "white",
          position: "fixed",
          top: 0,
          zIndex: 1000,
        }}
      >
        {/* Back arrow only on mobile */}
        {isMobile && (
          <div
            onClick={() => navigate("/")}
            style={{
              fontSize: "30px",
              fontWeight:'bold',
              cursor: "pointer",
              marginRight: "15px",
              display: "flex",
              alignItems: "center",
              color: "white",
            }}
          >
            ←
          </div>
        )}

        {/* Group circle */}
        <div
          style={{
            backgroundColor: selectedGroup?.color,
            borderRadius: "50%",
            width: "70px",
            height: "70px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: "30px",
            marginRight: "15px",
          }}
        >
          {selectedGroup?.initials}
        </div>

        {/* Group name */}
        <h3 style={{ fontSize: "30px" }}>{selectedGroup?.name}</h3>
      </div>

      {/* Notes section */}
      <div className="note" style={{ marginTop: "10vh", position: "fixed" }}>
        <MessageList message={notes} />

        {selectedGroup && (!isMobile || (isMobile && selectedGroup)) && (
          <div className="addnote">
            <div className="text" style={{ display: "flex",height:'120px' }}>
              <textarea
                placeholder="Enter your text here........"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{
                  resize: "none",
                  border: "none",
                  outline: "none",
                  flex: 1,
                  padding: "10px 20px",
                  fontSize:  isMobile ? "15px" : "20px",
                  marginTop:"-40px",
                  fontFamily: "roboto",
                  overflow: "hidden",
                }}
              />
              <button
                onClick={handleSend}
                disabled={!message.trim()}
                style={{
                  background: "none",
                  border: "none",
                  cursor: message.trim() ? "pointer" : "not-allowed",
                  padding: "30px 8px",
                  fontSize: "25px",
                  color: message.trim() ? "#16008B" : "#ABABAB",
                  marginTop: "50px",
                  marginRight: "15px",
                }}
              >
                ➤
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Addnote;
