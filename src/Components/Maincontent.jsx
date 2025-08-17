import React from 'react'
import '../styles/maincontent.css'
import image from '../assets/image.png'
function Maincontent() {
 return (
    <div className="right-panel">
      <img 
        src={image} 
        alt="Illustration" 
        className="illustration"
      />
      <h1>Pocket Notes</h1>
      <p>
        Send and receive messages without keeping your phone online.<br/>
        Use Pocket Notes on up to 4 linked devices and 1 mobile phone.
      </p>
      <span className="lock-text">🔒 end-to-end encrypted</span>
    </div>
  );
}

export default Maincontent
