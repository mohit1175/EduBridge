import React from 'react';
import '../styles/Navbar.css';

function Navbar() {
  return (
    <div className="navbar">
      <h1>EduBridge</h1>
      <div className="nav-links">
        <a href="/home">Home</a>
        <a href="/">Logout</a>
      </div>
    </div>
  );
}

export default Navbar;