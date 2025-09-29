import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
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
    <div className={roleClass} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: '1 0 auto' }}>
        <Dashboard />
      </main>
      <Footer />
    </div>
  );
}

export default Home;
