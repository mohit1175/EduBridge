import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || localStorage.getItem('userRole');
  const roleClass =
    role === 'student' ? 'navbar-student' :
    role === 'teacher' ? 'navbar-teacher' :
    role === 'hod' ? 'navbar-hod' :
    role === 'admin' ? 'navbar-admin' : '';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={`navbar ${roleClass}`}>
      <h1>EduBridge</h1>
      <div className="nav-links">
        <Link to={user ? `/${user.role}` : '/'}>Home</Link>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
    </div>
  );
}

export default Navbar;