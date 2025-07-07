import React, { useState, useEffect } from 'react';
import '../styles/Timetable.css';
import TimetableBuilder from './TimetableBuilder';

function Timetable() {
  const role = localStorage.getItem('userRole');
  const roleClass =
    role === 'student' ? 'dashboard-student' :
    role === 'teacher_level2' ? 'dashboard-teacher' :
    role === 'teacher_level1' ? 'dashboard-hod' : '';
  const [config, setConfig] = useState(null);
  const [entries, setEntries] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load from localStorage on first mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('timetableConfig');
    const savedEntries = localStorage.getItem('timetableEntries');
    if (savedConfig) setConfig(JSON.parse(savedConfig));
    if (savedEntries) setEntries(JSON.parse(savedEntries));
    setLoading(false); // ✅ ensure we delay render until storage check
  }, []);

  // Save config and entries if they change (for all roles)
  useEffect(() => {
    if (config) {
      localStorage.setItem('timetableConfig', JSON.stringify(config));
    }
  }, [config]);

  useEffect(() => {
    localStorage.setItem('timetableEntries', JSON.stringify(entries));
  }, [entries]);

  const handleGridGenerate = (builderConfig) => {
    setConfig(builderConfig);
    setEntries([]);
    localStorage.setItem('timetableConfig', JSON.stringify(builderConfig));
    localStorage.removeItem('timetableEntries');
  };

  const toggleCellSelect = (day, time) => {
    const key = `${day}_${time}`;
    setSelectedCells(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const assignToSelection = (course, teacher, room) => {
    const updated = [...entries];
    selectedCells.forEach(key => {
      const [day, time] = key.split('_');
      const existing = updated.find(e => e.day === day && e.time === time);
      if (existing) {
        existing.course = course;
        existing.teacher = teacher;
        existing.room = room;
      } else {
        updated.push({ day, time, course, teacher, room });
      }
    });
    setEntries(updated);
    setSelectedCells([]);
  };

  const isRecessTime = (time, recessPeriods) => {
    return recessPeriods.some(r => time >= r.start && time < r.end);
  };

  // Get assignments from localStorage
  const assignments = JSON.parse(localStorage.getItem('teacherAssignments') || '[]');
  const courses = Array.from(new Set(assignments.map(a => a.course)));
  const teachers = Array.from(new Set(assignments.map(a => a.teacher)));
  // Map course to teachers
  const courseToTeachers = {};
  assignments.forEach(a => {
    if (!courseToTeachers[a.course]) courseToTeachers[a.course] = [];
    courseToTeachers[a.course].push(a.teacher);
  });

  // ✅ FIX: Show loading or wait for localStorage before returning
  if (loading) return <div className={roleClass} style={{ minHeight: '100vh' }}><p style={{ padding: '20px' }}>Loading timetable...</p></div>;

  if (!config) {
    return role === 'teacher_level1'
      ? <div className={roleClass} style={{ minHeight: '100vh' }}><TimetableBuilder onGridGenerate={handleGridGenerate} /></div>
      : <div className={roleClass} style={{ minHeight: '100vh' }}><p style={{ padding: '20px' }}>Timetable not created yet by HOD.</p></div>;
  }

  const { timeSlots, days, recessPeriods } = config;

  return (
    <div className={roleClass} style={{ minHeight: '100vh' }}>
      <div className="timetable-modern">
        <div className="timetable-header">
          <h2>📅 Weekly Timetable</h2>
        </div>

        <div className="timetable-table">
          <div className="timetable-row timetable-head">
            <div className="timetable-time">Time</div>
            {days.map((day) => (
              <div key={day} className="timetable-day-col">{day}</div>
            ))}
          </div>

          {timeSlots.map((time) => {
            const isRecess = isRecessTime(time, recessPeriods);
            return (
              <div key={time} className={`timetable-row ${isRecess ? 'recess-row' : ''}`}>
                <div className="timetable-time">{time}</div>
                {days.map((day) => {
                  const key = `${day}_${time}`;
                  if (isRecess) {
                    return (
                      <div key={key} className="timetable-cell recess-cell">
                        RECESS
                      </div>
                    );
                  }
                  const match = entries.find(e => e.day === day && e.time === time);
                  const isSelected = selectedCells.includes(key);
                  return (
                    <div
                      key={key}
                      className={`timetable-cell ${isSelected ? 'selected-cell' : ''}`}
                      onClick={() => role === 'teacher_level1' && toggleCellSelect(day, time)}
                    >
                      {match ? (
                        <div className="class-card">
                          <div className="course-name">{match.course}</div>
                          <div className="teacher-name">👤 {match.teacher}</div>
                          <div className="room-name">🏫 {match.room}</div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Assignment Form - only for HOD */}
        {role === 'teacher_level1' && selectedCells.length > 0 && (
          <div className="assign-box">
            <h4>Assign to {selectedCells.length} cell(s)</h4>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target;
                assignToSelection(form.course.value, form.teacher.value, form.room.value);
                form.reset();
              }}
            >
              <select name="course" required defaultValue="">
                <option value="" disabled>Select Course</option>
                {courses.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select name="teacher" required defaultValue="">
                <option value="" disabled>Select Teacher</option>
                {/* Show teachers for selected course if possible */}
                {courses.length > 0 && teachers.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <input name="room" placeholder="Room" required />
              <button type="submit">Assign</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Timetable;
