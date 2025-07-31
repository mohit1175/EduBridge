import React, { useState } from 'react';

function ManageTimetable() {
  const [entries, setEntries] = useState([]);
  const [formData, setFormData] = useState({
    course: '',
    day: 'Monday',
    start: '',
    end: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setEntries([...entries, formData]);
    alert(`Added: ${formData.course} on ${formData.day} from ${formData.start} to ${formData.end}`);
    setFormData({ course: '', day: 'Monday', start: '', end: '' });
  };

  return (
    <div>
      <h3>Create Timetable</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Course Name"
          value={formData.course}
          onChange={(e) => setFormData({ ...formData, course: e.target.value })}
          required
        />
        <select
          value={formData.day}
          onChange={(e) => setFormData({ ...formData, day: e.target.value })}
        >
          <option>Monday</option>
          <option>Tuesday</option>
          <option>Wednesday</option>
          <option>Thursday</option>
          <option>Friday</option>
          <option>Saturday</option>
        </select>
        <input
          type="time"
          value={formData.start}
          onChange={(e) => setFormData({ ...formData, start: e.target.value })}
          required
        />
        <input
          type="time"
          value={formData.end}
          onChange={(e) => setFormData({ ...formData, end: e.target.value })}
          required
        />
        <button type="submit">Add</button>
      </form>

      <hr />

      <h4>Timetable Entries:</h4>
      <ul>
        {entries.map((entry, index) => (
          <li key={index}>
            {entry.day} - {entry.course} ({entry.start} to {entry.end})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ManageTimetable;
