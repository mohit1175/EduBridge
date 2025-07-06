// src/components/DashboardMain.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

function DashboardMain({ role }) {
  const navigate = useNavigate();

  const stats = {
    student: [
      { icon: '📘', label: 'Enrolled Courses', value: 5, color: 'blue' },
      { icon: '📈', label: 'Attendance Rate', value: '88%', color: 'green' },
      { icon: '🎓', label: 'Avg. Grade', value: 'A-', color: 'purple' },
      { icon: '💬', label: 'Doubts Resolved', value: 12, color: 'orange' }
    ],
    teacher_level2: [
      { icon: '📘', label: 'Courses Teaching', value: 3, color: 'blue' },
      { icon: '✅', label: 'Attendance Marked', value: 24, color: 'green' },
      { icon: '💬', label: 'Doubts Answered', value: 7, color: 'purple' },
      { icon: '📝', label: 'Papers Evaluated', value: 5, color: 'orange' }
    ],
    teacher_level1: [
      { icon: '📘', label: 'Total Courses', value: 10, color: 'blue' },
      { icon: '📊', label: 'Reports Submitted', value: 8, color: 'green' },
      { icon: '🧑‍🏫', label: 'Teachers Managed', value: 5, color: 'purple' },
      { icon: '🎯', label: 'Role Assignments', value: 3, color: 'orange' }
    ]
  };

  const quickActions = {
    student: [
      { label: '📅 View Timetable', route: '/home/timetable' },
      { label: '📈 My Attendance', route: '/home/attendance' },
      { label: '💬 Ask Doubt', route: '/home/doubts' },
      { label: '🎓 View Results', route: '/home/exams' }
    ],
    teacher_level2: [
      { label: '📝 Mark Attendance', route: '/home/attendance' },
      { label: '💬 View Doubts', route: '/home/doubts' },
      { label: '📅 Manage Schedule', route: '/home/timetable' },
      { label: '🎯 Upload Grades', route: '/home/exams' }
    ],
    teacher_level1: [
      { label: '👑 Assign Roles', route: '/home/courses' },
      { label: '➕ Add Course', route: '/home/courses' },
      { label: '📊 Generate Report', route: '/home/exams' },
      { label: '📅 Manage Timetable', route: '/home/timetable' }
    ]
  };

  const userStats = stats[role] || [];
  const userActions = quickActions[role] || [];

  return (
    <>
      {/* Stats */}
      <div className="stats-grid">
        {userStats.map((s, i) => (
          <div key={i} className={`stat-card ${s.color}`}>
            {s.icon} {s.label}<br />
            <strong>{s.value}</strong>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="main-content-grid">
        <div className="todays-classes">
          <h3>Today's Classes</h3>
          <ul>
            <li><strong>10:00 - 11:00</strong> | Math | Room A1</li>
            <li><strong>11:15 - 12:15</strong> | Science | Room B3</li>
            <li><strong>2:00 - 3:00</strong> | CS | Room C2</li>
          </ul>
        </div>
        <div className="recent-activity">
          <h3>Recent Activity</h3>
          <ul>
            <li>✅ Attendance marked for CS</li>
            <li>💬 Doubt answered in Math</li>
            <li>📊 Report submitted</li>
          </ul>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        {userActions.map((action, idx) => (
          <button key={idx} onClick={() => navigate(action.route)}>
            {action.label}
          </button>
        ))}
      </div>
    </>
  );
}

export default DashboardMain;
