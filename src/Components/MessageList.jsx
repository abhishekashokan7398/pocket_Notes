import React, { useRef, useState, useEffect } from "react";
import '../styles/messagelist.css'
const MessageList = ({ message }) => {
  const sortedMessages = [...message].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const listRef = useRef(null);
  const thumbRef = useRef(null);

  const isDragging = useRef(false);
  const startY = useRef(0);
  const startScrollTop = useRef(0);

  const thumbTopRef = useRef(0);

  const [thumbTop, setThumbTop] = useState("0px");
  const [thumbHeight, setThumbHeight] = useState(50); // fixed height
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 360);
  const [showScrollbar, setShowScrollbar] = useState(false);

  const fixedHeight = 60; // fixed thumb height

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 360);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const updateThumb = () => {
    if (isDragging.current) return;

    const list = listRef.current;
    if (!list) return;

    const { clientHeight, scrollHeight, scrollTop } = list;

    if (scrollHeight <= clientHeight) {
      setThumbTop("0px");
      thumbTopRef.current = 0;
      return;
    }

    // Always use fixed height
    setThumbHeight(fixedHeight);

    const maxThumbTop = clientHeight - fixedHeight;
    const newThumbTop = (scrollTop / (scrollHeight - clientHeight)) * maxThumbTop;

    setThumbTop(newThumbTop + "px");
    thumbTopRef.current = newThumbTop;
  };

  // ✅ Decide scrollbar visibility only when messages change
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const { clientHeight, scrollHeight } = list;
    setShowScrollbar(message.length > 0 && scrollHeight > clientHeight);

    updateThumb();

    list.addEventListener("scroll", updateThumb);
    window.addEventListener("resize", updateThumb);

    return () => {
      list.removeEventListener("scroll", updateThumb);
      window.removeEventListener("resize", updateThumb);
    };
  }, [message]);

  const handleThumbMouseDown = (e) => {
    e.preventDefault();
    isDragging.current = true;
    startY.current = e.clientY;
    startScrollTop.current = listRef.current.scrollTop;
    document.body.style.userSelect = "none";

    document.addEventListener("mousemove", handleThumbMouseMove);
    document.addEventListener("mouseup", handleThumbMouseUp);
  };

  const handleThumbMouseMove = (e) => {
    if (!isDragging.current) return;
    const list = listRef.current;
    const deltaY = e.clientY - startY.current;
    const { clientHeight, scrollHeight } = list;
    const maxThumbTop = clientHeight - thumbHeight;
    const scrollRatio = (scrollHeight - clientHeight) / maxThumbTop;

    const newScrollTop = startScrollTop.current + deltaY * scrollRatio;
    list.scrollTop = Math.min(Math.max(newScrollTop, 0), scrollHeight - clientHeight);

    let newThumbTop = (list.scrollTop / (scrollHeight - clientHeight)) * maxThumbTop;
    newThumbTop = Math.min(Math.max(newThumbTop, 0), maxThumbTop);
    thumbTopRef.current = newThumbTop;

    if (thumbRef.current) {
      thumbRef.current.style.top = newThumbTop + "px";
    }
  };

  const handleThumbMouseUp = () => {
    isDragging.current = false;
    document.body.style.userSelect = "auto";
    document.removeEventListener("mousemove", handleThumbMouseMove);
    document.removeEventListener("mouseup", handleThumbMouseUp);
    setThumbTop(thumbTopRef.current + "px");
  };

  const handleTrackClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const list = listRef.current;
    if (!list) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const { clientHeight, scrollHeight } = list;

    const thumbHalf = thumbHeight / 2;
    const maxScrollTop = scrollHeight - clientHeight;
    const maxThumbTop = clientHeight - thumbHeight;

    let newThumbTop = clickY - thumbHalf;
    newThumbTop = Math.max(0, Math.min(newThumbTop, maxThumbTop));

    const newScrollTop = (newThumbTop / maxThumbTop) * maxScrollTop;
    list.scrollTop = newScrollTop;

    updateThumb();
  };

  return (
    <div style={{ position: "relative", height: "62vh" }}>
      <div
        ref={listRef}
        style={{
          overflowY: "auto",
          overflowX: "hidden", // hide horizontal scrollbar
          maxHeight: "70vh",
          paddingRight: "24px",
        }}
      >
        {sortedMessages.map((msg, index) => {
          const createdAt = new Date(msg.date);
          return (
            <div
              key={index}
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                padding: "15px",
                marginBottom: "15px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                width: "calc(100% - 100px)",
                marginLeft: "40px",
                marginTop: "25px",
              }}
            >
              <p
                style={{
                  marginBottom: "10px",
                   fontSize: isMobile ? "16px" : "18px",
                  fontFamily: "roboto",
                }}
              >
                {msg.text}
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  fontSize: isMobile ? "12px" : "14px",
                  color: "#555",
                  fontWeight: "bold",
                  gap: "8px",
                    marginRight: isMobile ? "" : "20px",
                  fontFamily: "roboto",
                }}
              >
                <span>
                  {createdAt.toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span>•</span>
                <span>
                  {createdAt
                    .toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                    .replace("am", "AM")
                    .replace("pm", "PM")}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {showScrollbar && (
        <>
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 4,
              width: "8px",
              height: isMobile ? "70vh" : "70vh",
              backgroundColor: "#9a9a9a",
              borderRadius: "6px",
              cursor: "pointer",
              pointerEvents: "auto",
              zIndex: 10,
            }}
            onClick={handleTrackClick}
          />
          <div
            ref={thumbRef}
            onMouseDown={handleThumbMouseDown}
            style={{
              position: "absolute",
              top: thumbTop,
              right: 4,
              width: "8px",
              height: thumbHeight,
              backgroundColor: "white",
              borderRadius: "6px",
              cursor: "pointer",
              pointerEvents: "auto",
              zIndex: 11,
              userSelect: "none",
            }}
          />
        </>
      )}
    </div>
  );
};

export default MessageList;
