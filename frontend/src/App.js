// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/Login';
import DashboardLayout from './layout/DashboardLayout';
import DashboardMain from './components/DashboardMain';
import Courses from './pages/Courses';
import Attendance from './pages/Attendance';
import Timetable from './pages/Timetable';
import Doubts from './pages/Doubts';
import Exams from './pages/Exams';
import StudyMaterials from './pages/StudyMaterials';
import AdminOverview from './pages/admin/Overview';
import ManageUsers from './pages/admin/ManageUsers';
import SystemSettings from './pages/admin/SystemSettings';
import HODReports from './pages/hod/Reports';
import RoleAssignments from './pages/hod/RoleAssignments';

function App() {
  const adminItems = [
    { label: 'Overview', path: '/admin' },
    { label: 'Manage Users', path: '/admin/users' },
    { label: 'System Settings', path: '/admin/settings' },
    { label: 'Courses', path: '/admin/courses' },
    { label: 'Attendance', path: '/admin/attendance' },
    { label: 'Timetable', path: '/admin/timetable' },
    { label: 'Doubts', path: '/admin/doubts' },
    { label: 'Exams', path: '/admin/exams' }
  ];

  const teacherItems = [
    { label: 'Dashboard', path: '/teacher' },
    { label: 'Courses', path: '/teacher/courses' },
    { label: 'Attendance', path: '/teacher/attendance' },
    { label: 'Timetable', path: '/teacher/timetable' },
    { label: 'Doubts', path: '/teacher/doubts' },
    { label: 'Exams', path: '/teacher/exams' }
  ];

  const hodItems = [
    { label: 'Dashboard', path: '/hod' },
    { label: 'Courses', path: '/hod/courses' },
    { label: 'Timetable', path: '/hod/timetable' },
    { label: 'Reports', path: '/hod/reports' },
    { label: 'Role Assignments', path: '/hod/roles' }
  ];

  const studentItems = [
    { label: 'Dashboard', path: '/student' },
    { label: 'Courses', path: '/student/courses' },
    { label: 'Attendance', path: '/student/attendance' },
    { label: 'Timetable', path: '/student/timetable' },
    { label: 'Doubts', path: '/student/doubts' },
    { label: 'Exams', path: '/student/exams' },
    { label: 'Study Materials', path: '/student/materials' }
  ];

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['admin']}>
                <DashboardLayout role="admin" items={adminItems} />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminOverview />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="settings" element={<SystemSettings />} />
            <Route path="courses" element={<Courses />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="timetable" element={<Timetable />} />
            <Route path="doubts" element={<Doubts />} />
            <Route path="exams" element={<Exams />} />
          </Route>

          {/* Teacher */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute roles={['teacher']}>
                <DashboardLayout role="teacher" items={teacherItems} />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardMain role="teacher" />} />
            <Route path="courses" element={<Courses />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="timetable" element={<Timetable />} />
            <Route path="doubts" element={<Doubts />} />
            <Route path="exams" element={<Exams />} />
          </Route>

          {/* HOD */}
          <Route
            path="/hod"
            element={
              <ProtectedRoute roles={['hod']}>
                <DashboardLayout role="hod" items={hodItems} />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardMain role="hod" />} />
            <Route path="courses" element={<Courses />} />
            <Route path="timetable" element={<Timetable />} />
            <Route path="reports" element={<HODReports />} />
            <Route path="roles" element={<RoleAssignments />} />
          </Route>

          {/* Student */}
          <Route
            path="/student"
            element={
              <ProtectedRoute roles={['student']}>
                <DashboardLayout role="student" items={studentItems} />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardMain role="student" />} />
            <Route path="courses" element={<Courses />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="timetable" element={<Timetable />} />
            <Route path="doubts" element={<Doubts />} />
            <Route path="exams" element={<Exams />} />
            <Route path="materials" element={<StudyMaterials />} />
          </Route>

          {/* Legacy fallback from /home to role-based */}
          <Route path="/home/*" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
