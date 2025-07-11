import React, { useState, useEffect } from 'react';
import './AssignRoles.css';

const demoTeachers = [
  { name: 'Alice', role: 'teacher_level2', specialization: 'Computer Science' },
  { name: 'Bob', role: 'teacher_level2', specialization: 'Mathematics' },
  { name: 'Mohit', role: 'teacher_level2', specialization: 'Physics' },
  { name: 'Ram', role: 'teacher_level2', specialization: 'Chemistry' },
  { name: 'Priya', role: 'teacher_level2', specialization: 'English' },
];

const demoCourses = [
  { name: 'Mathematics', credits: 4, theoryHours: 3, practicalHours: 1, color: '#3b82f6' },
  { name: 'Computer Science', credits: 4, theoryHours: 2, practicalHours: 2, color: '#10b981' },
  { name: 'Physics', credits: 3, theoryHours: 2, practicalHours: 1, color: '#f59e0b' },
  { name: 'English Literature', credits: 2, theoryHours: 2, practicalHours: 0, color: '#8b5cf6' },
  { name: 'Chemistry', credits: 3, theoryHours: 2, practicalHours: 1, color: '#ef4444' },
  { name: 'Data Structures', credits: 4, theoryHours: 2, practicalHours: 2, color: '#06b6d4' },
];

const timeSlots = [
  '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'
];

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function roleBadge(role) {
  if (role === 'teacher_level2') return <span className="ar-badge teacher">Teacher</span>;
  if (role === 'teacher_level1') return <span className="ar-badge hod">HOD</span>;
  if (role === 'student') return <span className="ar-badge student">Student</span>;
  return <span className="ar-badge">User</span>;
}

