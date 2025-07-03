// src/pages/Attendance.jsx
import React, { useState } from 'react';
import '../styles/Attendance.css';


function Attendance() {
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');

  const stats = {
    total: 30,
    present: 26,
    absent: 4,
    rate: '86%'
  };

  const attendanceRecords = [
    { status: 'Present', course: 'Math', date: '2025-07-01', time: '10:00 AM', teacher: 'Dr. Sharma' },
    { status: 'Absent', course: 'CS', date: '2025-06-29', time: '2:00 PM', teacher: 'Mr. Khan' },
    { status: 'Late', course: 'Science', date: '2025-06-27', time: '11:15 AM', teacher: 'Ms. Verma' }
  ];

  const getBadgeColor = (status) => {
    switch (status) {
      case 'Present': return 'green';
      case 'Absent': return 'red';
      case 'Late': return 'orange';
      default: return 'gray';
    }
  };

  return (
    <div className="attendance-page">
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
          <option>All Courses</option>
          <option>Math</option>
          <option>CS</option>
          <option>Science</option>
        </select>
        <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
          <option>This Month</option>
          <option>Last Month</option>
          <option>This Semester</option>
        </select>
      </div>

      {/* Attendance Records */}
      <div className="attendance-records">
        <table>
          <thead>
            <tr>
              <th>Status</th>
              <th>Course</th>
              <th>Date</th>
              <th>Time</th>
              <th>Teacher</th>
            </tr>
          </thead>
          <tbody>
            {attendanceRecords.map((record, index) => (
              <tr key={index}>
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