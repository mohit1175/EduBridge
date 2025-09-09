import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../utils/api';
import '../styles/MarkAttendance.css';

// Simple, in-class marking UI for teacher level 2
// Props (optional): course, students, date, onChangeDate, onSubmitted
function MarkAttendance({ course, courses = [], selectedCourseId, onChangeCourse, students: inputStudents, date: inputDate, onChangeDate, onSubmitted }) {
  const { isTeacher, isHOD } = useAuth();
  const [date, setDate] = useState(inputDate || new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState(inputStudents || []);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState('present'); // 'present' | 'absent'
  const [overrides, setOverrides] = useState({}); // { studentId: 'present'|'absent' }

  useEffect(() => { if (inputStudents) setStudents(inputStudents); }, [inputStudents]);
  useEffect(() => { if (inputDate) setDate(inputDate); }, [inputDate]);

  const finalStatus = (studentId) => overrides[studentId] || defaultStatus;

  const toggleException = (studentId) => {
    setOverrides(prev => {
      const next = { ...prev };
      const opposite = defaultStatus === 'present' ? 'absent' : 'present';
      if (next[studentId] === opposite) {
        delete next[studentId];
      } else {
        next[studentId] = opposite;
      }
      return next;
    });
  };

  const setExplicit = (studentId, status) => {
    setOverrides(prev => {
      const next = { ...prev };
      if (status === defaultStatus) {
        delete next[studentId]; // same as default
      } else {
        next[studentId] = status;
      }
      return next;
    });
  };

  const markAll = (status) => {
    setDefaultStatus(status);
    setOverrides({}); // clear exceptions
  };

  const submit = async () => {
    if (!course) return alert('Please select a course');
    if (!students?.length) return alert('No students to mark');

    const attendanceRecords = students.map(s => ({
      student: s._id,
      course: course.courseName,
      status: finalStatus(s._id),
    }));

    try {
      setSaving(true);
      await apiClient.markBulkAttendance(attendanceRecords, date, course.semester);
      setOverrides({});
      if (onSubmitted) onSubmitted();
    } catch (e) {
      console.error('Failed to save attendance', e);
      alert(e?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  if (!(isTeacher || isHOD)) return null;

  return (
    <div className="ma-card">
    <div className="ma-toolbar">
        <div className="ma-toolbar-left">
          <span className="ma-title">Mark Attendance</span>
          <div className="ma-sep" />
          {/* Subject dropdown (optional) */}
          {Array.isArray(courses) && courses.length > 0 && typeof onChangeCourse === 'function' && (
            <label className="ma-subject">
              Subject
              <select value={selectedCourseId || ''} onChange={e => onChangeCourse(e.target.value)}>
                <option value="">Select</option>
                {courses.map(c => (
                  <option key={c._id} value={c._id}>{c.courseName}</option>
                ))}
              </select>
            </label>
          )}
          <button className={`ma-chip ${defaultStatus === 'present' ? 'active present' : ''}`} onClick={() => markAll('present')} disabled={saving}>
            Mark All Present
          </button>
          <button className={`ma-chip ${defaultStatus === 'absent' ? 'active absent' : ''}`} onClick={() => markAll('absent')} disabled={saving}>
            Mark All Absent
          </button>
        </div>
        <div className="ma-toolbar-right">
          <label className="ma-date">
            Date
            <input type="date" value={date} onChange={e => { setDate(e.target.value); onChangeDate && onChangeDate(e.target.value); }} />
          </label>
          <button className="ma-submit" onClick={submit} disabled={saving}>
            {saving ? 'Saving…' : 'Submit Attendance'}
          </button>
        </div>
      </div>

      <div className="ma-table-wrap">
        {(!students || students.length === 0) ? (
          <div style={{ padding: 16, color: '#6b7280' }}>
            No students found for this course. This list shows students matching the course department and semester.
            Try selecting a different course.
          </div>
        ) : (
        <table className="ma-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Student</th>
              <th>Roll</th>
              <th className="text-center">Exception</th>
              <th className="text-center">Final</th>
              <th className="text-right">Quick Set</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, idx) => {
              const status = finalStatus(s._id);
              const opposite = status === 'present' ? 'absent' : 'present';
              const isException = overrides[s._id] !== undefined;
              return (
                <tr key={s._id} className={`status-${status}`}>
                  <td>{idx + 1}</td>
                  <td>
                    <div className="ma-student">
                      <div className="ma-avatar">{(s.name || '?').charAt(0).toUpperCase()}</div>
                      <div>
                        <div className="ma-name">{s.name}</div>
                        <div className="ma-sub">{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{s.rollNumber || '-'}</td>
                  <td className="text-center">
                    <button type="button" className={`ma-exc ${isException ? 'on' : ''}`} onClick={() => toggleException(s._id)} disabled={saving}>
                      {isException ? '✓' : ''}
                    </button>
                    <div className="ma-exc-hint">{defaultStatus === 'present' ? 'Absent' : 'Present'}</div>
                  </td>
                  <td className="text-center">
                    <span className={`ma-badge ${status}`}>{status === 'present' ? 'Present' : 'Absent'}</span>
                  </td>
                  <td className="text-right">
                    <div className="ma-actions">
                      <button type="button" className={`ma-btn present ${status === 'present' ? 'active' : ''}`} onClick={() => setExplicit(s._id, 'present')} disabled={saving}>Present</button>
                      <button type="button" className={`ma-btn absent ${status === 'absent' ? 'active' : ''}`} onClick={() => setExplicit(s._id, 'absent')} disabled={saving}>Absent</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
  </table>
  )}
      </div>
    </div>
  );
}

export default MarkAttendance;
