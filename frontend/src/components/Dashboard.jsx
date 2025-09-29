import React from 'react';
import { NavLink, Routes, Route } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Courses from '../pages/CoursesNew';
import Attendance from '../pages/AttendanceNew';
import Timetable from '../pages/TimetableNew';
import Doubts from '../pages/DoubtsNew';
import Exams from '../pages/ExamsNew';
import DashboardMain from './DashboardMain';
import StudyMaterials from '../pages/StudyMaterials';
import '../styles/Dashboard.css';

const AdminLazy = React.lazy(() => import('../pages/Admin'));
const NoticesAdmin = React.lazy(() => import('../pages/NoticesAdmin'));
const AdminLogs = React.lazy(() => import('../pages/AdminLogs'));

function Dashboard() {
  const { user } = useAuth();
  const username = user?.name || 'User';
  const role = user?.role;

  const roleClass =
    role === 'student' ? 'dashboard-student' :
    role === 'teacher_level2' ? 'dashboard-teacher' :
    role === 'teacher_level1' ? 'dashboard-hod' :
    role === 'admin' ? 'dashboard-admin' : '';
  const headerClass =
    role === 'student' ? 'dashboard-header student' :
    role === 'teacher_level2' ? 'dashboard-header teacher' :
    role === 'teacher_level1' ? 'dashboard-header hod' :
    role === 'admin' ? 'dashboard-header admin' : 'dashboard-header';

  const tabs = role === 'admin'
    ? [
        { name: 'Dashboard', path: '/home/dashboard' },
        { name: 'Courses', path: '/home/courses' },
        { name: 'Attendance', path: '/home/attendance' },
        { name: 'Exams', path: '/home/exams' },
    { name: 'Notices', path: '/home/notices-admin' },
    { name: 'Admin Logs', path: '/home/admin-logs' },
    { name: 'Admin', path: '/home/admin' }
      ]
    : [
        { name: 'Dashboard', path: '/home/dashboard' },
        { name: 'Courses', path: '/home/courses' },
        { name: 'Attendance', path: '/home/attendance' },
        { name: 'Timetable', path: '/home/timetable' },
        { name: 'Doubts', path: '/home/doubts' },
        { name: 'Exams', path: '/home/exams' },
        { name: 'Study Materials', path: '/home/materials' }
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
        <Route path="dashboard" element={<DashboardMain />} />
        <Route path="courses" element={<Courses />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="timetable" element={<Timetable />} />
        <Route path="doubts" element={<Doubts />} />
        <Route path="exams" element={<Exams />} />
        <Route path="materials" element={<StudyMaterials />} />
        <Route path="admin" element={<React.Suspense fallback={null}><AdminLazy /></React.Suspense>} />
    <Route path="notices-admin" element={<React.Suspense fallback={null}><NoticesAdmin /></React.Suspense>} />
    <Route path="admin-logs" element={<React.Suspense fallback={null}><AdminLogs /></React.Suspense>} />
      </Routes>
    </div>
  );
}

export default Dashboard;
