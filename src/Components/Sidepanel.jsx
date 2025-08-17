import React, { useState, useEffect, useRef } from "react";
import "react-responsive-modal/styles.css"; // ✅ required styles
import { Modal } from "react-responsive-modal";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/sidepanel.css";

export default function Sidepanel() {
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [thumbTop, setThumbTop] = useState("0px");
  const [showScrollbar, setShowScrollbar] = useState(false);
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const listRef = useRef(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startScrollTop = useRef(0);

  const navigate = useNavigate();
  const location = useLocation();

  const colors = ["#a98ff5", "#ff70d9", "#63e3f2", "#f2a873", "#0047FF", "#6691FF"];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const storedGroups = localStorage.getItem("groups");
    if (storedGroups) setGroups(JSON.parse(storedGroups));
  }, []);

  useEffect(() => {
    updateScrollbarVisibility();
  }, [groups]);

  const getInitials = (name) => {
    const words = name.trim().split(" ").filter(Boolean);
    return words.slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  };

  const updateScrollbarVisibility = () => {
    const list = listRef.current;
    if (!list) return;
    setShowScrollbar(list.scrollHeight > list.clientHeight);
  };

  const handleCreateGroup = () => {
    const trimmedName = groupName.trim();
    if (!trimmedName) return toast.error("Please enter a group name");
    if (!selectedColor) return toast.error("Please select a color");

    const duplicate = groups.some(
      (g) => g.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (duplicate) return toast.warning("Group name already exists.");

    const newGroup = {
      id: Date.now(),
      name: trimmedName,
      color: selectedColor,
      initials: getInitials(trimmedName),
    };

    setGroups((prev) => {
      const updated = [...prev, newGroup];
      localStorage.setItem("groups", JSON.stringify(updated));
      return updated;
    });

    setGroupName("");
    setSelectedColor("");
    setOpen(false); // ✅ closes modal after create
    toast.success("Group created successfully!");
    setTimeout(updateScrollbarVisibility, 0);
  };

  const handleGroupClick = (groupId) => {
    navigate(`/group/${groupId}`);
  };

  const handleScroll = () => {
    const list = listRef.current;
    if (!list) return;

    const thumbHeight = 40;
    const scrollableHeight = list.scrollHeight - list.clientHeight;
    const scrollRatio = list.scrollTop / scrollableHeight;

    const trackHeight = isMobile ? window.innerHeight - 60 : list.clientHeight;
    const maxThumbTop = trackHeight - thumbHeight;
    const newThumbTop = scrollRatio * maxThumbTop;

    setThumbTop(`${Math.min(newThumbTop, maxThumbTop)}px`);
  };

  const handleThumbMouseDown = (e) => {
    e.preventDefault();
    isDragging.current = true;
    startY.current = e.clientY;
    startScrollTop.current = listRef.current.scrollTop;
    document.addEventListener("mousemove", handleThumbMouseMove);
    document.addEventListener("mouseup", handleThumbMouseUp);
  };

  const handleThumbMouseMove = (e) => {
    if (!isDragging.current) return;
    const list = listRef.current;
    const deltaY = e.clientY - startY.current;
    const maxScroll = list.scrollHeight - list.clientHeight;
    const scrollRatio = maxScroll / (list.clientHeight - 40);
    let newScrollTop = startScrollTop.current + deltaY * scrollRatio;
    newScrollTop = Math.max(0, Math.min(newScrollTop, maxScroll));
    list.scrollTop = newScrollTop;
  };

  const handleThumbMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener("mousemove", handleThumbMouseMove);
    document.removeEventListener("mouseup", handleThumbMouseUp);
  };

  const activeGroupId = location.pathname.startsWith("/group/")
    ? parseInt(location.pathname.split("/group/")[1])
    : null;

  return (
    <div
      className="side"
      style={
        isMobile
          ? { width: "100%", height: "100vh", position: "fixed", top: 0, left: 0, zIndex: 1000 }
          : {}
      }
    >
      <h2>Pocket Notes</h2>

      <div style={{ position: "relative", flex: 1 }}>
        <div className="group-list" ref={listRef} onScroll={handleScroll}>
          {groups.map((group) => {
            const isActive = group.id === activeGroupId;
            return (
              <div
                key={group.id}
                className={`group-item ${isActive ? "active" : ""}`}
                onClick={() => handleGroupClick(group.id)}
              >
                <div className="group-circle" style={{ background: group.color }}>
                  {group.initials}
                </div>
                <span className="group-name">{group.name}</span>
              </div>
            );
          })}
        </div>

        {showScrollbar && (
          <div
            className="custom-scrollbar-track"
            style={{
              position: "fixed",
              right: isMobile ? "0px" : "78%",
              top: isMobile ? "60px" : "130px",
              height: isMobile ? `calc(100vh - 60px)` : `calc(100vh - 130px)`,
              width: "12px",
              background: "#ccc",
              borderRadius: "8px",
              zIndex: 9999,
            }}
          >
            <div
              className="custom-scrollbar-thumb"
              style={{ top: thumbTop }}
              onMouseDown={handleThumbMouseDown}
            />
          </div>
        )}
      </div>

      <button className="add-btn" onClick={() => setOpen(true)}>+</button>

      {/* Single Modal */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}       // ✅ close on overlay/Escape
        center
        closeOnOverlayClick={true}           // ✅ clicking outside closes
        showCloseIcon={false}
        focusTrapped={false}
        classNames={{
          overlay: "rrm-overlay-fix",        // ✅ raise overlay z-index
          modal: "custom-modal-wrapper"
        }}
      >
        <div className="custom-modal">
          <h3 className="modal-title">Create New Group</h3>

          <div className="form-row">
            <label>Group Name</label>
            <input
              type="text"
              placeholder="Enter group name"
              className="modal-input"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          <div className="form-row color-row">
            <label>Choose Colour</label>
            <div className="color-options">
              {colors.map((color, index) => (
                <div
                  key={index}
                  className={`color-circle ${selectedColor === color ? "selected" : ""}`}
                  style={{ background: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>

          <div className="button-row">
            <button className="create-btn" type="button" onClick={handleCreateGroup}>
              Create
            </button>
          </div>
        </div>
      </Modal>

      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
    </div>
  );
}
