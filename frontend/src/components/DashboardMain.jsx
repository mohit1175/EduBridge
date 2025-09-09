import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Dashboard.css';
import api from '../utils/api';

function DashboardMain() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role;

  // Backend-driven metrics
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        if (role === 'admin') {
          const m = await api.get('/admin/metrics/overview');
          setCards([
            { label: 'Total Students', value: m.totals?.students ?? 0, color: 'blue' },
            { label: 'Total Teachers', value: m.totals?.teachers ?? 0, color: 'green' },
            { label: 'Total Courses', value: m.totals?.courses ?? 0, color: 'purple' },
            { label: 'Attendance Rate', value: `${m.attendanceRate ?? 0}%`, color: 'orange' }
          ]);
        } else if (role === 'teacher_level1') { // HOD
          const [courses, doubts, attendance] = await Promise.all([
            api.get('/courses', { department: user?.department }),
            api.get('/doubts'),
            api.get('/attendance/stats')
          ]);
          const teacherCount = (await api.get('/auth/users', { role: 'teacher_level2', department: user?.department })).length;
          setCards([
            { label: 'Total Courses', value: courses?.length ?? 0, color: 'blue' },
            { label: 'Reports Submitted', value: doubts?.filter(d => d.status !== 'pending').length ?? 0, color: 'green' },
            { label: 'Teachers Managed', value: teacherCount ?? 0, color: 'purple' },
            { label: 'Attendance Rate', value: `${attendance?.overall?.presentPercentage ?? 0}%`, color: 'orange' }
          ]);
        } else if (role === 'teacher_level2') { // Teacher
          const [myCourses, myDoubts, attStats] = await Promise.all([
            api.get('/courses', { instructor: user?._id }),
            api.get('/doubts', { assignedTo: user?._id }),
            api.get('/attendance/stats', {})
          ]);
          setCards([
            { label: 'Courses Teaching', value: myCourses?.length ?? 0, color: 'blue' },
            { label: 'Doubts Answered', value: myDoubts?.filter(d => d.status !== 'pending').length ?? 0, color: 'purple' },
            { label: 'Attendance Rate', value: `${attStats?.overall?.presentPercentage ?? 0}%`, color: 'green' },
            { label: 'Reports Submitted', value: myDoubts?.length ?? 0, color: 'orange' }
          ]);
        } else if (role === 'student') {
          const [myCourses, attStats, myDoubts, myResults] = await Promise.all([
            api.get('/courses', { department: user?.department, semester: user?.semester }),
            api.get('/attendance/stats', {}),
            api.get('/doubts', {}),
            api.get('/exams/results', {})
          ]);
          const own = (myResults || []).filter(r => r?.student?._id === user?._id);
          const perc = own.map(r => r.percentage || Math.round((r.marks / r.totalMarks) * 100)).filter(n => Number.isFinite(n));
          const gradesAvg = perc.length ? `${Math.round(perc.reduce((a,b)=>a+b,0)/perc.length)}%` : '—';
          setCards([
            { label: 'Enrolled Courses', value: myCourses?.length ?? 0, color: 'blue' },
            { label: 'Attendance Rate', value: `${attStats?.overall?.presentPercentage ?? 0}%`, color: 'green' },
            { label: 'Avg. Grade', value: gradesAvg, color: 'purple' },
            { label: 'Doubts Resolved', value: myDoubts?.filter(d => d.status === 'resolved').length ?? 0, color: 'orange' }
          ]);
        } else {
          setCards([]);
        }
      } catch (e) {
        setErr('Failed to load metrics');
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, user?._id]);

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
    ],
    admin: [
      { label: 'Upload PDFs', route: '/home/materials' },
      { label: 'Bulk Add Students', route: '/home/admin' },
      { label: 'View Metrics', route: '/home/dashboard' },
      { label: 'Manage Courses', route: '/home/courses' }
    ]
  };

  const userStats = useMemo(() => cards, [cards]);
  const userActions = quickActions[role] || [];

  return (
    <>
      {role === 'student' && <h2>Student Dashboard</h2>}
      {role === 'teacher_level2' && <h2>Teacher Dashboard</h2>}
      {role === 'teacher_level1' && <h2>HOD Dashboard</h2>}
      {role === 'admin' && <h2>Admin Dashboard</h2>}
      {loading ? (
        <div style={{ color: '#64748b', margin: '16px 0' }}>Loading metrics…</div>
      ) : err ? (
        <div style={{ color: '#ef4444', margin: '16px 0' }}>{err}</div>
      ) : (
        <div className="stats-grid">
          {userStats.map((s, i) => (
            <div key={i} className={`stat-card ${s.color}`}>
              {s.label}<br />
              <strong>{s.value}</strong>
            </div>
          ))}
        </div>
      )}
      <div className="quick-actions">
        {userActions.map((a, i) => (
          <button key={i} onClick={() => navigate(a.route)}>{a.label}</button>
        ))}
      </div>
    </>
  );
}

export default DashboardMain;
