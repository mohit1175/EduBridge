// src/pages/Home.jsx
import React from 'react';
import Navbar from '../components/Navbar';
import Dashboard from '../components/Dashboard';
import '../styles/Home.css';

function Home() {
  const role = localStorage.getItem('userRole'); // Get role from localStorage

  return (
    <>
      <Navbar />
      <Dashboard role={role} />
    </>
  );
}

export default Home;
