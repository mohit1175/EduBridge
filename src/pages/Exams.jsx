// src/pages/Exams.jsx
import React, { useState } from 'react';
import '../styles/Exams.css';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

function Exams() {
  const role = localStorage.getItem('userRole');
  const username = localStorage.getItem('username');
  const [courseFilter, setCourseFilter] = useState('All');
  const [semesterFilter, setSemesterFilter] = useState('All');
  const [results, setResults] = useState(() => {
    const stored = localStorage.getItem('examResults');
    if (stored) return JSON.parse(stored);
    // Auto-generate demo results for all students
    const students = ['Alice', 'Bob', 'Mohit'];
    const demo = [];
    students.forEach(student => {
      demo.push({ student, course: 'CS', exam: 'Final', date: '2025-06-28', marks: Math.floor(Math.random()*11)+40, total: 50 });
      demo.push({ student, course: 'Math', exam: 'Midterm', date: '2025-06-15', marks: Math.floor(Math.random()*11)+35, total: 50 });
      demo.push({ student, course: 'Science', exam: 'Unit Test', date: '2025-06-12', marks: Math.floor(Math.random()*11)+25, total: 50 });
    });
    localStorage.setItem('examResults', JSON.stringify(demo));
    return demo;
  });

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

  // Prepare data for recharts
  // Bar chart: subject-wise scores
  const barData = results.map(res => ({
    course: res.course,
    marks: res.marks,
    total: res.total,
    percent: Math.round((res.marks / res.total) * 100)
  }));
  // Pie chart: grade distribution
  const gradeCounts = { 'A+': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0 };
  results.forEach(res => {
    const percent = Math.round((res.marks / res.total) * 100);
    const grade = getGrade(percent);
    gradeCounts[grade] = (gradeCounts[grade] || 0) + 1;
  });
  const pieData = Object.entries(gradeCounts).map(([name, value]) => ({ name, value }));
  const pieColors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];
  // Line chart: score trend
  const lineData = results.map(res => ({
    exam: res.exam + ' (' + res.course + ')',
    percent: Math.round((res.marks / res.total) * 100)
  }));
  // Top performer
  const topResult = results.reduce((best, res) => (res.marks / res.total > (best.marks / best.total) ? res : best), results[0]);
  // Pass/fail rate
  const passCount = results.filter(res => (res.marks / res.total) * 100 >= 40).length;
  const failCount = results.length - passCount;

  // Filtered results for display
  let filteredResults = results;
  if (role === 'student') {
    filteredResults = results.filter(r => r.student === username);
  }
  if (courseFilter !== 'All') {
    filteredResults = filteredResults.filter(r => r.course === courseFilter);
  }

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

      {/* Advanced Statistics & Charts */}
      <div className="exam-advanced-stats" style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginBottom: 32 }}>
        <div className="advanced-card" style={{ minWidth: 320, flex: 1 }}>
          <strong>Subject-wise Scores</strong>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <XAxis dataKey="course" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="percent" fill="#6366F1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="advanced-card" style={{ minWidth: 240, flex: 1 }}>
          <strong>Grade Distribution</strong>
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
          <strong>Score Trend</strong>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={lineData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <XAxis dataKey="exam" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="percent" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="advanced-card" style={{ minWidth: 220, flex: 1 }}>
          <strong>Top Performer</strong><br/>
          {topResult ? `${topResult.course} (${topResult.exam}): ${topResult.marks}/${topResult.total}` : 'N/A'}
        </div>
        <div className="advanced-card" style={{ minWidth: 220, flex: 1 }}>
          <strong>Pass Rate</strong><br/>
          <span style={{ color: '#10b981', fontWeight: 600 }}>{passCount}</span> Passed / <span style={{ color: '#ef4444', fontWeight: 600 }}>{failCount}</span> Failed
        </div>
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
              <th>Student</th>
              <th>Course</th>
              <th>Exam</th>
              <th>Date</th>
              <th>Marks</th>
              <th>Percentage</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.map((res, i) => {
              const percent = Math.round((res.marks / res.total) * 100);
              const grade = getGrade(percent);
              return (
                <tr key={i}>
                  <td>{res.student}</td>
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