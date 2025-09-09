import React from 'react';
import '../styles/Landing.css';

function Landing() {
  return (
    <div className="landing-page">
      <div className="logo">EduBridge</div>
      <div className="features">
        <div className="feature"><h4>Exam Statistics</h4></div>
        <div className="feature"><h4>Doubt Resolution</h4></div>
      </div>
      <div className="stats">
        <div className="stat"><p>500+ Active Students</p></div>
        <div className="stat"><p>50+ Qualified Teachers</p></div>
        <div className="stat"><p>120+ Courses</p></div>
      </div>
    </div>
  );
}

export default Landing;