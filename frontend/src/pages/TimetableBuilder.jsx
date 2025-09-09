// src/pages/TimetableBuilder.jsx
import React, { useState } from 'react';
import '../styles/TimetableBuilder.css';

function TimetableBuilder({ onGridGenerate }) {
  const [startTime, setStartTime] = useState('07:00');
  const [endTime, setEndTime] = useState('13:30');
  const [recessPeriods, setRecessPeriods] = useState([
    { start: '09:00', end: '09:20' },
    { start: '11:20', end: '11:40' }
  ]);
  const [activeDays, setActiveDays] = useState(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);

  const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const toggleDay = (day) => {
    setActiveDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const isWithinRecess = (slotStart, recess) => {
    return slotStart >= recess.start && slotStart < recess.end;
  };

  const addHour = (time) => {
    let [h, m] = time.split(':').map(Number);
    h += 1;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const generateTimeSlots = (start, end, recesses) => {
    const slots = [];
    let current = start;
    while (current < end) {
      let skip = false;
      for (let r of recesses) {
        if (isWithinRecess(current, r)) {
          current = r.end;
          skip = true;
          break;
        }
      }
      if (!skip) {
        const next = addHour(current);
        if (next <= end) slots.push(current);
        current = next;
      }
    }
    return slots;
  };

  const handleRecessChange = (index, field, value) => {
    const updated = [...recessPeriods];
    updated[index][field] = value;
    setRecessPeriods(updated);
  };

  const addRecessPeriod = () => {
    setRecessPeriods([...recessPeriods, { start: '', end: '' }]);
  };

  const handleGenerate = () => {
    const timeSlots = generateTimeSlots(startTime, endTime, recessPeriods);
    const config = {
      timeSlots,
      days: activeDays,
      recessPeriods
    };
    onGridGenerate(config);
  };

  return (
    <div className="builder-container">
      <h2>🛠 Setup Weekly Timetable</h2>

      <div className="builder-section">
        <label>Start Time:</label>
        <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
      </div>

      <div className="builder-section">
        <label>End Time:</label>
        <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
      </div>

      <div className="builder-section">
        <label>Recess Periods:</label>
        {recessPeriods.map((r, index) => (
          <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
            <input
              type="time"
              value={r.start}
              onChange={(e) => handleRecessChange(index, 'start', e.target.value)}
            />
            <span>to</span>
            <input
              type="time"
              value={r.end}
              onChange={(e) => handleRecessChange(index, 'end', e.target.value)}
            />
          </div>
        ))}
        <button type="button" onClick={addRecessPeriod} className="generate-btn" style={{ marginTop: '5px' }}>
          + Add Recess
        </button>
      </div>

      <div className="builder-section">
        <label>Active Days:</label>
        <div className="days-toggle">
          {allDays.map((day) => (
            <button
              key={day}
              className={activeDays.includes(day) ? 'day-btn active' : 'day-btn'}
              onClick={() => toggleDay(day)}
              type="button"
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      <button className="generate-btn" onClick={handleGenerate}>Generate Grid</button>
    </div>
  );
}

export default TimetableBuilder;