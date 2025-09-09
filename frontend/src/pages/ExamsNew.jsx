import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../utils/api';
import '../styles/Exams.css';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import ExamUploadBackend from '../components/ExamUploadBackend';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

function ExamsNew() {
  const { user, isStudent, isTeacher, isHOD } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for filters
  const [courseFilter, setCourseFilter] = useState('All');
  const [semesterFilter, setSemesterFilter] = useState('All');
  const [examTypeFilter, setExamTypeFilter] = useState('All');
  
  // State for data
  const [results, setResults] = useState([]);
  const [exams, setExams] = useState([]);
  const [examConfigs, setExamConfigs] = useState([]);
  const [stats, setStats] = useState({ total: 0, average: 0, highest: 0, lowest: 0, passCount: 0 });
  const [courses, setCourses] = useState([]);
  const courseMap = useMemo(() => {
    const map = {};
    (courses || []).forEach(c => { map[c.courseName] = c; });
    return map;
  }, [courses]);
  const [hodSubject, setHodSubject] = useState('');
  const hodReportRef = useRef(null);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [resultsData, examsData, configsData, statsData, hodAverages, rawCourses] = await Promise.all([
        apiClient.getExamResults(),
        apiClient.getExams({ upcoming: 'true' }),
        apiClient.getExamConfigs(),
        apiClient.getExamStats(),
        isHOD ? apiClient.getExamSubjectAverages() : Promise.resolve({ courseAverages: [] }),
        isStudent
          ? apiClient.getCourses({ department: user?.department, semester: user?.semester })
          : apiClient.getCourses({ instructor: user?.id })
      ]);
      let coursesData = rawCourses || [];
      if (!isStudent && isTeacher && (!coursesData || coursesData.length === 0)) {
        coursesData = await apiClient.getCourses({ department: user?.department });
      }
      if (!isStudent && isTeacher && (!coursesData || coursesData.length === 0)) {
        coursesData = await apiClient.getCourses();
      }
      // Client-side filter to teacher's own courses if populated
      if (isTeacher && coursesData?.length) {
        const mine = coursesData.filter(c => c?.instructor?._id === user?.id || c?.instructor === user?.id);
        if (mine.length) coursesData = mine;
      }
      setResults(resultsData);
      setExams(examsData);
      setExamConfigs(configsData);
  setStats(statsData.stats || { total: 0, average: 0, highest: 0, lowest: 0, passCount: 0 });
  setCourses(coursesData || []);
  // Note: hodAverages reserved for future when showing list again
    } catch (error) {
      console.error('Error loading exam data:', error);
      setError('Failed to load exam data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (filteredData) => {
    if (filteredData.length === 0) {
      return { total: 0, average: 0, highest: 0, lowest: 0 };
    }
    const percentages = filteredData.map(res => res.percentage || Math.round((res.marks / res.totalMarks) * 100));
    const total = filteredData.length;
    const average = Math.round(percentages.reduce((sum, p) => sum + p, 0) / total);
    const highest = Math.max(...percentages);
    const lowest = Math.min(...percentages);
    return { total, average, highest, lowest };
  };

  const getUpcomingExams = () => {
    const today = new Date();
    return exams
      .filter(exam => new Date(exam.examDate) > today)
      .map(exam => ({
        name: exam.examType,
        course: exam.subject,
        date: exam.examDate,
        time: exam.examTime || '10:00 AM',
        duration: exam.duration || '1hr',
        room: exam.room || 'A1',
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

  const calculateInternalMarks = (studentId, courseName) => {
    const course = courseMap[courseName];
    if (!course) return null;
    const credits = course.credits || 0;

    const icaAll = results.filter(r =>
      r.student._id === studentId &&
      r.course === courseName &&
      r.examType === 'ICA'
    );

    if (icaAll.length === 0) return null;

    // Separate theory ICAs and practical
    const icaTheory = icaAll.filter(r => (r.examName || '').toLowerCase().includes('ica test'));
    const icaPractical = icaAll.find(r => (r.examName || '').toLowerCase().includes('practical'));

    // Normalize to 20 for theory tests
    const normalizedTheory = icaTheory.map(r => {
      const total = r.totalMarks || 20;
      const pct = total ? (r.marks / total) : 0;
      return pct * 20; // convert to /20
    });

    let ica20 = 0;
    if (credits >= 4) {
      // Best of 3 (use best available)
      ica20 = normalizedTheory.length ? Math.round(Math.max(...normalizedTheory)) : 0;
    } else if (credits >= 2) {
      // Average of 2
      if (normalizedTheory.length >= 2) {
        ica20 = Math.round((normalizedTheory[0] + normalizedTheory[1]) / 2);
      } else if (normalizedTheory.length === 1) {
        ica20 = Math.round(normalizedTheory[0]);
      } else {
        ica20 = 0;
      }
    } else {
      // Default: use first
      ica20 = normalizedTheory.length ? Math.round(normalizedTheory[0]) : 0;
    }

    // Practical normalized to /10 if present
    let practical10 = null;
    if (icaPractical) {
      const total = icaPractical.totalMarks || 10;
      practical10 = Math.round(((icaPractical.marks || 0) / total) * 10);
    }

    return { credits, ica20, practical10 };
  };

  // Filter results based on user role and filters
  let filteredResults = results;
  if (isStudent) {
    filteredResults = results.filter(r => r.student._id === user._id);
  }
  if (courseFilter !== 'All') {
    filteredResults = filteredResults.filter(r => r.course === courseFilter);
  }
  if (examTypeFilter !== 'All') {
    if (examTypeFilter === 'Cumulative') {
      filteredResults = filteredResults.filter(r => r.course === courseFilter || courseFilter === 'All');
    } else {
      filteredResults = filteredResults.filter(r => r.examName === examTypeFilter);
    }
  }

  const currentStats = calculateStats(filteredResults);
  const barData = filteredResults.map(res => ({
    course: res.course,
    marks: res.marks,
    total: res.totalMarks,
    percent: res.percentage || Math.round((res.marks / res.totalMarks) * 100)
  }));

  const gradeCounts = { 'A+': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0 };
  filteredResults.forEach(res => {
    const percent = res.percentage || Math.round((res.marks / res.totalMarks) * 100);
    const grade = getGrade(percent);
    gradeCounts[grade] = (gradeCounts[grade] || 0) + 1;
  });

  const pieData = Object.entries(gradeCounts).map(([name, value]) => ({ name, value }));
  const pieColors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

  const lineData = filteredResults.map(res => ({
    exam: res.examName + ' (' + res.course + ')',
    percent: res.percentage || Math.round((res.marks / res.totalMarks) * 100)
  }));

  const topResult = filteredResults.length > 0 ? 
    filteredResults.reduce((best, res) => {
      const currentPercent = res.percentage || Math.round((res.marks / res.totalMarks) * 100);
      const bestPercent = best.percentage || Math.round((best.marks / best.totalMarks) * 100);
      return currentPercent > bestPercent ? res : best;
    }, filteredResults[0]) : null;

  const passCount = filteredResults.filter(res => {
    const percent = res.percentage || Math.round((res.marks / res.totalMarks) * 100);
    return percent >= 40;
  }).length;
  const failCount = filteredResults.length - passCount;

  // HOD: Subject-specific report datasets
  const subjectResults = useMemo(() => {
    if (!isHOD || !hodSubject) return [];
    return results.filter(r => r.course === hodSubject);
  }, [isHOD, hodSubject, results]);

  const subjectGradeCounts = useMemo(() => {
    const counts = { 'A+': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0 };
    subjectResults.forEach(res => {
      const pct = res.percentage || Math.round((res.marks / res.totalMarks) * 100);
      const g = getGrade(pct);
      counts[g] = (counts[g] || 0) + 1;
    });
    return counts;
  }, [subjectResults]);

  const subjectBarData = useMemo(() => subjectResults.map(r => ({
    exam: r.examName,
    percent: r.percentage || Math.round((r.marks / r.totalMarks) * 100)
  })), [subjectResults]);

  const subjectLineData = useMemo(() => subjectBarData, [subjectBarData]);

  const subjectStats = useMemo(() => {
    if (!subjectResults.length) return { total: 0, avg: 0, high: 0, low: 0 };
    const perc = subjectResults.map(r => r.percentage || Math.round((r.marks / r.totalMarks) * 100));
    const total = subjectResults.length;
    const avg = Math.round(perc.reduce((a, b) => a + b, 0) / total);
    const high = Math.max(...perc);
    const low = Math.min(...perc);
    return { total, avg, high, low };
  }, [subjectResults]);

  const generateSubjectPDF = async () => {
    if (!hodSubject) return;
    const doc = new jsPDF('p', 'pt', 'a4');
    doc.setFontSize(16);
    doc.text(`Subject Report: ${hodSubject}`, 40, 40);
    doc.setFontSize(11);
    doc.text(`Average: ${subjectStats.avg}%   Highest: ${subjectStats.high}%   Lowest: ${subjectStats.low}%   Count: ${subjectStats.total}`, 40, 60);

    const tableData = subjectBarData.slice(0, 15).map(row => [row.exam, `${row.percent}%`]);
    doc.autoTable({
      head: [['Exam', 'Percent']],
      body: tableData,
      startY: 80,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241] },
      styles: { fontSize: 10 }
    });

    if (hodReportRef.current) {
      try {
        const canvas = await html2canvas(hodReportRef.current, { scale: 2, useCORS: true });
        const img = canvas.toDataURL('image/png');
        const pageWidth = doc.internal.pageSize.getWidth();
        const imgWidth = pageWidth - 80;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const y = doc.lastAutoTable ? (doc.lastAutoTable.finalY + 20) : 120;
        doc.addImage(img, 'PNG', 40, y, imgWidth, imgHeight);
      } catch (e) {}
    }

    doc.save(`SubjectReport_${hodSubject}.pdf`);
  };

  // PDF generation functions
  const handleDownloadHallTicket = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Exam Hall Ticket', 14, 18);
    doc.setFontSize(12);
    doc.text(`Name: ${user.name}`, 14, 30);
    doc.text(`Roll Number: ${user.rollNumber || user.email}`, 14, 38);
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
    
    doc.save(`HallTicket_${user.name}.pdf`);
  };

  const handleDownloadTimetable = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Exam Timetable', 14, 18);
    doc.setFontSize(12);
    doc.text(`Name: ${user.name}`, 14, 30);
    doc.text(`Roll Number: ${user.rollNumber || user.email}`, 14, 38);
    
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
    
    doc.save(`ExamTimetable_${user.name}.pdf`);
  };

  if (loading) {
    return (
      <div className="exams-page">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h3>Loading exam data...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="exams-page">
        <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
          <h3>Error: {error}</h3>
          <button onClick={loadData} style={{ marginTop: '20px', padding: '10px 20px' }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="exams-page">
      <h2>Exams</h2>
      
  {/* HOD view same as Teacher: no ExamConfig here */}
      
  {(isTeacher || isHOD) && (
        <div style={{ marginBottom: 32 }}>
      {/* Legacy local upload (optional) */}
      {/* <ExamUpload /> */}
      <ExamUploadBackend />
        </div>
      )}

      {results.length === 0 ? (
        <div className="no-data-message">
          <h3>No Exam Data Available</h3>
          <p>Upload CSV files to see exam statistics and results.</p>
        </div>
      ) : (
        <div className="exam-stats">
          <div className="stat-card blue">Total Exams<br /><strong>{currentStats.total}</strong></div>
          <div className="stat-card green">Avg. Score<br /><strong>{currentStats.average}%</strong></div>
          <div className="stat-card purple">Highest<br /><strong>{currentStats.highest}</strong></div>
          <div className="stat-card red">Lowest<br /><strong>{currentStats.lowest}</strong></div>
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
            {topResult ? `${topResult.course} (${topResult.examName}): ${topResult.marks}/${topResult.totalMarks}` : 'No data available'}
          </div>
          
          <div className="advanced-card" style={{ minWidth: 220, flex: 1 }}>
            <strong>Pass Rate</strong><br/>
            <span style={{ color: '#10b981', fontWeight: 600 }}>{passCount}</span> Passed / <span style={{ color: '#ef4444', fontWeight: 600 }}>{failCount}</span> Failed
          </div>
        </div>
      )}

      {isHOD && (
        <div className="advanced-card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
            <strong style={{ marginRight: 8 }}>Subject Report</strong>
            <select value={hodSubject} onChange={e => setHodSubject(e.target.value)}>
              <option value="">Select Subject</option>
              {courses.map(c => (
                <option key={c._id} value={c.courseName}>{c.courseName}</option>
              ))}
            </select>
            <button disabled={!hodSubject || !subjectResults.length} className="download-btn-modern" onClick={generateSubjectPDF}>
              Generate Report (PDF)
            </button>
          </div>

          {hodSubject && subjectResults.length > 0 ? (
            <div ref={hodReportRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              <div className="advanced-card">
                <strong>{hodSubject} - Score Distribution</strong>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={subjectBarData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <XAxis dataKey="exam" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="percent" fill="#6366F1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="advanced-card">
                <strong>Grade Distribution</strong>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={Object.entries(subjectGradeCounts).map(([name,value]) => ({ name, value }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                      {Object.keys(subjectGradeCounts).map((_, idx) => (
                        <Cell key={idx} fill={[ '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444' ][idx]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="advanced-card">
                <strong>Trend</strong>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={subjectLineData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <XAxis dataKey="exam" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="percent" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="advanced-card">
                <strong>Stats</strong>
                <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
                  <div className="stat-card green">Avg<br /><strong>{subjectStats.avg}%</strong></div>
                  <div className="stat-card purple">High<br /><strong>{subjectStats.high}%</strong></div>
                  <div className="stat-card red">Low<br /><strong>{subjectStats.low}%</strong></div>
                  <div className="stat-card blue">Count<br /><strong>{subjectStats.total}</strong></div>
                </div>
              </div>
            </div>
          ) : hodSubject ? (
            <div style={{ color: '#64748b' }}>No results found for this subject yet.</div>
          ) : null}
        </div>
      )}

      <div className="exam-filters">
        <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
          <option value="All">All Courses</option>
          {Array.from(new Set(results.map(r => r.course))).map(course => (
            <option key={course} value={course}>{course}</option>
          ))}
        </select>
        
        {isStudent && (
          <select value={examTypeFilter} onChange={(e) => setExamTypeFilter(e.target.value)}>
            <option value="All">All Exam Types</option>
            <option value="ICA Test 1">ICA Test 1</option>
            <option value="ICA Test 2">ICA Test 2</option>
            <option value="ICA Test 3">ICA Test 3</option>
            <option value="Other Internal">Other Internal</option>
            <option value="External">External</option>
            <option value="Cumulative">Cumulative</option>
          </select>
        )}
        
        <select value={semesterFilter} onChange={(e) => setSemesterFilter(e.target.value)}>
          <option value="All">All Semesters</option>
          <option>5</option>
          <option>6</option>
        </select>
      </div>

      {isStudent && exams.length > 0 && (
        <div className="exam-links">
          <h3>Available Exam Forms</h3>
          <div className="links-grid">
            {exams
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

      {isStudent && (
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

      {isStudent && (
        <div className="internal-marks-summary">
          <h3>Internal Marks Summary</h3>
          <div className="internal-grid">
            {Array.from(new Set(filteredResults.map(r => r.course))).map(course => {
              const internal = calculateInternalMarks(user._id, course);
              if (!internal) return null;
              return (
                <div key={course} className="internal-card">
                  <h4>{course}</h4>
                  <div className="internal-breakdown">
                    <div className="internal-item">
                      <span>ICA (Theory):</span>
                      <strong>{internal.ica20}/20</strong>
                    </div>
                    {internal.practical10 !== null && (
                      <div className="internal-item">
                        <span>Practical ICA:</span>
                        <strong>{internal.practical10}/10</strong>
                      </div>
                    )}
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
              const percent = res.percentage || Math.round((res.marks / res.totalMarks) * 100);
              const grade = getGrade(percent);
              return (
                <tr key={i}>
                  <td>{res.student.name}</td>
                  <td>{res.course}</td>
                  <td>
                    <span className={`badge ${res.examType === 'ICA' ? 'blue' : res.examType === 'Internal' ? 'green' : 'purple'}`}>
                      {res.examType}
                    </span>
                  </td>
                  <td>{res.examName}</td>
                  <td>{new Date(res.date).toLocaleDateString()}</td>
                  <td>{res.marks} / {res.totalMarks}</td>
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

export default ExamsNew;
