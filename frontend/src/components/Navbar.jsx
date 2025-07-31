import React from 'react';
import '../styles/Navbar.css';

function Navbar() {
  const role = localStorage.getItem('userRole');
  const roleClass =
    role === 'student' ? 'navbar-student' :
    role === 'teacher_level2' ? 'navbar-teacher' :
    role === 'teacher_level1' ? 'navbar-hod' : '';
  return (
    <div className={`navbar ${roleClass}`}>
      <h1>EduBridge</h1>
      <div className="nav-links">
        <a href="/home">Home</a>
        <a href="/">Logout</a>
      </div>
    </div>
  );
}

export default Navbar;