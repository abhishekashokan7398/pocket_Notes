import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/addnote.css";
import MessageList from "./MessageList";

function Addnote() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [notes, setNotes] = useState([]);
  // For responsive logic in your JS (if you want; CSS will handle layout)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);

  // Get group info from localStorage
  const groups = JSON.parse(localStorage.getItem("groups")) || [];
  const selectedGroup = groups.find((group) => group.id === parseInt(id));

  // Load notes for this group
  useEffect(() => {
    const notesKey = `notes-${id}`;
    const existingNotes = JSON.parse(localStorage.getItem(notesKey)) || [];
    setNotes(existingNotes);
  }, [id]);

  // Handle responsiveness (optional; relies on CSS for layout)
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle send
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

  // Send on Enter (but not Shift+Enter)
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!selectedGroup) {
    return (
      <div className="note">
        <div className="top">
          <button className="back-btn" onClick={() => navigate(-1)}>
            &larr;
          </button>
          <span className="group-title">Group Not Found</span>
        </div>
        <div className="content">The group does not exist.</div>
      </div>
    );
  }

  return (
    <div className="note">
      {/* Top header bar */}
      <div className="top">
        <button className="back-btn" onClick={() => navigate(-1)}>&larr;</button>
        <span className="group-icon" style={{ background: selectedGroup.color }}>
          {selectedGroup.initials}
        </span>
        <span className="group-title">{selectedGroup.name}</span>
      </div>

      {/* Messages */}
      <MessageList message={notes} />

      {/* Add note input at the bottom */}
      <div className="addnote">
        <div className="text">
          <textarea
            className="note-input"
            placeholder="Enter your text here..."
            value={message}
            rows={isMobile ? 1 : 2}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
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
                  marginTop: "5px",
                  marginRight: "15px",
                }}
              >
                ➤
              </button>
        </div>
      </div>
    </div>
  );
}

export default Addnote;
