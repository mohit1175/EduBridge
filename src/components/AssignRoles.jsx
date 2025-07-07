import React, { useState } from 'react';

const demoTeachers = [
  'Alice', // You can update these names as per your teacher list
  'Bob',
  'Mohit',
];
const demoCourses = [
  'Mathematics',
  'Computer Science',
  'Physics',
  'English Literature',
];

function AssignRoles() {
  const [formData, setFormData] = useState({ teacherId: '', courseId: '' });
  const [message, setMessage] = useState('');

  // Get current assignments
  const assignments = JSON.parse(localStorage.getItem('teacherAssignments') || '[]');

  // Prevent duplicate assignment
  const isDuplicate = assignments.some(
    a => a.teacher === formData.teacherId && a.course === formData.courseId
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isDuplicate) {
      setMessage('This teacher is already assigned to this course.');
      setTimeout(() => setMessage(''), 2000);
      return;
    }
    assignments.push({ teacher: formData.teacherId, course: formData.courseId });
    localStorage.setItem('teacherAssignments', JSON.stringify(assignments));
    setMessage(`Assigned Teacher ${formData.teacherId} to Course ${formData.courseId}`);
    setFormData({ teacherId: '', courseId: '' });
    setTimeout(() => setMessage(''), 2000);
  };

  return (
    <div>
      <h3>Assign Teacher Role</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <select
          value={formData.teacherId}
          onChange={e => setFormData({ ...formData, teacherId: e.target.value })}
          required
        >
          <option value="">Select Teacher</option>
          {demoTeachers.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          value={formData.courseId}
          onChange={e => setFormData({ ...formData, courseId: e.target.value })}
          required
        >
          <option value="">Select Course</option>
          {demoCourses.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button type="submit">Assign</button>
      </form>
      {message && <div className="assign-toast" style={{ marginTop: 8 }}>{message}</div>}
      {/* Show current assignments */}
      <div style={{ marginTop: 16 }}>
        <strong>Current Assignments:</strong>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {assignments.length === 0 && <li>No assignments yet.</li>}
          {assignments.map((a, i) => (
            <li key={i}>{a.teacher} → {a.course}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default AssignRoles;
