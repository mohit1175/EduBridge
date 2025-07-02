// src/pages/Landing.jsx
import React from 'react';
import '../styles/Landing.css';

function Landing() {
  return (
    <div className="landing">
      <header className="landing-header">
        <div className="logo">📘 EduBridge</div>
        <nav className="nav-menu">
          <a href="/home">Dashboard</a>
          <a href="/courses">Courses</a>
          <a href="/attendance">Attendance</a>
          <a className="login-btn" href="/">Login</a>
        </nav>
      </header>

      <section className="hero">
        <h1>Streamline Your Educational Journey</h1>
        <p>All-in-one academic management platform for students and teachers</p>
        <a className="cta-button" href="/">Get Started</a>
      </section>

      <section className="features-grid">
        <div className="feature">👥<h4>User Management</h4></div>
        <div className="feature">📚<h4>Course Management</h4></div>
        <div className="feature">🗓<h4>Smart Timetable</h4></div>
        <div className="feature">⏰<h4>Attendance Tracking</h4></div>
        <div className="feature">📊<h4>Exam Statistics</h4></div>
        <div className="feature">💬<h4>Doubt Resolution</h4></div>
      </section>

      <section className="stats-row">
        <div className="stat">👨‍🎓<p>500+ Active Students</p></div>
        <div className="stat">👩‍🏫<p>50+ Qualified Teachers</p></div>
        <div className="stat">📘<p>120+ Courses</p></div>
        <div className="stat">🌟<p>98% Satisfaction</p></div>
      </section>

      <footer className="footer">
        <div className="footer-col">
          <h4>EduBridge</h4>
          <p>Empowering Smart Education</p>
        </div>
        <div className="footer-col">
          <h4>Links</h4>
          <a href="/">Home</a>
          <a href="/login">Login</a>
          <a href="/courses">Courses</a>
        </div>
        <div className="footer-col">
          <h4>Contact</h4>
          <p>Email: support@edubridge.com</p>
          <p>Phone: +91 9876543210</p>
        </div>
        <div className="footer-col">
          <h4>Follow Us</h4>
          <p>Instagram • Twitter • LinkedIn</p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;