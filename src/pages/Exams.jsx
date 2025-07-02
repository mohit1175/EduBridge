// src/pages/Exams.jsx
import React, { useState } from 'react';
import '../styles/Exams.css';

function Exams() {
  const [courseFilter, setCourseFilter] = useState('All');
  const [semesterFilter, setSemesterFilter] = useState('All');

  const stats = {
    total: 6,
    average: 78,
    highest: 95,
    lowest: 52
  };

  const upcoming = [
    { name: 'Midterm', course: 'Math', date: '2025-07-10', time: '10:00 AM', duration: '1hr', room: 'A1' },
    { name: 'Unit Test', course: 'Science', date: '2025-07-15', time: '12:00 PM', duration: '1hr', room: 'B3' }
  ];

  const results = [
    { course: 'CS', exam: 'Final', date: '2025-06-28', marks: 42, total: 50 },
    { course: 'Math', exam: 'Midterm', date: '2025-06-15', marks: 38, total: 50 },
    { course: 'Science', exam: 'Unit Test', date: '2025-06-12', marks: 26, total: 50 }
  ];

  const getGrade = (percent) => {
    if (percent >= 90) return 'A+';
    if (percent >= 80) return 'A';
    if (percent >= 70) return 'B';
    if (percent >= 60) return 'C';
    return 'D';
  };

  const getBadgeColor = (grade) => {
    switch (grade) {
      case 'A+': return 'green';
      case 'A': return 'blue';
      case 'B': return 'purple';
      case 'C': return 'orange';
      default: return 'red';
    }
  };

  return (
    <div className="exams-page">
      <h2>🎓 Exams</h2>

      {/* Stats */}
      <div className="exam-stats">
        <div className="stat-card blue">📝 Total Exams<br /><strong>{stats.total}</strong></div>
        <div className="stat-card green">📊 Avg. Score<br /><strong>{stats.average}%</strong></div>
        <div className="stat-card purple">🏆 Highest<br /><strong>{stats.highest}</strong></div>
        <div className="stat-card red">📉 Lowest<br /><strong>{stats.lowest}</strong></div>
      </div>

      {/* Filters */}
      <div className="exam-filters">
        <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
          <option>All Courses</option>
          <option>CS</option>
          <option>Math</option>
          <option>Science</option>
        </select>
        <select value={semesterFilter} onChange={(e) => setSemesterFilter(e.target.value)}>
          <option>All Semesters</option>
          <option>5</option>
          <option>6</option>
        </select>
      </div>

      {/* Upcoming Exams */}
      <div className="upcoming-exams">
        <h3>📅 Upcoming Exams</h3>
        <div className="upcoming-grid">
          {upcoming.map((exam, i) => (
            <div key={i} className="exam-card">
              <strong>{exam.name}</strong>
              <p>📘 {exam.course}</p>
              <p>📅 {exam.date}</p>
              <p>⏰ {exam.time}</p>
              <p>🕒 Duration: {exam.duration}</p>
              <p>🏫 Room: {exam.room}</p>
              <span className="badge green">Upcoming</span>
            </div>
          ))}
        </div>
      </div>

      {/* Results Table */}
      <div className="exam-results">
        <h3>📑 Results</h3>
        <table>
          <thead>
            <tr>
              <th>Course</th>
              <th>Exam</th>
              <th>Date</th>
              <th>Marks</th>
              <th>Percentage</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            {results.map((res, i) => {
              const percent = Math.round((res.marks / res.total) * 100);
              const grade = getGrade(percent);
              return (
                <tr key={i}>
                  <td>{res.course}</td>
                  <td>{res.exam}</td>
                  <td>{res.date}</td>
                  <td>{res.marks} / {res.total}</td>
                  <td>
                    <div className="progress-wrapper">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${percent}%` }}></div>
                      </div>
                      <span>{percent}%</span>
                    </div>
                  </td>
                  <td><span className={`badge ${getBadgeColor(grade)}`}>{grade}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Exams;