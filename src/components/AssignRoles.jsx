import React, { useState } from 'react';
import './AssignRoles.css';

const demoTeachers = [
  { name: 'Alice', role: 'teacher_level2' },
  { name: 'Bob', role: 'teacher_level2' },
  { name: 'Mohit', role: 'teacher_level2' },
];
const demoCourses = [
  'Mathematics',
  'Computer Science',
  'Physics',
  'English Literature',
];

function roleBadge(role) {
  if (role === 'teacher_level2') return <span className="ar-badge teacher">Teacher</span>;
  if (role === 'teacher_level1') return <span className="ar-badge hod">HOD</span>;
  if (role === 'student') return <span className="ar-badge student">Student</span>;
  return <span className="ar-badge">User</span>;
}

function AssignRoles() {
  const [formData, setFormData] = useState({ teacherId: '', courseId: '' });
  const [message, setMessage] = useState('');
  const [refresh, setRefresh] = useState(false); // force rerender after delete
  const [confirmIdx, setConfirmIdx] = useState(null);

  // Get current assignments
  const assignments = JSON.parse(localStorage.getItem('teacherAssignments') || '[]');

  // Prevent duplicate assignment
  const isDuplicate = assignments.some(
    a => a.teacher === formData.teacherId && a.course === formData.courseId
  );

  // Remove assignment (with confirmation)
  const handleRemove = (idx) => {
    setConfirmIdx(idx);
  };
  const confirmRemove = (idx) => {
    assignments.splice(idx, 1);
    localStorage.setItem('teacherAssignments', JSON.stringify(assignments));
    setMessage('Assignment removed.');
    setRefresh(r => !r);
    setConfirmIdx(null);
    setTimeout(() => setMessage(''), 1500);
  };

  // Unassigned courses
  const assignedCourses = assignments.map(a => a.course);
  const unassignedCourses = demoCourses.filter(c => !assignedCourses.includes(c));

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
    setRefresh(r => !r);
    setTimeout(() => setMessage(''), 2000);
  };

  return (
    <div className="ar-container">
      <h3 className="ar-title">Assign Teacher to Course</h3>
      <form onSubmit={handleSubmit} className="ar-form">
        <select
          value={formData.teacherId}
          onChange={e => setFormData({ ...formData, teacherId: e.target.value })}
          required
          className="ar-select"
        >
          <option value="">Select Teacher</option>
          {demoTeachers.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
        </select>
        <select
          value={formData.courseId}
          onChange={e => setFormData({ ...formData, courseId: e.target.value })}
          required
          className="ar-select"
        >
          <option value="">Select Course</option>
          {demoCourses.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button type="submit" className="ar-btn">Assign</button>
      </form>
      {message && <div className="ar-toast">{message}</div>}
      {/* Show current assignments */}
      <div className="ar-section">
        <div className="ar-section-header">Current Assignments</div>
        <ul className="ar-list">
          {assignments.length === 0 && <li className="ar-empty">No assignments yet.</li>}
          {assignments.map((a, i) => (
            <li key={i} className="ar-list-item">
              <span>{a.teacher} {roleBadge('teacher_level2')} <span className="ar-arrow">→</span> <span className="ar-course">{a.course}</span></span>
              {confirmIdx === i ? (
                <span className="ar-confirm">
                  <button className="ar-btn ar-btn-danger" onClick={() => confirmRemove(i)}>Confirm</button>
                  <button className="ar-btn ar-btn-cancel" onClick={() => setConfirmIdx(null)}>Cancel</button>
                </span>
              ) : (
                <button type="button" className="ar-btn ar-btn-remove" title="Remove assignment" onClick={() => handleRemove(i)}>✕</button>
              )}
            </li>
          ))}
        </ul>
      </div>
      {/* Show unassigned courses */}
      {unassignedCourses.length > 0 && (
        <div className="ar-section ar-unassigned">
          <div className="ar-section-header">Unassigned Courses</div>
          <div>{unassignedCourses.join(', ')}</div>
        </div>
      )}
    </div>
  );
}

export default AssignRoles;
