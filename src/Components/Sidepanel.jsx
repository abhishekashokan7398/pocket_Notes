import React, { useState, useEffect, useRef } from "react";
import "react-responsive-modal/styles.css";
import { Modal } from "react-responsive-modal";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/sidepanel.css";

// ... imports remain the same

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

  /** Responsive watcher */
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /** Load groups from storage on mount */
  useEffect(() => {
    const storedGroups = localStorage.getItem("groups");
    if (storedGroups) setGroups(JSON.parse(storedGroups));
  }, []);

  /** Scrollbar update when groups change */
  useEffect(() => {
    updateScrollbarVisibility();
  }, [groups]);

  function getInitials(name) {
    const words = name.trim().split(" ").filter(Boolean);
    return words.slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  }

  function updateScrollbarVisibility() {
    const list = listRef.current;
    if (!list) return;
    setShowScrollbar(list.scrollHeight > list.clientHeight);
  }

  function handleCreateGroup() {
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
    setOpen(false);
    toast.success("Group created successfully!");
    setTimeout(updateScrollbarVisibility, 0);
  }

  function handleGroupClick(groupId) {
    navigate(`/group/${groupId}`);
  }

  // Custom scrollbar events
  function handleScroll() {
    const list = listRef.current;
    if (!list) return;
    const thumbHeight = 40;
    const scrollableHeight = list.scrollHeight - list.clientHeight;
    const scrollRatio = list.scrollTop / scrollableHeight;
    const trackHeight = isMobile ? window.innerHeight - 60 : list.clientHeight;
    const maxThumbTop = trackHeight - thumbHeight;
    const newThumbTop = scrollRatio * maxThumbTop;
    setThumbTop(`${Math.min(newThumbTop, maxThumbTop)}px`);
  }

  function handleThumbMouseDown(e) {
    e.preventDefault();
    isDragging.current = true;
    startY.current = e.clientY;
    startScrollTop.current = listRef.current.scrollTop;
    document.addEventListener("mousemove", handleThumbMouseMove);
    document.addEventListener("mouseup", handleThumbMouseUp);
  }

  function handleThumbMouseMove(e) {
    if (!isDragging.current) return;
    const list = listRef.current;
    const deltaY = e.clientY - startY.current;
    const maxScroll = list.scrollHeight - list.clientHeight;
    const scrollRatio = maxScroll / (list.clientHeight - 40);
    let newScrollTop = startScrollTop.current + deltaY * scrollRatio;
    newScrollTop = Math.max(0, Math.min(newScrollTop, maxScroll));
    list.scrollTop = newScrollTop;
  }

  function handleThumbMouseUp() {
    isDragging.current = false;
    document.removeEventListener("mousemove", handleThumbMouseMove);
    document.removeEventListener("mouseup", handleThumbMouseUp);
  }

  // Highlight active group by ID from URL
  const activeGroupId = location.pathname.startsWith("/group/")
    ? parseInt(location.pathname.split("/group/")[1])
    : null;

  // 👇 Detect if we're inside a group page (for mobile only)
  const isGroupPage = isMobile && location.pathname.startsWith("/group/");

  return (
    <div className="side">
      <h2>Pocket Notes</h2>
      <div
        className="group-list"
        ref={listRef}
        onScroll={handleScroll}
        style={{
          height: isMobile ? "calc(100vh - 120px)" : undefined,
        }}
      >
        {groups.map((group) => (
          <div
            className={`group-item${activeGroupId === group.id ? " active" : ""}`}
            key={group.id}
            onClick={() => handleGroupClick(group.id)}
          >
            <div className="group-circle" style={{ background: group.color }}>
              {group.initials}
            </div>
            <div className="group-name">{group.name}</div>
          </div>
        ))}
      </div>

      {/* Custom scrollbar (hidden in mobile group page) */}
      {showScrollbar && !isGroupPage && (
        <div className="custom-scrollbar-track">
          <div
            className="custom-scrollbar-thumb"
            style={{ top: thumbTop }}
            onMouseDown={handleThumbMouseDown}
          />
        </div>
      )}

      {/* Add Group Floating Button (hidden in mobile group page) */}
      {!isGroupPage && (
        <button className="add-btn" title="Add Group" onClick={() => setOpen(true)}>
          +
        </button>
      )}

      {/* Add Group Modal */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        center
        classNames={{ modal: "custom-modal" }}
        showCloseIcon={false}
        aria-labelledby="modal-title"
      >
        <div className="modal-title">Create New Group</div>
        <div className="form-row">
          <label htmlFor="groupName">Group Name:</label>
          <input
            id="groupName"
            className="modal-input"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            maxLength={25}
            autoFocus
            placeholder="Enter group Name"
          />
        </div>
        <div className="form-row">
          <label>Choose color:</label>
          <div className="color-options">
            {colors.map((color) => (
              <span
                key={color}
                className={`color-circle${selectedColor === color ? " selected" : ""}`}
                style={{ background: color }}
                onClick={() => setSelectedColor(color)}
              ></span>
            ))}
          </div>
        </div>
        <div className="button-row">
          <button className="create-btn" onClick={handleCreateGroup}>
            Create
          </button>
        </div>
      </Modal>

      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
    </div>
  );
}
