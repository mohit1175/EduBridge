// src/pages/Courses.jsx
import React, { useState } from 'react';
import AssignRoles from '../components/AssignRoles';

const demoCourses = [
  { code: 'MATH101', name: 'Mathematics', department: 'Science', semester: 5, credits: 4 },
  { code: 'CS201', name: 'Computer Science', department: 'Engineering', semester: 5, credits: 3 },
  { code: 'PHY111', name: 'Physics', department: 'Science', semester: 6, credits: 4 },
  { code: 'ENG301', name: 'English Literature', department: 'Arts', semester: 6, credits: 2 },
];

function Courses() {
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [filterSem, setFilterSem] = useState('All');
  const assignments = JSON.parse(localStorage.getItem('teacherAssignments') || '[]');

  // Map course code to assigned teacher
  const courseToTeacher = {};
  assignments.forEach(a => { courseToTeacher[a.course] = a.teacher; });

  const filteredCourses = demoCourses.filter(c =>
    (filterDept === 'All' || c.department === filterDept) &&
    (filterSem === 'All' || c.semester === Number(filterSem)) &&
    (c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase()))
  );

  // Get user role
  const role = localStorage.getItem('userRole');

  return (
    <div style={{ padding: '20px' }}>
      {/* Only show AssignRoles for HOD */}
      {role === 'teacher_level1' && (
        <div style={{ marginBottom: 24 }}>
          <AssignRoles />
        </div>
      )}
      <h2>📘 Courses</h2>
      <div style={{ display: 'flex', gap: 16, marginBottom: 18 }}>
        <input
          type="text"
          placeholder="Search by name or code..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: 8, borderRadius: 6, border: '1px solid #d1d5db' }}
        />
        <select value={filterDept} onChange={e => setFilterDept(e.target.value)} style={{ padding: 8, borderRadius: 6 }}>
          <option>All</option>
          <option>Science</option>
          <option>Engineering</option>
          <option>Arts</option>
        </select>
        <select value={filterSem} onChange={e => setFilterSem(e.target.value)} style={{ padding: 8, borderRadius: 6 }}>
          <option>All</option>
          <option>5</option>
          <option>6</option>
        </select>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
        {filteredCourses.map(course => (
          <div key={course.code} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#3730a3' }}>{course.name}</div>
            <div style={{ color: '#64748b', fontSize: '0.97rem' }}>{course.code} • {course.department}</div>
            <div style={{ fontSize: '0.95rem' }}>Semester: <strong>{course.semester}</strong> | Credits: <strong>{course.credits}</strong></div>
            <div style={{ fontSize: '0.95rem', color: '#059669' }}>Teacher: <strong>{courseToTeacher[course.name] || 'Unassigned'}</strong></div>
          </div>
        ))}
        {filteredCourses.length === 0 && <div style={{ color: '#ef4444', fontWeight: 600, gridColumn: '1/-1' }}>No courses found.</div>}
      </div>
    </div>
  );
}

export default Courses;
