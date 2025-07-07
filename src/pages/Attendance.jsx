// src/pages/Attendance.jsx
import React, { useState, useEffect } from 'react';
import '../styles/Attendance.css';

const mockStudents = [
  { id: 1, name: 'Alice', course: 'Math' },
  { id: 2, name: 'Bob', course: 'CS' },
  { id: 3, name: 'Charlie', course: 'Science' },
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
    if (stored) setAttendanceData(JSON.parse(stored));
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

  const getBadgeColor = (status) => {
    switch (status) {
      case 'Present': return 'green';
      case 'Absent': return 'red';
      case 'Late': return 'orange';
      default: return 'gray';
    }
  };

  // Teacher: Mark attendance
  const handleMarkChange = (student, value) => {
    setMarking({ ...marking, [student]: value });
  };
  const handleMarkSubmit = (e) => {
    e.preventDefault();
    const newRecords = mockStudents.map(s => ({
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

  return (
    <div className={`attendance-page ${roleClass}`}>
      <h2>📈 Attendance Overview</h2>

      {/* Stats Cards */}
      <div className="attendance-stats">
        <div className="stat-card blue">📚 Total Classes<br/><strong>{stats.total}</strong></div>
        <div className="stat-card green">✅ Present<br/><strong>{stats.present}</strong></div>
        <div className="stat-card red">❌ Absent<br/><strong>{stats.absent}</strong></div>
        <div className="stat-card purple">📊 Attendance Rate<br/><strong>{stats.rate}</strong></div>
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <h4>Overall Attendance</h4>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: stats.rate }}></div>
        </div>
        <p>✅ Present: {stats.present} &nbsp;&nbsp; ❌ Absent: {stats.absent}</p>
      </div>

      {/* Filters */}
      <div className="attendance-filters">
        <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
          <option value="All">All Courses</option>
          <option value="Math">Math</option>
          <option value="CS">CS</option>
          <option value="Science">Science</option>
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
                {mockStudents.map(s => (
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