function AssignRoles() {
  const [formData, setFormData] = useState({ 
    teacherId: '', 
    courseId: '', 
    day: '',
    timeSlot: '',
    type: 'theory'
  });
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkAssignments, setBulkAssignments] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState({});
  const [message, setMessage] = useState('');
  const [refresh, setRefresh] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [selectedCell, setSelectedCell] = useState(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);

  const assignments = JSON.parse(localStorage.getItem('teacherAssignments') || '[]');
  const timetable = JSON.parse(localStorage.getItem('timetable') || '{}');

  const isDuplicate = assignments.some(
    a => a.teacher === formData.teacherId && a.course === formData.courseId
  );

  const isTimeSlotOccupied = (day, timeSlot) => {
    return timetable[day] && timetable[day][timeSlot];
  };

  const getCourseDetails = (courseName) => {
    return demoCourses.find(c => c.name === courseName);
  };

  const getTeacherDetails = (teacherName) => {
    return demoTeachers.find(t => t.name === teacherName);
  };

  const getAssignmentForSlot = (day, timeSlot) => {
    return assignments.find(a => a.day === day && a.timeSlot === timeSlot);
  };

  const handleCellClick = (day, timeSlot) => {
    const assignment = getAssignmentForSlot(day, timeSlot);
    if (assignment) {
      setEditingAssignment(assignment);
      setFormData({
        teacherId: assignment.teacher,
        courseId: assignment.course,
        day: assignment.day,
        timeSlot: assignment.timeSlot,
        type: assignment.type
      });
    } else {
      setEditingAssignment(null);
      setFormData({
        teacherId: '',
        courseId: '',
        day: day,
        timeSlot: timeSlot,
        type: 'theory'
      });
    }
    setSelectedCell({ day, timeSlot });
    setShowAssignmentModal(true);
  };

  const handleSlotSelection = (day, timeSlot) => {
    if (isTimeSlotOccupied(day, timeSlot)) return;
    
    const slotKey = `${day}-${timeSlot}`;
    setSelectedSlots(prev => ({
      ...prev,
      [slotKey]: !prev[slotKey]
    }));
  };

  const addBulkAssignment = () => {
    if (!formData.teacherId || !formData.courseId) {
      setMessage('Please select teacher and course first.');
      setTimeout(() => setMessage(''), 2000);
      return;
    }

    const selectedCourse = getCourseDetails(formData.courseId);
    const newBulkAssignment = {
      teacher: formData.teacherId,
      course: formData.courseId,
      credits: selectedCourse.credits,
      theoryHours: selectedCourse.theoryHours,
      practicalHours: selectedCourse.practicalHours,
      color: selectedCourse.color,
      slots: Object.keys(selectedSlots).filter(key => selectedSlots[key]).map(key => {
        const [day, timeSlot] = key.split('-');
        return { day, timeSlot, type: formData.type };
      })
    };

    setBulkAssignments(prev => [...prev, newBulkAssignment]);
    setSelectedSlots({});
    setFormData(prev => ({ ...prev, day: '', timeSlot: '' }));
  };

  const removeBulkAssignment = (index) => {
    setBulkAssignments(prev => prev.filter((_, i) => i !== index));
  };

  const handleBulkSubmit = (e) => {
    e.preventDefault();
    
    if (bulkAssignments.length === 0) {
      setMessage('Please add at least one bulk assignment.');
      setTimeout(() => setMessage(''), 2000);
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    bulkAssignments.forEach(bulkAssignment => {
      bulkAssignment.slots.forEach(slot => {
        if (isTimeSlotOccupied(slot.day, slot.timeSlot)) {
          errorCount++;
          return;
        }

        const newAssignment = {
          teacher: bulkAssignment.teacher,
          course: bulkAssignment.course,
          credits: bulkAssignment.credits,
          theoryHours: bulkAssignment.theoryHours,
          practicalHours: bulkAssignment.practicalHours,
          color: bulkAssignment.color,
          day: slot.day,
          timeSlot: slot.timeSlot,
          type: slot.type
        };

        assignments.push(newAssignment);

        const updatedTimetable = { ...timetable };
        if (!updatedTimetable[slot.day]) {
          updatedTimetable[slot.day] = {};
        }
        updatedTimetable[slot.day][slot.timeSlot] = bulkAssignment.teacher;
        localStorage.setItem('timetable', JSON.stringify(updatedTimetable));
        
        successCount++;
      });
    });

    localStorage.setItem('teacherAssignments', JSON.stringify(assignments));
    
    setMessage(`Successfully assigned ${successCount} slots. ${errorCount > 0 ? `${errorCount} slots were already occupied.` : ''}`);
    setBulkAssignments([]);
    setSelectedSlots({});
    setFormData({ teacherId: '', courseId: '', day: '', timeSlot: '', type: 'theory' });
    setBulkMode(false);
    setRefresh(r => !r);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleAssignmentSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.teacherId || !formData.courseId) {
      setMessage('Please select teacher and course.');
      setTimeout(() => setMessage(''), 2000);
      return;
    }

    const selectedCourse = getCourseDetails(formData.courseId);
    const newAssignment = {
      teacher: formData.teacherId,
      course: formData.courseId,
      credits: selectedCourse.credits,
      theoryHours: selectedCourse.theoryHours,
      practicalHours: selectedCourse.practicalHours,
      color: selectedCourse.color,
      day: formData.day,
      timeSlot: formData.timeSlot,
      type: formData.type
    };

    if (editingAssignment) {
      const index = assignments.findIndex(a => 
        a.day === editingAssignment.day && 
        a.timeSlot === editingAssignment.timeSlot
      );
      if (index !== -1) {
        assignments[index] = newAssignment;
      }
    } else {
      assignments.push(newAssignment);
    }

    localStorage.setItem('teacherAssignments', JSON.stringify(assignments));

    const updatedTimetable = { ...timetable };
    if (!updatedTimetable[formData.day]) {
      updatedTimetable[formData.day] = {};
    }
    updatedTimetable[formData.day][formData.timeSlot] = formData.teacherId;
    localStorage.setItem('timetable', JSON.stringify(updatedTimetable));

    setMessage(`${editingAssignment ? 'Updated' : 'Assigned'} ${formData.teacherId} to ${formData.courseId} (${formData.type}) on ${formData.day} at ${formData.timeSlot}`);
    setFormData({ teacherId: '', courseId: '', day: '', timeSlot: '', type: 'theory' });
    setEditingAssignment(null);
    setSelectedCell(null);
    setShowAssignmentModal(false);
    setRefresh(r => !r);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDeleteAssignment = () => {
    if (!editingAssignment) return;

    const index = assignments.findIndex(a => 
      a.day === editingAssignment.day && 
      a.timeSlot === editingAssignment.timeSlot
    );
    
    if (index !== -1) {
      assignments.splice(index, 1);
      localStorage.setItem('teacherAssignments', JSON.stringify(assignments));
      
      const updatedTimetable = { ...timetable };
      if (updatedTimetable[editingAssignment.day] && updatedTimetable[editingAssignment.day][editingAssignment.timeSlot]) {
        delete updatedTimetable[editingAssignment.day][editingAssignment.timeSlot];
        localStorage.setItem('timetable', JSON.stringify(updatedTimetable));
      }
      
      setMessage('Assignment deleted successfully.');
      setFormData({ teacherId: '', courseId: '', day: '', timeSlot: '', type: 'theory' });
      setEditingAssignment(null);
      setSelectedCell(null);
      setShowAssignmentModal(false);
      setRefresh(r => !r);
      setTimeout(() => setMessage(''), 2000);
    }
  };

  const generateMongoDBStructure = () => {
    const mongoStructure = {};
    days.forEach(day => {
      mongoStructure[day.toLowerCase()] = {};
      timeSlots.forEach(time => {
        if (timetable[day] && timetable[day][time]) {
          mongoStructure[day.toLowerCase()][time] = timetable[day][time];
        }
      });
    });
    return mongoStructure;
  };

  const exportToMongoDB = () => {
    const mongoData = generateMongoDBStructure();
    console.log('MongoDB Structure:', mongoData);
    localStorage.setItem('mongoTimetable', JSON.stringify(mongoData));
    setMessage('Timetable exported to MongoDB format. Check console for structure.');
    setTimeout(() => setMessage(''), 3000);
  };

  const assignedCourses = assignments.map(a => a.course);
  const unassignedCourses = demoCourses.filter(c => !assignedCourses.includes(c.name));

  const stats = {
    totalAssignments: assignments.length,
    totalTeachers: new Set(assignments.map(a => a.teacher)).size,
    totalCourses: new Set(assignments.map(a => a.course)).size,
    totalSlots: Object.values(timetable).reduce((sum, day) => sum + Object.keys(day || {}).length, 0)
  };

  return (
    <div className="ar-container">
      <div className="ar-header">
        <h3 className="ar-title">Timetable Management System</h3>
        <div className="ar-header-actions">
          <button 
            onClick={() => setShowStats(!showStats)} 
            className="ar-btn ar-btn-secondary"
          >
            {showStats ? 'Stats' : 'Stats'}
          </button>
          <button 
            onClick={() => setBulkMode(!bulkMode)} 
            className="ar-btn ar-btn-secondary"
          >
            {bulkMode ? 'Single Mode' : 'Bulk Mode'}
          </button>
        </div>
      </div>

      {showStats && (
        <div className="ar-stats-grid">
          <div className="ar-stat-card">
            <div className="ar-stat-number">{stats.totalAssignments}</div>
            <div className="ar-stat-label">Total Assignments</div>
          </div>
          <div className="ar-stat-card">
            <div className="ar-stat-number">{stats.totalTeachers}</div>
            <div className="ar-stat-label">Teachers Assigned</div>
          </div>
          <div className="ar-stat-card">
            <div className="ar-stat-number">{stats.totalCourses}</div>
            <div className="ar-stat-label">Courses Covered</div>
          </div>
          <div className="ar-stat-card">
            <div className="ar-stat-number">{stats.totalSlots}</div>
            <div className="ar-stat-label">Time Slots Used</div>
          </div>
        </div>
      )}

      {bulkMode ? (
        <div className="ar-bulk-form">
          <h4 className="ar-form-title">Bulk Assignment Mode</h4>
          <div className="ar-form-row">
            <div className="ar-form-group">
              <label>Teacher</label>
              <select
                value={formData.teacherId}
                onChange={e => setFormData({ ...formData, teacherId: e.target.value })}
                required
                className="ar-select"
              >
                <option value="">Select Teacher</option>
                {demoTeachers.map(t => (
                  <option key={t.name} value={t.name}>
                    {t.name} ({t.specialization})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="ar-form-group">
              <label>Course</label>
              <select
                value={formData.courseId}
                onChange={e => setFormData({ ...formData, courseId: e.target.value })}
                required
                className="ar-select"
              >
                <option value="">Select Course</option>
                {demoCourses.map(c => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.credits} credits - {c.theoryHours}T/{c.practicalHours}P)
                  </option>
                ))}
              </select>
            </div>
            
            <div className="ar-form-group">
              <label>Type</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                required
                className="ar-select"
              >
                <option value="theory">Theory</option>
                <option value="practical">Practical</option>
              </select>
            </div>
          </div>

          <div className="ar-slot-selector">
            <h4>Select Time Slots:</h4>
            <div className="ar-slot-grid">
              {days.map(day => (
                <div key={day} className="ar-day-column">
                  <h5>{day}</h5>
                  {timeSlots.map(time => {
                    const slotKey = `${day}-${time}`;
                    const isOccupied = isTimeSlotOccupied(day, time);
                    const isSelected = selectedSlots[slotKey];
                    
                    return (
                      <button
                        key={time}
                        type="button"
                        className={`ar-slot-btn ${isOccupied ? 'ar-slot-occupied' : ''} ${isSelected ? 'ar-slot-selected' : ''}`}
                        onClick={() => handleSlotSelection(day, time)}
                        disabled={isOccupied}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="ar-bulk-actions">
            <button 
              type="button" 
              onClick={addBulkAssignment}
              className="ar-btn ar-btn-secondary"
              disabled={!formData.teacherId || !formData.courseId || Object.keys(selectedSlots).filter(key => selectedSlots[key]).length === 0}
            >
              Add to Bulk List
            </button>
            
            <button 
              type="button" 
              onClick={handleBulkSubmit}
              className="ar-btn ar-btn-export"
              disabled={bulkAssignments.length === 0}
            >
              Assign All ({bulkAssignments.length} assignments)
            </button>
          </div>

          {bulkAssignments.length > 0 && (
            <div className="ar-bulk-list">
              <h4>Bulk Assignments:</h4>
              {bulkAssignments.map((assignment, index) => (
                <div key={index} className="ar-bulk-item">
                  <div className="ar-bulk-info">
                    <span className="ar-bulk-teacher">{assignment.teacher}</span>
                    <span className="ar-bulk-arrow">→</span>
                    <span className="ar-bulk-course" style={{ color: assignment.color }}>
                      {assignment.course}
                    </span>
                    <span className="ar-bulk-slots">({assignment.slots.length} slots)</span>
                  </div>
                  <button 
                    onClick={() => removeBulkAssignment(index)}
                    className="ar-btn-remove"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="ar-timetable-section">
          <div className="ar-timetable-header">
            <h4>Interactive Timetable</h4>
            <p>Click on any cell to assign, edit, or delete assignments</p>
          </div>
          
          <div className="ar-timetable">
            <table className="ar-timetable-table">
              <thead>
                <tr>
                  <th>Time</th>
                  {days.map(day => <th key={day}>{day}</th>)}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map(time => (
                  <tr key={time}>
                    <td className="ar-time-cell">{time}</td>
                    {days.map(day => {
                      const assignment = getAssignmentForSlot(day, time);
                      const isSelected = selectedCell && selectedCell.day === day && selectedCell.timeSlot === time;
                      
                      return (
                        <td 
                          key={day} 
                          className={`ar-slot-cell ${isSelected ? 'ar-slot-selected' : ''} ${assignment ? 'ar-slot-occupied' : ''}`}
                          onClick={() => handleCellClick(day, time)}
                        >
                          {assignment ? (
                            <div className="ar-slot-content" style={{ backgroundColor: assignment.color }}>
                              <div className="ar-slot-teacher">{assignment.teacher}</div>
                              <div className="ar-slot-course">{assignment.course}</div>
                              <div className="ar-slot-type">({assignment.type})</div>
                            </div>
                          ) : (
                            <div className="ar-slot-empty">Click to assign</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {message && <div className="ar-toast">{message}</div>}

      {unassignedCourses.length > 0 && (
        <div className="ar-section ar-unassigned">
          <div className="ar-section-header">Unassigned Courses</div>
          <div className="ar-unassigned-list">
            {unassignedCourses.map(c => (
              <span key={c.name} className="ar-course-item" style={{ borderLeftColor: c.color }}>
                {c.name} ({c.credits} credits - {c.theoryHours}T/{c.practicalHours}P)
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="ar-section">
        <div className="ar-section-header">Export Options</div>
        <button onClick={exportToMongoDB} className="ar-btn ar-btn-export">
          Export to MongoDB Format
        </button>
        <div className="ar-mongo-info">
          <strong>MongoDB Structure:</strong> teacher: {`{monday: {7.0am: "Mohit", 8.0: "Ram"}}`}
        </div>
      </div>

      {showAssignmentModal && (
        <div className="ar-modal-overlay" onClick={() => setShowAssignmentModal(false)}>
          <div className="ar-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingAssignment ? 'Edit Assignment' : 'New Assignment'}</h3>
            <form onSubmit={handleAssignmentSubmit} className="ar-modal-form">
              <div className="ar-form-group">
                <label>Teacher</label>
                <select
                  value={formData.teacherId}
                  onChange={e => setFormData({ ...formData, teacherId: e.target.value })}
                  required
                  className="ar-select"
                >
                  <option value="">Select Teacher</option>
                  {demoTeachers.map(t => (
                    <option key={t.name} value={t.name}>
                      {t.name} ({t.specialization})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="ar-form-group">
                <label>Course</label>
                <select
                  value={formData.courseId}
                  onChange={e => setFormData({ ...formData, courseId: e.target.value })}
                  required
                  className="ar-select"
                >
                  <option value="">Select Course</option>
                  {demoCourses.map(c => (
                    <option key={c.name} value={c.name}>
                      {c.name} ({c.credits} credits - {c.theoryHours}T/{c.practicalHours}P)
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="ar-form-group">
                <label>Type</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  required
                  className="ar-select"
                >
                  <option value="theory">Theory</option>
                  <option value="practical">Practical</option>
                </select>
              </div>

              <div className="ar-modal-actions">
                <button type="submit" className="ar-btn ar-btn-primary">
                  {editingAssignment ? 'Update' : 'Assign'}
                </button>
                {editingAssignment && (
                  <button 
                    type="button" 
                    onClick={handleDeleteAssignment}
                    className="ar-btn ar-btn-danger"
                  >
                    Delete
                  </button>
                )}
                <button 
                  type="button" 
                  onClick={() => setShowAssignmentModal(false)}
                  className="ar-btn ar-btn-cancel"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssignRoles;
