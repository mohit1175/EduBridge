import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../utils/api';
import '../styles/Attendance.css';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import MarkAttendance from '../components/MarkAttendance';

function AttendanceNew() {
  const { user, isStudent, isTeacher, isHOD } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for filters
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // State for data
  const [attendanceData, setAttendanceData] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, late: 0 });
  
  // State for marking attendance
  const [marking, setMarking] = useState({});
  const [markingLoading, setMarkingLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [attendanceResponse, coursesResponse, statsResponse] = await Promise.all([
        apiClient.getAttendance(),
        apiClient.getCourses(isTeacher ? { instructor: user.id } : {}),
        apiClient.getAttendanceStats()
      ]);

      setAttendanceData(attendanceResponse);
      setCourses(coursesResponse);
      // Auto-select first course for teachers/HOD to streamline marking
  if ((isTeacher || isHOD) && coursesResponse?.length && !selectedCourseId) {
        setSelectedCourseId(coursesResponse[0]._id);
      }
      setStats(statsResponse.overall || { total: 0, present: 0, absent: 0, late: 0 });

      // Load students for selected course for teachers/HOD
    if ((isTeacher || isHOD) && selectedCourseId) {
        try {
          const list = await apiClient.getCourseStudents(selectedCourseId);
          setStudents(list);
        } catch (error) {
          console.error('Error loading students:', error);
        }
      }
    } catch (error) {
      console.error('Error loading attendance data:', error);
      setError('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  }, [isTeacher, isHOD, selectedCourseId, user.id]);

  useEffect(() => { loadData(); }, [loadData]);

  const selectedCourse = useMemo(
    () => courses.find(c => c._id === selectedCourseId),
    [courses, selectedCourseId]
  );

  const handleMarkAttendance = async (studentId, status) => {
    if (!selectedCourse) {
      alert('Please select a course first');
      return;
    }

    try {
      setMarkingLoading(true);
      await apiClient.markAttendance({
        student: studentId,
        course: selectedCourse.courseName,
        status: status.toLowerCase(),
        date: selectedDate,
  semester: selectedCourse.semester
      });

      // Reload data
  await loadData();
      setMarking({ ...marking, [studentId]: status });
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Failed to mark attendance');
    } finally {
      setMarkingLoading(false);
    }
  };

  // Load students whenever the selected course changes (for teachers/HOD)
  useEffect(() => {
    const fetchStudents = async () => {
      if ((isTeacher || isHOD) && selectedCourseId) {
        try {
          const list = await apiClient.getCourseStudents(selectedCourseId);
          setStudents(list);
        } catch (e) {
          console.error('Failed to fetch students for course', e);
        }
      } else {
        setStudents([]);
      }
    };
    fetchStudents();
  }, [isTeacher, isHOD, selectedCourseId]);

  const handleBulkAttendance = async (attendanceRecords) => {
    if (!selectedCourse) {
      alert('Please select a course first');
      return;
    }

    try {
      setMarkingLoading(true);
      await apiClient.markBulkAttendance(attendanceRecords, selectedDate, user.semester);
      await loadData();
    } catch (error) {
      console.error('Error marking bulk attendance:', error);
      alert('Failed to mark attendance');
    } finally {
      setMarkingLoading(false);
    }
  };

  // Filter attendance data
  let filteredAttendance = attendanceData;
  if (isStudent) {
    filteredAttendance = attendanceData.filter(record => record.student && record.student._id === user.id);
  }
  if (selectedCourse) {
    filteredAttendance = filteredAttendance.filter(record => record.course === selectedCourse.courseName);
  }

  // Calculate period filter
  if (selectedPeriod !== 'All') {
    const today = new Date();
    let startDate;
    
    switch (selectedPeriod) {
      case 'This Week':
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'This Month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'Last Month':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        break;
      default:
        startDate = null;
    }
    
    if (startDate) {
      filteredAttendance = filteredAttendance.filter(record => 
        new Date(record.date) >= startDate
      );
    }
  }

  // Prepare chart data
  const barTitle = isTeacher ? 'Attendance by Subject' : 'Attendance by Course';
  const barData = useMemo(() => {
    if (isTeacher) {
      const teacherCourseNames = courses.map(c => c.courseName);
      let records = attendanceData.filter(r => teacherCourseNames.includes(r.course));

      // Apply the same period filter but ignore selectedCourseId to show all subjects
      if (selectedPeriod !== 'All') {
        const today = new Date();
        let startDate;
        switch (selectedPeriod) {
          case 'This Week':
            startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'This Month':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            break;
          case 'Last Month':
            startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            break;
          default:
            startDate = null;
        }
        if (startDate) {
          records = records.filter(r => new Date(r.date) >= startDate);
        }
      }

      const grouped = {};
      for (const r of records) {
        const key = r.course;
        if (!grouped[key]) grouped[key] = { course: key, present: 0, absent: 0, late: 0 };
        if (r.status === 'present') grouped[key].present += 1;
        else if (r.status === 'absent') grouped[key].absent += 1;
        else if (r.status === 'late') grouped[key].late += 1;
      }
      return Object.values(grouped);
    }

    // Non-teacher: group from currently filteredAttendance so period/course filters apply
    const grouped = {};
    for (const r of filteredAttendance) {
      const key = r.course;
      if (!grouped[key]) grouped[key] = { course: key, present: 0, absent: 0, late: 0 };
      if (r.status === 'present') grouped[key].present += 1;
      else if (r.status === 'absent') grouped[key].absent += 1;
      else if (r.status === 'late') grouped[key].late += 1;
    }
    return Object.values(grouped);
  }, [isTeacher, courses, attendanceData, selectedPeriod, filteredAttendance]);

  // Compute summary stats based on current filters (course + period)
  // This ensures the cards reflect the selected subject/dropdown
  const filteredSummary = useMemo(() => {
    const summary = { present: 0, absent: 0, late: 0, total: 0 };
    for (const r of filteredAttendance) {
      if (!r || !r.status) continue;
      if (r.status === 'present') summary.present += 1;
      else if (r.status === 'absent') summary.absent += 1;
      else if (r.status === 'late') summary.late += 1;
      summary.total += 1;
    }
    return summary;
  }, [filteredAttendance]);

  const pieData = [
    { name: 'Present', value: filteredSummary.present, color: '#10b981' },
    { name: 'Absent', value: filteredSummary.absent, color: '#ef4444' },
    { name: 'Late', value: filteredSummary.late, color: '#f59e0b' }
  ];

  // Simpler trend: daily Present percentage (0-100)
  const rateLineData = useMemo(() => {
    const byDate = {};
    for (const record of filteredAttendance) {
      const date = new Date(record.date).toLocaleDateString();
      if (!byDate[date]) byDate[date] = { present: 0, total: 0 };
      if (record.status === 'present') byDate[date].present += 1;
      byDate[date].total += 1;
    }
    return Object.entries(byDate)
      .map(([date, v]) => ({ date, rate: v.total ? Math.round((v.present / v.total) * 100) : 0 }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [filteredAttendance]);

  if (loading) {
    return (
      <div className="attendance-page">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h3>Loading attendance data...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="attendance-page">
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
    <div className="attendance-page">
      <h2>Attendance</h2>

      {/* Statistics Cards */}
      <div className="attendance-stats">
        <div className="stat-card present">
          <h3>{filteredSummary.present}</h3>
          <p>Present</p>
        </div>
        <div className="stat-card absent">
          <h3>{filteredSummary.absent}</h3>
          <p>Absent</p>
        </div>
        <div className="stat-card late">
          <h3>{filteredSummary.late}</h3>
          <p>Late</p>
        </div>
        <div className="stat-card total">
          <h3>{filteredSummary.total}</h3>
          <p>Total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="attendance-filters">
        <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)}>
          <option value="">All Courses</option>
          {courses.map(course => (
            <option key={course._id} value={course._id}>
              {course.courseName}
            </option>
          ))}
        </select>

        <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
          <option value="All">All Time</option>
          <option value="This Week">This Week</option>
          <option value="This Month">This Month</option>
          <option value="Last Month">Last Month</option>
        </select>

        {(isTeacher || isHOD) && (
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        )}
      </div>

      {/* Charts */}
  {filteredSummary.total > 0 && (
        <div className="attendance-charts">
          <div className="chart-container">
            <h3>{barTitle}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <XAxis dataKey="course" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" stackId="a" fill="#10b981" />
                <Bar dataKey="absent" stackId="a" fill="#ef4444" />
                <Bar dataKey="late" stackId="a" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h3>Overall Attendance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {rateLineData.length > 0 && (
            <div className="chart-container">
              <h3>{isStudent ? "Your Attendance % Trend" : "Attendance % Trend"}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={rateLineData}>
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} ticks={[0,25,50,75,100]} unit="%" />
                  <Tooltip formatter={(value) => `${value}%`} />
                  {/* Single, simple line showing % Present */}
                  <Line type="monotone" dataKey="rate" name="Present %" stroke="#10b981" strokeWidth={3} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Mark Attendance (Teachers/HOD) */}
      {(isTeacher || isHOD) && selectedCourse && (
        <MarkAttendance
          course={selectedCourse}
          courses={courses}
          selectedCourseId={selectedCourseId}
          onChangeCourse={setSelectedCourseId}
          students={students}
          date={selectedDate}
          onChangeDate={setSelectedDate}
          onSubmitted={loadData}
        />
      )}

      {/* Attendance Records */}
      <div className="attendance-records">
        <h3>Attendance Records</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Student</th>
              <th>Course</th>
              <th>Status</th>
              <th>Marked By</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {filteredAttendance.map((record, index) => (
              <tr key={index}>
                <td>{new Date(record.date).toLocaleDateString()}</td>
                <td>{record.student?.name || '—'}</td>
                <td>{record.course}</td>
                <td>
                  <span className={`status-badge ${record.status}`}>
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  </span>
                </td>
                <td>{record.markedBy?.name || 'N/A'}</td>
                <td>{record.remarks || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AttendanceNew;
