import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

function DashboardMain({ role }) {
  const navigate = useNavigate();

  const stats = {
    student: [
      { label: 'Enrolled Courses', value: 5, color: 'blue' },
      { label: 'Attendance Rate', value: '88%', color: 'green' },
      { label: 'Avg. Grade', value: 'A-', color: 'purple' },
      { label: 'Doubts Resolved', value: 12, color: 'orange' }
    ],
    teacher_level2: [
      { label: 'Courses Teaching', value: 3, color: 'blue' },
      { label: 'Attendance Marked', value: 24, color: 'green' },
      { label: 'Doubts Answered', value: 7, color: 'purple' },
      { label: 'Papers Evaluated', value: 5, color: 'orange' }
    ],
    teacher_level1: [
      { label: 'Total Courses', value: 10, color: 'blue' },
      { label: 'Reports Submitted', value: 8, color: 'green' },
      { label: 'Teachers Managed', value: 5, color: 'purple' },
      { label: 'Role Assignments', value: 3, color: 'orange' }
    ]
  };

  const quickActions = {
    student: [
      { label: 'View Timetable', route: '/home/timetable' },
      { label: 'My Attendance', route: '/home/attendance' },
      { label: 'Ask Doubt', route: '/home/doubts' },
      { label: 'View Results', route: '/home/exams' }
    ],
    teacher_level2: [
      { label: 'Mark Attendance', route: '/home/attendance' },
      { label: 'View Doubts', route: '/home/doubts' },
      { label: 'Manage Schedule', route: '/home/timetable' },
      { label: 'Upload Grades', route: '/home/exams' }
    ],
    teacher_level1: [
      { label: 'Assign Roles', route: '/home/courses' },
      { label: 'Add Course', route: '/home/courses' },
      { label: 'Generate Report', route: '/home/exams' },
      { label: 'Manage Timetable', route: '/home/timetable' }
    ]
  };

  const userStats = stats[role] || [];
  const userActions = quickActions[role] || [];

  return (
    <>
      {role === 'student' && <h2>Student Dashboard</h2>}
      {role === 'teacher_level2' && <h2>Teacher Dashboard</h2>}
      {role === 'teacher_level1' && <h2>HOD Dashboard</h2>}
      <div className="stats-grid">
        {userStats.map((s, i) => (
          <div key={i} className={`stat-card ${s.color}`}>
            {s.label}<br />
            <strong>{s.value}</strong>
          </div>
        ))}
      </div>
      <div className="quick-actions">
        {userActions.map((a, i) => (
          <button key={i} onClick={() => navigate(a.route)}>{a.label}</button>
        ))}
      </div>
    </>
  );
}

export default DashboardMain;
