// src/pages/Home.jsx
import React from 'react';
import Navbar from '../components/Navbar';
import Dashboard from '../components/Dashboard';
import '../styles/Home.css';

function Home() {
  const role = localStorage.getItem('userRole'); // Get role from localStorage
  const roleClass =
    role === 'student' ? 'dashboard-student' :
    role === 'teacher_level2' ? 'dashboard-teacher' :
    role === 'teacher_level1' ? 'dashboard-hod' : '';

  return (
    <div className={roleClass} style={{ minHeight: '100vh' }}>
      <Navbar />
      <Dashboard role={role} />
    </div>
  );
}

export default Home;
