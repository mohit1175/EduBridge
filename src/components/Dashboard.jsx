import React from 'react';
import { NavLink, Routes, Route } from 'react-router-dom';
import Courses from '../pages/Courses';
import Attendance from '../pages/Attendance.jsx';
import Timetable from '../pages/Timetable.jsx';
import Doubts from '../pages/Doubts';
import Exams from '../pages/Exams';
import DashboardMain from './DashboardMain';
import '../styles/Dashboard.css';

function Dashboard({ role }) {
  const username = localStorage.getItem('username') || 'User';

  const roleClass =
    role === 'student' ? 'dashboard-student' :
    role === 'teacher_level2' ? 'dashboard-teacher' :
    role === 'teacher_level1' ? 'dashboard-hod' : '';
  const headerClass =
    role === 'student' ? 'dashboard-header student' :
    role === 'teacher_level2' ? 'dashboard-header teacher' :
    role === 'teacher_level1' ? 'dashboard-header hod' : 'dashboard-header';

  const tabs = [
    { name: 'Dashboard', path: '/home/dashboard' },
    { name: 'Courses', path: '/home/courses' },
    { name: 'Attendance', path: '/home/attendance' },
    { name: 'Timetable', path: '/home/timetable' },
    { name: 'Doubts', path: '/home/doubts' },
    { name: 'Exams', path: '/home/exams' }
  ];

  return (
    <div className={`dashboard-container ${roleClass}`}>
      <div className={headerClass}>
        <h2>📘 Welcome, {username}!</h2>
        <span className="dashboard-role">Role: {role}</span>
      </div>

      <nav className="dashboard-tabs">
        {tabs.map(tab => (
          <NavLink
            key={tab.name}
            to={tab.path}
            className={({ isActive }) => `dashboard-tab ${isActive ? 'active' : ''}`}
          >
            {tab.name}
          </NavLink>
        ))}
      </nav>

      <Routes>
        <Route path="dashboard" element={<DashboardMain role={role} />} />
        <Route path="courses" element={<Courses />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="timetable" element={<Timetable />} />
        <Route path="doubts" element={<Doubts />} />
        <Route path="exams" element={<Exams />} />
      </Routes>
    </div>
  );
}

export default Dashboard;
