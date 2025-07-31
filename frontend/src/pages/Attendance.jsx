// src/pages/Attendance.jsx
import React, { useState, useEffect } from 'react';
import '../styles/Attendance.css';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

const mockStudents = [
  { id: 1, name: 'Alice', course: 'Mathematics' },
  { id: 2, name: 'Bob', course: 'Computer Science' },
  { id: 3, name: 'Mohit', course: 'Physics' },
];

function Attendance() {
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');
  const [attendanceData, setAttendanceData] = useState([]);
  const [marking, setMarking] = useState({});
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const role = localStorage.getItem('userRole');
  const username = localStorage.getItem('username');

  const roleClass =
    role === 'student' ? 'attendance-student' :
    role === 'teacher_level2' ? 'attendance-teacher' :
    role === 'teacher_level1' ? 'attendance-hod' : '';

  // Load attendance from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('attendanceRecords');
    if (stored) {
      setAttendanceData(JSON.parse(stored));
    } else {
      // Auto-generate demo records for last 7 days for all students
      const today = new Date();
      const demoRecords = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        mockStudents.forEach(s => {
          demoRecords.push({
            student: s.name,
            course: s.course,
            date: dateStr,
            time: '10:00 AM',
            status: ['Present', 'Absent', 'Late'][Math.floor(Math.random() * 3)],
            teacher: 'Bob'
          });
        });
      }
      setAttendanceData(demoRecords);
      localStorage.setItem('attendanceRecords', JSON.stringify(demoRecords));
    }
  }, []);

  // Save attendance to localStorage
  useEffect(() => {
    localStorage.setItem('attendanceRecords', JSON.stringify(attendanceData));
  }, [attendanceData]);

  // Stats calculation
  const stats = (() => {
    if (role === 'teacher_level2') {
      const teacherRecords = attendanceData.filter(r => r.teacher === username);
      return {
        total: teacherRecords.length,
        present: teacherRecords.filter(r => r.status === 'Present').length,
        absent: teacherRecords.filter(r => r.status === 'Absent').length,
        rate: teacherRecords.length ? Math.round((teacherRecords.filter(r => r.status === 'Present').length / teacherRecords.length) * 100) + '%' : '0%'
      };
    } else if (role === 'teacher_level1') {
      return {
        total: attendanceData.length,
        present: attendanceData.filter(r => r.status === 'Present').length,
        absent: attendanceData.filter(r => r.status === 'Absent').length,
        rate: attendanceData.length ? Math.round((attendanceData.filter(r => r.status === 'Present').length / attendanceData.length) * 100) + '%' : '0%'
      };
    } else {
      // Student
      const studentRecords = attendanceData.filter(r => r.student === username);
      return {
        total: studentRecords.length,
        present: studentRecords.filter(r => r.status === 'Present').length,
        absent: studentRecords.filter(r => r.status === 'Absent').length,
        rate: studentRecords.length ? Math.round((studentRecords.filter(r => r.status === 'Present').length / studentRecords.length) * 100) + '%' : '0%'
      };
    }
  })();

  // Calculate best/worst attendance (by student)
  const studentStats = {};
  attendanceData.forEach(r => {
    if (!studentStats[r.student]) studentStats[r.student] = { present: 0, total: 0 };
    if (r.status === 'Present') studentStats[r.student].present++;
    studentStats[r.student].total++;
  });
  const bestStudent = Object.entries(studentStats).sort((a, b) => (b[1].present / b[1].total) - (a[1].present / a[1].total))[0];
  const worstStudent = Object.entries(studentStats).sort((a, b) => (a[1].present / a[1].total) - (b[1].present / b[1].total))[0];

  // Attendance trend for last 7 days
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
  const trend = last7Days.map(date =>
    attendanceData.filter(r => r.date === date && r.status === 'Present').length
  );

  // Student-specific stats
  let studentTrend = [];
  let studentBestStreak = 0;
  let studentCurrentStreak = 0;
  if (role === 'student') {
    // Attendance trend for last 7 days for this student
    studentTrend = last7Days.map(date =>
      attendanceData.filter(r => r.date === date && r.student === username && r.status === 'Present').length
    );
    // Calculate best and current streak
    let streak = 0;
    let best = 0;
    for (let i = attendanceData.length - 1; i >= 0; i--) {
      const r = attendanceData[i];
      if (r.student === username) {
        if (r.status === 'Present') {
          streak++;
          if (streak > best) best = streak;
        } else {
          streak = 0;
        }
      }
    }
    studentCurrentStreak = streak;
    studentBestStreak = best;
  }

  const getBadgeColor = (status) => {
    switch (status) {
      case 'Present': return 'green';
      case 'Absent': return 'red';
      case 'Late': return 'orange';
      default: return 'gray';
    }
  };

  // Get teacher assignments
  const assignments = JSON.parse(localStorage.getItem('teacherAssignments') || '[]');
  // For teachers, get their assigned courses
  let teacherCourses = [];
  if (role === 'teacher_level2') {
    teacherCourses = assignments.filter(a => a.teacher === username).map(a => a.course);
  }
  // For teacher, selected course for marking
  const [teacherSelectedCourse, setTeacherSelectedCourse] = useState(teacherCourses[0] || '');

  // Teacher: Mark attendance
  const handleMarkChange = (student, value) => {
    setMarking({ ...marking, [student]: value });
  };
  const handleMarkSubmit = (e) => {
    e.preventDefault();
    // Only allow marking for selected course
    const studentsForCourse = mockStudents.filter(s => s.course === teacherSelectedCourse);
    const newRecords = studentsForCourse.map(s => ({
      student: s.name,
      course: s.course,
      date,
      time,
      status: marking[s.name] || 'Absent',
      teacher: username
    }));
    setAttendanceData([...attendanceData, ...newRecords]);
    setMarking({});
    setDate('');
    setTime('');
  };

  // Filtered records for display
  let recordsToShow = attendanceData;
  if (role === 'teacher_level2') {
    recordsToShow = attendanceData.filter(r => r.teacher === username);
  } else if (role === 'student') {
    recordsToShow = attendanceData.filter(r => r.student === username);
  }
  if (selectedCourse !== 'All') {
    recordsToShow = recordsToShow.filter(r => r.course === selectedCourse);
  }

  // Prepare data for recharts
  // Last 30 days attendance (aggregate and per student)
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (29 - i));
    return d.toISOString().slice(0, 10);
  });
  const barData = last30Days.map(date => {
    const present = attendanceData.filter(r => r.date === date && (role === 'student' ? r.student === username : true) && r.status === 'Present').length;
    const absent = attendanceData.filter(r => r.date === date && (role === 'student' ? r.student === username : true) && r.status === 'Absent').length;
    const late = attendanceData.filter(r => r.date === date && (role === 'student' ? r.student === username : true) && r.status === 'Late').length;
    return { date: date.slice(5), Present: present, Absent: absent, Late: late };
  });
  // Pie chart data
  const presentCount = attendanceData.filter(r => (role === 'student' ? r.student === username : true) && r.status === 'Present').length;
  const absentCount = attendanceData.filter(r => (role === 'student' ? r.student === username : true) && r.status === 'Absent').length;
  const lateCount = attendanceData.filter(r => (role === 'student' ? r.student === username : true) && r.status === 'Late').length;
  const pieData = [
    { name: 'Present', value: presentCount },
    { name: 'Absent', value: absentCount },
    { name: 'Late', value: lateCount }
  ];
  const pieColors = ['#10b981', '#ef4444', '#f59e0b'];
  // Line chart for attendance rate trend
  const lineData = last30Days.map(date => {
    const total = attendanceData.filter(r => r.date === date && (role === 'student' ? r.student === username : true)).length;
    const present = attendanceData.filter(r => r.date === date && (role === 'student' ? r.student === username : true) && r.status === 'Present').length;
    return { date: date.slice(5), Rate: total ? Math.round((present / total) * 100) : 0 };
  });

  return (
    <div className={`attendance-page ${roleClass}`}>
      <div className="attendance-header">
        <h2>Attendance Overview</h2>
      </div>

      {/* Stats Cards */}
      <div className="attendance-stats">
        <div className="stat-card green">Present<br/><strong>{stats.present}</strong></div>
        <div className="stat-card red">Absent<br/><strong>{stats.absent}</strong></div>
        <div className="stat-card purple">Attendance Rate<br/><strong>{stats.rate}</strong></div>
      </div>

      {/* Advanced Statistics */}
      <div className="attendance-advanced-stats" style={{ flexDirection: 'column', gap: 32 }}>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          {role === 'student' ? (
            <div className="advanced-card" style={{ minWidth: 320 }}>
              <strong>{username}'s Attendance Trend (Last 7 Days):</strong>
              <div className="trend-bar">
                {studentTrend.map((val, i) => (
                  <div key={i} className="trend-bar-segment">
                    <div className="trend-bar-fill" style={{ height: `${val * 20}px`, background: '#2563eb' }}></div>
                    <span className="trend-bar-label">{last7Days[i].slice(5)}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10 }}>
                <span><strong>Best Streak:</strong> {studentBestStreak} days</span><br/>
                <span><strong>Current Streak:</strong> {studentCurrentStreak} days</span>
              </div>
              {attendanceData.filter(r => r.student === username).length === 0 && (
                <div style={{ marginTop: 10, color: '#ef4444' }}><strong>No attendance records yet.</strong></div>
              )}
            </div>
          ) : (
            <>
              <div className="advanced-card">
                <strong>Best Attendance:</strong> {bestStudent ? `${bestStudent[0]} (${Math.round((bestStudent[1].present / bestStudent[1].total) * 100)}%)` : 'N/A'}
              </div>
              <div className="advanced-card">
                <strong>Needs Improvement:</strong> {worstStudent ? `${worstStudent[0]} (${Math.round((worstStudent[1].present / worstStudent[1].total) * 100)}%)` : 'N/A'}
              </div>
              <div className="advanced-card">
                <strong>Last 7 Days Trend:</strong>
                <div className="trend-bar">
                  {trend.map((val, i) => (
                    <div key={i} className="trend-bar-segment">
                      <div className="trend-bar-fill" style={{ height: `${val * 20}px` }}></div>
                      <span className="trend-bar-label">{last7Days[i].slice(5)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        {/* Charts Section */}
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginTop: 24 }}>
          <div className="advanced-card" style={{ minWidth: 340, flex: 1 }}>
            <strong>Attendance (Last 30 Days)</strong>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="Present" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Late" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="advanced-card" style={{ minWidth: 240, flex: 1 }}>
            <strong>Present / Absent / Late</strong>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                  {pieData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={pieColors[idx]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="advanced-card" style={{ minWidth: 340, flex: 1 }}>
            <strong>Attendance Rate Trend</strong>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={lineData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="Rate" stroke="#6366F1" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <h4>Overall Attendance</h4>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: stats.rate }}></div>
        </div>
        <div className="attendance-summary">
          <p>Present: {stats.present} &nbsp;&nbsp; Absent: {stats.absent}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="attendance-filters">
        <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
          <option value="All">All Courses</option>
          <option value="Mathematics">Mathematics</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Physics">Physics</option>
        </select>
        <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
          <option>This Month</option>
          <option>Last Month</option>
          <option>This Semester</option>
        </select>
      </div>

      {/* Teacher: Mark Attendance */}
      {role === 'teacher_level2' && (
        <div className="mark-attendance-form">
          <h3>Mark Attendance for Students</h3>
          {/* Dropdown for teacher's assigned courses */}
          <div style={{ marginBottom: 12 }}>
            <label>Course:&nbsp;
              <select value={teacherSelectedCourse} onChange={e => setTeacherSelectedCourse(e.target.value)} required>
                <option value="">Select Course</option>
                {teacherCourses.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
          </div>
          {teacherSelectedCourse ? (
            <form onSubmit={handleMarkSubmit}>
              <label>Date: <input type="date" value={date} onChange={e => setDate(e.target.value)} required /></label>
              <label>Time: <input type="time" value={time} onChange={e => setTime(e.target.value)} required /></label>
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Course</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockStudents.filter(s => s.course === teacherSelectedCourse).map(s => (
                    <tr key={s.id}>
                      <td>{s.name}</td>
                      <td>{s.course}</td>
                      <td>
                        <select value={marking[s.name] || ''} onChange={e => handleMarkChange(s.name, e.target.value)} required>
                          <option value="">Select</option>
                          <option value="Present">Present</option>
                          <option value="Absent">Absent</option>
                          <option value="Late">Late</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button type="submit">Submit Attendance</button>
            </form>
          ) : (
            <div style={{ color: '#ef4444', marginTop: 8 }}>Select a course to mark attendance.</div>
          )}
        </div>
      )}

      {/* Attendance Records */}
      <div className="attendance-records">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Status</th>
              <th>Course</th>
              <th>Date</th>
              <th>Time</th>
              <th>Teacher</th>
            </tr>
          </thead>
          <tbody>
            {recordsToShow.map((record, index) => (
              <tr key={index}>
                <td>{record.student}</td>
                <td><span className={`badge ${getBadgeColor(record.status)}`}>{record.status}</span></td>
                <td>{record.course}</td>
                <td>{record.date}</td>
                <td>{record.time}</td>
                <td>{record.teacher}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Attendance; 