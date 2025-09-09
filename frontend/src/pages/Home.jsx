// src/pages/Home.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Dashboard from '../components/Dashboard';
import '../styles/Home.css';

function Home() {
  const { user } = useAuth();
  const role = user?.role;
  const roleClass =
    role === 'student' ? 'dashboard-student' :
    role === 'teacher_level2' ? 'dashboard-teacher' :
    role === 'teacher_level1' ? 'dashboard-hod' :
    role === 'admin' ? 'dashboard-admin' : '';

  return (
    <div className={roleClass} style={{ minHeight: '100vh' }}>
      <Navbar />
      <Dashboard />
    </div>
  );
}

export default Home;
