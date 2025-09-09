import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Navbar.css';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role;
  
  const roleClass =
    role === 'student' ? 'navbar-student' :
    role === 'teacher_level2' ? 'navbar-teacher' :
    role === 'teacher_level1' ? 'navbar-hod' :
    role === 'admin' ? 'navbar-admin' : '';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={`navbar ${roleClass}`}>
      <div className="nav-inner">
        <div className="brand">
          <h1>EduBridge</h1>
        </div>
        <div className="nav-links">
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </div>
  );
}

export default Navbar;