import React, { useState } from 'react';

function MarkAttendance() {
  const [data, setData] = useState({ studentId: '', course: '', status: 'Present' });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Marked ${data.status} for Student ${data.studentId} in ${data.course}`);
    // Add Firebase or DB save logic here
  };

  return (
    <div>
      <h3>Mark Attendance</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Student ID"
          value={data.studentId}
          onChange={(e) => setData({ ...data, studentId: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Course"
          value={data.course}
          onChange={(e) => setData({ ...data, course: e.target.value })}
          required
        />
        <select
          value={data.status}
          onChange={(e) => setData({ ...data, status: e.target.value })}
        >
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
          <option value="Late">Late</option>
        </select>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default MarkAttendance;
