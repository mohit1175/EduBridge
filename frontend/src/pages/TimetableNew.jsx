import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../utils/api';
import '../styles/Timetable.css';

function TimetableNew() {
  const { user, isStudent, isTeacher, isHOD } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for timetable
  const [timetable, setTimetable] = useState({});
  const [timetableList, setTimetableList] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  
  // State for filters
  const [semesterFilter, setSemesterFilter] = useState('All');
  const [courseFilter, setCourseFilter] = useState('All');
  
  // State for creating new timetable entry
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEntry, setNewEntry] = useState({
    course: '',
    days: [],
    startTime: '',
    endTime: '',
    room: '',
    semester: '',
    program: 'BSc',
    term: '',
    department: 'Computer Science',
    instructor: ''
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const teacherScoped = isTeacher ? { } : {};
      const [weeklyResponse, listResponse, teachersList, coursesList] = await Promise.all([
        apiClient.getWeeklyTimetable(teacherScoped),
        apiClient.getTimetable(teacherScoped),
        isHOD ? apiClient.getUsers({ role: ['teacher_level2'] }) : Promise.resolve([]),
        apiClient.getCourses()
      ]);

      setTimetable(weeklyResponse);
      setTimetableList(listResponse);
      setTeachers(teachersList);
      setAllCourses(coursesList);
    } catch (error) {
      console.error('Error loading timetable data:', error);
      setError('Failed to load timetable data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEntry = async (e) => {
    e.preventDefault();
    try {
      if (!isHOD) {
        alert('Only HOD can create timetable entries');
        return;
      }
      // If term not chosen, align with semester
      const payload = {
        ...newEntry,
        semester: parseInt(newEntry.semester),
        term: newEntry.term ? parseInt(newEntry.term) : parseInt(newEntry.semester),
      };
      await apiClient.createTimetableEntry(payload);
      setNewEntry({
        course: '',
        days: [],
        startTime: '',
        endTime: '',
        room: '',
        semester: '',
        program: 'BSc',
        term: '',
        department: 'Computer Science',
        instructor: ''
      });
      setShowCreateForm(false);
      await loadData();
    } catch (error) {
      console.error('Error creating timetable entry:', error);
      alert('Failed to create timetable entry');
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this timetable entry?')) {
      return;
    }

    try {
      await apiClient.deleteTimetableEntry(entryId);
      await loadData();
    } catch (error) {
      console.error('Error deleting timetable entry:', error);
      alert('Failed to delete timetable entry');
    }
  };

  // Get unique courses and semesters for filters
  const courses = Array.from(new Set(timetableList.map(entry => entry.course)));
  const semesters = Array.from(new Set(timetableList.map(entry => entry.semester))).sort();

  // Filter timetable entries
  let filteredTimetable = timetableList;
  if (semesterFilter !== 'All') {
    filteredTimetable = filteredTimetable.filter(entry => entry.semester === parseInt(semesterFilter));
  }
  if (courseFilter !== 'All') {
    filteredTimetable = filteredTimetable.filter(entry => entry.course === courseFilter);
  }

  // Group filtered entries by day
  const filteredWeeklyTimetable = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
  Saturday: []
  };

  filteredTimetable.forEach(entry => {
    if (filteredWeeklyTimetable[entry.day]) {
      filteredWeeklyTimetable[entry.day].push(entry);
    }
  });

  // Sort entries by start time
  Object.keys(filteredWeeklyTimetable).forEach(day => {
    filteredWeeklyTimetable[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Helpers to build time slots and rowSpan mapping
  const toMinutes = (t) => {
    if (!t) return 0;
    const [h, m] = t.split(':').map(Number);
    return h * 60 + (m || 0);
  };
  const pad = (n) => String(n).padStart(2, '0');
  const fromMinutes = (mins) => `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`;
  const buildSlots = (entries) => {
    if (!entries.length) return ['07:00-08:00', '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00'];
    const starts = entries.map(e => toMinutes(e.startTime));
    const ends = entries.map(e => toMinutes(e.endTime));
    const minStart = Math.min(...starts, 7 * 60);
    const maxEnd = Math.max(...ends, 17 * 60);
    const slot = 60; // 1 hour
    const slots = [];
    for (let t = Math.floor(minStart / slot) * slot; t < maxEnd; t += slot) {
      slots.push(`${fromMinutes(t)}-${fromMinutes(t + slot)}`);
    }
    return slots;
  };

  // Build derived structures for table rendering
  const timeSlots = buildSlots(filteredTimetable);
  const tableMap = (() => {
    const map = {};
    for (const day of days) map[day] = {};
    filteredTimetable.forEach(e => {
  // Skip any entries whose day isn't part of our current grid (e.g., legacy Sunday)
  if (!map[e.day]) return;
      const start = toMinutes(e.startTime);
      const end = toMinutes(e.endTime);
      for (let i = 0; i < timeSlots.length; i++) {
        const [s, eSlot] = timeSlots[i].split('-');
        const sMin = toMinutes(s);
        const eMin = toMinutes(eSlot);
        if (start === sMin) {
          const span = Math.max(1, Math.ceil((end - start) / 60));
          map[e.day][i] = { entry: e, rowSpan: span };
          // mark covered slots with null placeholder
          for (let k = 1; k < span; k++) map[e.day][i + k] = { skip: true };
          break;
        }
      }
    });
    return map;
  })();

  if (loading) {
    return (
      <div className="timetable-page">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h3>Loading timetable...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="timetable-page">
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
    <div className="timetable-page">
      <div className="timetable-header">
        <h2>Class Timetable</h2>
        {isHOD && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary"
          >
            Add Timetable Entry
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="timetable-filters">
        <select value={semesterFilter} onChange={(e) => setSemesterFilter(e.target.value)}>
          <option value="All">All Semesters</option>
          {semesters.map(sem => (
            <option key={sem} value={sem}>Semester {sem}</option>
          ))}
        </select>

        <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
          <option value="All">All Courses</option>
          {courses.map(course => (
            <option key={course} value={course}>{course}</option>
          ))}
        </select>
      </div>

      {/* Create Timetable Entry Form */}
      {showCreateForm && isHOD && (
        <div className="create-timetable-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add Timetable Entry</h3>
              <button type="button" className="icon-btn" aria-label="Close" onClick={() => setShowCreateForm(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateEntry}>
              <div className="modal-body">
                <div className="section">
                  <div className="section-title">Program Details</div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Program:</label>
                      <select value={newEntry.program} onChange={(e) => setNewEntry({ ...newEntry, program: e.target.value })} required>
                        <option value="BSc">BSc</option>
                        <option value="MSc">MSc</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Department:</label>
                      <input type="text" value={newEntry.department} onChange={(e) => setNewEntry({ ...newEntry, department: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label>Term:</label>
                      <select value={newEntry.term} onChange={(e) => setNewEntry({ ...newEntry, term: e.target.value })}>
                        <option value="">Select Term</option>
                        {[1,2,3,4,5,6,7,8].map(t => (
                          <option key={t} value={t}>Term {t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="section">
                  <div className="section-title">Course & Semester</div>
                  <div className="form-row two">
                    <div className="form-group">
                      <label>Course:</label>
                      <select value={newEntry.course} onChange={(e) => setNewEntry({ ...newEntry, course: e.target.value })} required>
                        <option value="">Select Course</option>
                        {allCourses.map(c => (
                          <option key={c._id} value={c.courseName}>{c.courseName}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Semester:</label>
                      <select value={newEntry.semester} onChange={(e) => setNewEntry({ ...newEntry, semester: e.target.value, term: e.target.value })} required>
                        <option value="">Select Semester</option>
                        {[1,2,3,4,5,6,7,8].map(sem => (
                          <option key={sem} value={sem}>Semester {sem}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="section">
                  <div className="section-title">Instructor & Days</div>
                  <div className="form-group">
                    <label>Assign Teacher:</label>
                    <select value={newEntry.instructor} onChange={(e) => setNewEntry({ ...newEntry, instructor: e.target.value })} required>
                      <option value="">Select Teacher</option>
                      {teachers.map(t => (
                        <option key={t._id} value={t._id}>{t.name} ({t.email})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Days:</label>
                    <div className="days-grid">
                      {days.map(d => (
                        <label key={d} className={`day-pill ${newEntry.days.includes(d) ? 'on' : ''}`}>
                          <input
                            type="checkbox"
                            checked={newEntry.days.includes(d)}
                            onChange={(e) => {
                              const set = new Set(newEntry.days);
                              if (e.target.checked) set.add(d); else set.delete(d);
                              setNewEntry({ ...newEntry, days: Array.from(set) });
                            }}
                          />
                          {d}
                        </label>
                      ))}
                    </div>
                    <div className="note">Pick one or more days for the same time slot.</div>
                  </div>
                </div>

                <div className="section">
                  <div className="section-title">Time & Room</div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Start Time:</label>
                      <input type="time" value={newEntry.startTime} onChange={(e) => setNewEntry({ ...newEntry, startTime: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label>End Time:</label>
                      <input type="time" value={newEntry.endTime} onChange={(e) => setNewEntry({ ...newEntry, endTime: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label>Room:</label>
                      <input type="text" value={newEntry.room} onChange={(e) => setNewEntry({ ...newEntry, room: e.target.value })} required />
                    </div>
                  </div>
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary btn-lg">Create Entry</button>
                <button type="button" onClick={() => setShowCreateForm(false)} className="btn-secondary btn-lg">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Weekly Timetable View (Tabular) */}
      <div className="tt-wrapper">
        <h3>Weekly Schedule</h3>
        <table className="tt-table">
          <thead>
            <tr>
              <th className="tt-time-col">Time</th>
              {days.map(d => (
                <th key={d}>{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((slot, rIdx) => (
              <tr key={slot}>
                <td className="tt-time-col">{slot}</td>
                {days.map(day => {
                  const cell = tableMap[day][rIdx];
                  if (cell?.skip) return null; // covered by a rowspan above
                  if (cell?.entry) {
                    const e = cell.entry;
                    return (
                      <td key={day} rowSpan={cell.rowSpan} className="tt-has-class">
                        <div className="tt-entry">
                          <div className="tt-course">{e.course}</div>
                          <div className="tt-meta">
                            <span>{e.startTime}-{e.endTime}</span>
                            <span>• Room {e.room}</span>
                          </div>
                          <div className="tt-instructor">{e.instructor?.name || 'TBA'}</div>
                          {isHOD && (
                            <button className="tt-delete" onClick={() => handleDeleteEntry(e._id)}>Delete</button>
                          )}
                        </div>
                      </td>
                    );
                  }
                  return <td key={day} className="tt-empty" />;
                })}
              </tr>
            ))}
          </tbody>
        </table>
  </div>

      {/* Timetable Statistics */}
      {timetableList.length > 0 && (
        <div className="timetable-stats">
          <h3>Timetable Statistics</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <h4>{timetableList.length}</h4>
              <p>Total Entries</p>
            </div>
            <div className="stat-card">
              <h4>{courses.length}</h4>
              <p>Courses</p>
            </div>
            <div className="stat-card">
              <h4>{semesters.length}</h4>
              <p>Semesters</p>
            </div>
            <div className="stat-card">
              <h4>{days.filter(day => filteredWeeklyTimetable[day].length > 0).length}</h4>
              <p>Active Days</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TimetableNew;
