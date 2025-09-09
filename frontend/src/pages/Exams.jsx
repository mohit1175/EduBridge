import React, { useState } from 'react';
import '../styles/Exams.css';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import ExamConfig from '../components/ExamConfig';
import ExamUpload from '../components/ExamUpload';
// Add jsPDF import for PDF generation
import jsPDF from 'jspdf';
import 'jspdf-autotable';

localStorage.removeItem('examResults');
localStorage.removeItem('uploadedExams');

function Exams() {
  const role = localStorage.getItem('userRole');
  const username = localStorage.getItem('username');
  const [courseFilter, setCourseFilter] = useState('All');
  const [semesterFilter, setSemesterFilter] = useState('All');
  const [examTypeFilter, setExamTypeFilter] = useState('All');
  const [results, setResults] = useState(() => {
    const stored = localStorage.getItem('examResults');
    return stored ? JSON.parse(stored) : [];
  });

  const calculateStats = (filteredData) => {
    if (filteredData.length === 0) {
      return { total: 0, average: 0, highest: 0, lowest: 0 };
    }
    const percentages = filteredData.map(res => Math.round((res.marks / res.total) * 100));
    const total = filteredData.length;
    const average = Math.round(percentages.reduce((sum, p) => sum + p, 0) / total);
    const highest = Math.max(...percentages);
    const lowest = Math.min(...percentages);
    return { total, average, highest, lowest };
  };

  const getUpcomingExams = () => {
    const uploadedExams = JSON.parse(localStorage.getItem('uploadedExams') || '[]');
    const today = new Date();
    return uploadedExams
      .filter(exam => new Date(exam.examDate) > today)
      .map(exam => ({
        name: exam.examType,
        course: exam.subject,
        date: exam.examDate,
        time: '10:00 AM',
        duration: exam.examType.includes('ICA') ? '30min' : '1hr',
        room: 'A1',
        examType: exam.examType.includes('ICA') ? 'ICA' : exam.examType.includes('Internal') ? 'Internal' : 'External'
      }))
      .slice(0, 5);
  };

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

  const examConfigs = JSON.parse(localStorage.getItem('examConfigs') || '[]');
  const uploadedExams = JSON.parse(localStorage.getItem('uploadedExams') || '[]');

  const calculateInternalMarks = (student, course) => {
    const courseConfig = examConfigs.find(c => c.subjectName === course);
    if (!courseConfig) return null;
    const icaResults = results.filter(r => 
      r.student === student && 
      r.course === course && 
      r.examType === 'ICA'
    );
    if (icaResults.length === 0) return null;
    let icaMarks;
    if (courseConfig.icaOption === 'best') {
      icaMarks = Math.max(...icaResults.map(r => r.marks));
    } else {
      icaMarks = Math.round(icaResults.reduce((sum, r) => sum + r.marks, 0) / icaResults.length);
    }
    const otherInternal = results.find(r => 
      r.student === student && 
      r.course === course && 
      r.examType === 'Internal'
    );
    const otherInternalMarks = otherInternal ? otherInternal.marks : 0;
    const totalInternal = icaMarks + otherInternalMarks;
    return {
      icaMarks,
      otherInternalMarks,
      totalInternal,
      maxInternal: courseConfig.internalMarks
    };
  };

  let filteredResults = results;
  if (role === 'student') {
    filteredResults = results.filter(r => r.student === username);
  }
  if (courseFilter !== 'All') {
    filteredResults = filteredResults.filter(r => r.course === courseFilter);
  }
  if (examTypeFilter !== 'All') {
    if (examTypeFilter === 'Cumulative') {
      filteredResults = filteredResults.filter(r => r.course === courseFilter || courseFilter === 'All');
    } else {
      filteredResults = filteredResults.filter(r => r.exam === examTypeFilter);
    }
  }

  const stats = calculateStats(filteredResults);
  const barData = filteredResults.map(res => ({
    course: res.course,
    marks: res.marks,
    total: res.total,
    percent: Math.round((res.marks / res.total) * 100)
  }));
  const gradeCounts = { 'A+': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0 };
  filteredResults.forEach(res => {
    const percent = Math.round((res.marks / res.total) * 100);
    const grade = getGrade(percent);
    gradeCounts[grade] = (gradeCounts[grade] || 0) + 1;
  });
  const pieData = Object.entries(gradeCounts).map(([name, value]) => ({ name, value }));
  const pieColors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];
  const lineData = filteredResults.map(res => ({
    exam: res.exam + ' (' + res.course + ')',
    percent: Math.round((res.marks / res.total) * 100)
  }));
  const topResult = filteredResults.length > 0 ? 
    filteredResults.reduce((best, res) => (res.marks / res.total > (best.marks / best.total) ? res : best), filteredResults[0]) : null;
  const passCount = filteredResults.filter(res => (res.marks / res.total) * 100 >= 40).length;
  const failCount = filteredResults.length - passCount;

  // Add hall ticket download handler
  const handleDownloadHallTicket = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Exam Hall Ticket', 14, 18);
    doc.setFontSize(12);
    doc.text(`Name: ${username}`, 14, 30);
    doc.text(`Roll Number: ${username}`, 14, 38);
    doc.text('Upcoming Exams:', 14, 48);
    const upcoming = getUpcomingExams();
    const tableData = upcoming.map(exam => [exam.name, exam.course, exam.date, exam.time, exam.duration, exam.room]);
    doc.autoTable({
      head: [['Exam', 'Course', 'Date', 'Time', 'Duration', 'Room']],
      body: tableData,
      startY: 52,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241] },
      styles: { fontSize: 10 }
    });
    doc.save(`HallTicket_${username}.pdf`);
  };

  // Add timetable PDF download handler
  const handleDownloadTimetable = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Exam Timetable', 14, 18);
    doc.setFontSize(12);
    doc.text(`Name: ${username}`, 14, 30);
    doc.text(`Roll Number: ${username}`, 14, 38);
    const upcoming = getUpcomingExams();
    const tableData = upcoming.map(exam => [exam.name, exam.course, exam.date, exam.time, exam.duration, exam.room]);
    doc.autoTable({
      head: [['Exam', 'Course', 'Date', 'Time', 'Duration', 'Room']],
      body: tableData,
      startY: 44,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241] },
      styles: { fontSize: 10 }
    });
    doc.save(`ExamTimetable_${username}.pdf`);
  };

  // HOD upload state
  const [hodTimetableName, setHodTimetableName] = useState(localStorage.getItem('hodTimetableName') || '');
  const [hodHallTicketName, setHodHallTicketName] = useState(localStorage.getItem('hodHallTicketName') || '');
  const [hodTimetableUrl, setHodTimetableUrl] = useState(localStorage.getItem('hodTimetableUrl') || '');
  const [hodHallTicketUrl, setHodHallTicketUrl] = useState(localStorage.getItem('hodHallTicketUrl') || '');
  // HOD upload handlers
  const handleHodFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
      const base64 = ev.target.result;
      if (type === 'timetable') {
        localStorage.setItem('hodTimetableFile', base64);
        localStorage.setItem('hodTimetableName', file.name);
        setHodTimetableName(file.name);
        setHodTimetableUrl(base64);
      } else {
        localStorage.setItem('hodHallTicketFile', base64);
        localStorage.setItem('hodHallTicketName', file.name);
        setHodHallTicketName(file.name);
        setHodHallTicketUrl(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  // Feedback form state for HOD
  const [feedbackFormLink, setFeedbackFormLink] = useState(localStorage.getItem('feedbackFormLink') || '');
  const [feedbackInput, setFeedbackInput] = useState('');
  // HOD releases feedback form
  const handleReleaseFeedback = () => {
    if (feedbackInput.trim()) {
      localStorage.setItem('feedbackFormLink', feedbackInput.trim());
      setFeedbackFormLink(feedbackInput.trim());
      setFeedbackInput('');
    }
  };
  // Student: get feedback form link
  const studentFeedbackFormLink = localStorage.getItem('feedbackFormLink') || '';

  return (
    <div className="exams-page">
      <h2>Exams</h2>
      {role === 'teacher_level1' && (
        <div style={{ marginBottom: 32 }}>
          <ExamConfig />
        </div>
      )}
      {role === 'teacher_level2' && (
        <div style={{ marginBottom: 32 }}>
          <ExamUpload />
        </div>
      )}
      {results.length === 0 ? (
        <div className="no-data-message">
          <h3>No Exam Data Available</h3>
          <p>Upload CSV files to see exam statistics and results.</p>
        </div>
      ) : (
        <div className="exam-stats">
          <div className="stat-card blue">Total Exams<br /><strong>{stats.total}</strong></div>
          <div className="stat-card green">Avg. Score<br /><strong>{stats.average}%</strong></div>
          <div className="stat-card purple">Highest<br /><strong>{stats.highest}</strong></div>
          <div className="stat-card red">Lowest<br /><strong>{stats.lowest}</strong></div>
        </div>
      )}
      {results.length > 0 && (
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
          {topResult ? `${topResult.course} (${topResult.exam}): ${topResult.marks}/${topResult.total}` : 'No data available'}
        </div>
        <div className="advanced-card" style={{ minWidth: 220, flex: 1 }}>
          <strong>Pass Rate</strong><br/>
          <span style={{ color: '#10b981', fontWeight: 600 }}>{passCount}</span> Passed / <span style={{ color: '#ef4444', fontWeight: 600 }}>{failCount}</span> Failed
        </div>
      </div>
      )}
      <div className="exam-filters">
        <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
          <option>All Courses</option>
          {Array.from(new Set(results.map(r => r.course))).map(course => (
            <option key={course} value={course}>{course}</option>
          ))}
        </select>
        {role === 'student' && (
          <select value={examTypeFilter} onChange={(e) => setExamTypeFilter(e.target.value)}>
            <option>All Exam Types</option>
            <option>ICA Test 1</option>
            <option>ICA Test 2</option>
            <option>ICA Test 3</option>
            <option>Other Internal</option>
            <option>External</option>
            <option>Cumulative</option>
          </select>
        )}
        <select value={semesterFilter} onChange={(e) => setSemesterFilter(e.target.value)}>
          <option>All Semesters</option>
          <option>5</option>
          <option>6</option>
        </select>
      </div>
      {role === 'student' && uploadedExams.length > 0 && (
        <div className="exam-links">
          <h3>Available Exam Forms</h3>
          <div className="links-grid">
            {uploadedExams
              .filter(exam => exam.examLink)
              .map((exam, i) => (
                <div key={i} className="link-card">
                  <div className="link-header">
                    <strong>{exam.examType}</strong>
                    <span className={`badge ${exam.examType.includes('ICA') ? 'blue' : 'green'}`}>
                      {exam.examType.includes('ICA') ? 'ICA' : 'Internal'}
                    </span>
                  </div>
                  <p>{exam.subject}</p>
                  <p>{exam.examDate}</p>
                  <a 
                    href={exam.examLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="exam-form-link"
                  >
                    Take Exam
                  </a>
                </div>
              ))}
          </div>
        </div>
      )}
      {/* Debug info for students */}
      {role === 'student' && (
        <div style={{ background: '#fef9c3', color: '#92400e', padding: 8, borderRadius: 6, marginBottom: 12, fontSize: 14 }}>
          Debug: userRole = {role}, upcomingExams = {getUpcomingExams().length}
        </div>
      )}
      {/* Hall Ticket Download and Exam Timetable Section for Students */}
      {role === 'student' && (
        <div className="hall-ticket-section" style={{ margin: '32px 0' }}>
          <h3>Hall Ticket & Exam Timetable</h3>
          <button onClick={handleDownloadHallTicket} className="download-btn-modern">
            Download Hall Ticket (PDF)
          </button>
          <div className="exam-timetable-table-wrapper">
            <table className="exam-timetable-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
              <thead>
                <tr>
                  <th>Exam</th>
                  <th>Course</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Duration</th>
                  <th>Room</th>
                </tr>
              </thead>
              <tbody>
                {getUpcomingExams().length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: '#ef4444' }}>No upcoming exams found.</td></tr>
                ) : (
                  getUpcomingExams().map((exam, i) => (
                    <tr key={i}>
                      <td>{exam.name}</td>
                      <td>{exam.course}</td>
                      <td>{exam.date}</td>
                      <td>{exam.time}</td>
                      <td>{exam.duration}</td>
                      <td>{exam.room}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <button onClick={handleDownloadTimetable} className="download-btn-modern">
            Download Timetable (PDF)
          </button>
        </div>
      )}
      {/* HOD upload section */}
      {role === 'teacher_level1' && (
        <div className="hod-upload-section" style={{ margin: '32px 0', background: '#f8fafc', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0' }}>
          <h3>Upload Timetable & Hall Ticket (HOD)</h3>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 600, marginRight: 12 }}>Timetable File (CSV or PDF): </label>
            <input type="file" accept=".csv,.pdf" onChange={e => handleHodFileUpload(e, 'timetable')} />
            {hodTimetableName && (
              <div style={{ marginTop: 8 }}>
                <span style={{ color: '#059669', fontWeight: 500 }}>Uploaded: {hodTimetableName}</span>
                <a href={hodTimetableUrl} download={hodTimetableName} style={{ marginLeft: 16, color: '#2563eb', textDecoration: 'underline', fontWeight: 600 }}>Download</a>
              </div>
            )}
          </div>
          <div>
            <label style={{ fontWeight: 600, marginRight: 12 }}>Hall Ticket File (PDF): </label>
            <input type="file" accept=".pdf" onChange={e => handleHodFileUpload(e, 'hallticket')} />
            {hodHallTicketName && (
              <div style={{ marginTop: 8 }}>
                <span style={{ color: '#059669', fontWeight: 500 }}>Uploaded: {hodHallTicketName}</span>
                <a href={hodHallTicketUrl} download={hodHallTicketName} style={{ marginLeft: 16, color: '#2563eb', textDecoration: 'underline', fontWeight: 600 }}>Download</a>
              </div>
            )}
          </div>
          <hr style={{ margin: '32px 0' }} />
          <h3>Release Feedback Form</h3>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
            <input
              type="url"
              placeholder="Paste feedback form link (e.g. Google Form)"
              value={feedbackInput}
              onChange={e => setFeedbackInput(e.target.value)}
              style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #d1d5db', fontSize: 16 }}
            />
            <button onClick={handleReleaseFeedback} className="download-btn-modern">Release</button>
          </div>
          {feedbackFormLink && (
            <div style={{ color: '#059669', fontWeight: 500 }}>
              Released: <a href={feedbackFormLink} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: 600 }}>Open Feedback Form</a>
            </div>
          )}
        </div>
      )}
      {/* Student feedback form button */}
      {role === 'student' && studentFeedbackFormLink && (
        <div style={{ margin: '32px 0', textAlign: 'center' }}>
          <a href={studentFeedbackFormLink} target="_blank" rel="noopener noreferrer" className="download-btn-modern" style={{ fontSize: '1.15rem', padding: '18px 40px', display: 'inline-block' }}>
            Fill Feedback Form
          </a>
        </div>
      )}
      <div className="upcoming-exams">
        <h3>Upcoming Exams</h3>
        <div className="upcoming-grid">
          {getUpcomingExams().map((exam, i) => (
            <div key={i} className="exam-card">
              <div className="exam-card-header">
                <strong>{exam.name}</strong>
                <span className={`badge ${exam.examType === 'ICA' ? 'blue' : 'green'}`}>
                  {exam.examType}
                </span>
              </div>
              <p>{exam.course}</p>
              <p>{exam.date}</p>
              <p>{exam.time}</p>
              <p>Duration: {exam.duration}</p>
              <p>Room: {exam.room}</p>
            </div>
          ))}
        </div>
      </div>
      {role === 'student' && (
        <div className="internal-marks-summary">
          <h3>Internal Marks Summary</h3>
          <div className="internal-grid">
            {Array.from(new Set(filteredResults.map(r => r.course))).map(course => {
              const internalMarks = calculateInternalMarks(username, course);
              if (!internalMarks) return null;
              return (
                <div key={course} className="internal-card">
                  <h4>{course}</h4>
                  <div className="internal-breakdown">
                    <div className="internal-item">
                      <span>ICA Marks:</span>
                      <strong>{internalMarks.icaMarks}/20</strong>
                    </div>
                    {internalMarks.otherInternalMarks > 0 && (
                      <div className="internal-item">
                        <span>Other Internal:</span>
                        <strong>{internalMarks.otherInternalMarks}/20</strong>
                      </div>
                    )}
                    <div className="internal-item total">
                      <span>Total Internal:</span>
                      <strong>{internalMarks.totalInternal}/{internalMarks.maxInternal}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className="exam-results">
        <h3>Results</h3>
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Course</th>
              <th>Exam Type</th>
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
                  <td>
                    <span className={`badge ${res.examType === 'ICA' ? 'blue' : res.examType === 'Internal' ? 'green' : 'purple'}`}>
                      {res.examType}
                    </span>
                  </td>
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