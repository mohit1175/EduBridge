// src/pages/Timetable.jsx
import React, { useState } from 'react';
import '../styles/Timetable.css';
import TimetableBuilder from './TimetableBuilder';

function Timetable() {
  const role = localStorage.getItem('userRole');
  const [config, setConfig] = useState(null);
  const [entries, setEntries] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]);

  const handleGridGenerate = (builderConfig) => {
    setConfig(builderConfig);
    setEntries([]);
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

  if (!config && role === 'teacher_level1') {
    return <TimetableBuilder onGridGenerate={handleGridGenerate} />;
  }

  if (!config) return <p style={{ padding: '20px' }}>No timetable available.</p>;

  const { timeSlots, days, recessPeriods } = config;

  return (
    <div className="timetable-modern">
      <div className="timetable-header">
        <h2>📅 Editable Timetable</h2>
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
            <input name="course" placeholder="Course" required />
            <input name="teacher" placeholder="Teacher" required />
            <input name="room" placeholder="Room" required />
            <button type="submit">Assign</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Timetable;
