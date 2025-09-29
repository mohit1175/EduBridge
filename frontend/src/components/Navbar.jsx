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
          <button
            className="logout-btn"
            onClick={handleLogout}
            aria-label="Log out"
            title="Log out"
          >
            <svg className="icon-power" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="2" x2="12" y2="12" />
              <path d="M5.2 7.2a8 8 0 1 0 13.6 0" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Navbar;