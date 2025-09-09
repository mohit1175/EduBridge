import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../utils/api';
import '../styles/Doubts.css';

function DoubtsNew() {
  const { user, isStudent, isTeacher, isHOD } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for doubts
  const [doubts, setDoubts] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, answered: 0, resolved: 0 });
  
  // State for filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [courseFilter, setCourseFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  
  // State for creating new doubt
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDoubt, setNewDoubt] = useState({
    course: '',
    subject: '',
    question: '',
    description: '',
    category: 'other',
    assignedTo: '',
    priority: 'medium'
  });
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  
  // State for answering doubts
  const [answeringDoubt, setAnsweringDoubt] = useState(null);
  const [answer, setAnswer] = useState('');

  useEffect(() => {
    loadData();
    // Preload teachers list for students
    if (isStudent) {
      preloadTeachers();
    }
  }, []);

  const preloadTeachers = async () => {
    try {
      // Fetch teachers in student's department and HOD
      const list = await apiClient.get('/auth/users', { role: ['teacher_level1','teacher_level2'], department: user?.department });
      setTeachers(list);
      const courseList = await apiClient.getCourses({ department: user?.department, semester: user?.semester });
      setCourses(courseList);
      // Build subjects (unique courseName acts as subject here)
      setSubjects(Array.from(new Set(courseList.map(c => c.courseName))));
    } catch (_) {}
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [doubtsResponse, statsResponse] = await Promise.all([
        apiClient.getDoubts(),
        apiClient.getDoubtStats()
      ]);

      setDoubts(doubtsResponse);
      setStats(statsResponse.overall || { total: 0, pending: 0, answered: 0, resolved: 0 });
    } catch (error) {
      console.error('Error loading doubts data:', error);
      setError('Failed to load doubts data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDoubt = async (e) => {
    e.preventDefault();
    try {
      await apiClient.createDoubt(newDoubt);
      setNewDoubt({ course: '', subject: '', question: '', description: '', category: 'other', assignedTo: '', priority: 'medium' });
      setShowCreateForm(false);
      await loadData();
    } catch (error) {
      console.error('Error creating doubt:', error);
      alert('Failed to create doubt');
    }
  };

  const handleAnswerDoubt = async (doubtId) => {
    if (!answer.trim()) {
      alert('Please provide an answer');
      return;
    }

    try {
      await apiClient.answerDoubt(doubtId, answer);
      setAnswer('');
      setAnsweringDoubt(null);
      await loadData();
    } catch (error) {
      console.error('Error answering doubt:', error);
      alert('Failed to answer doubt');
    }
  };

  const handleResolveDoubt = async (doubtId) => {
    try {
      await apiClient.resolveDoubt(doubtId);
      await loadData();
    } catch (error) {
      console.error('Error resolving doubt:', error);
      alert('Failed to resolve doubt');
    }
  };

  const handleDeleteDoubt = async (doubtId) => {
    if (!window.confirm('Are you sure you want to delete this doubt?')) {
      return;
    }

    try {
      await apiClient.deleteDoubt(doubtId);
      await loadData();
    } catch (error) {
      console.error('Error deleting doubt:', error);
      alert('Failed to delete doubt');
    }
  };

  // Filter doubts
  let filteredDoubts = doubts;
  if (statusFilter !== 'All') {
    filteredDoubts = filteredDoubts.filter(doubt => doubt.status === statusFilter);
  }
  if (courseFilter !== 'All') {
    filteredDoubts = filteredDoubts.filter(doubt => doubt.course === courseFilter);
  }
  if (priorityFilter !== 'All') {
    filteredDoubts = filteredDoubts.filter(doubt => doubt.priority === priorityFilter);
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'answered': return '#3b82f6';
      case 'resolved': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="doubts-page">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h3>Loading doubts...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="doubts-page">
        <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
          <h3>Error: {error}</h3>
          <button onClick={loadData} style={{ marginTop: '20px', padding: '10px 20px' }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="doubts-page">
      <div className="doubts-header">
        <h2>Doubts & Questions</h2>
        {isStudent && (
          <button 
            onClick={() => setShowCreateForm(true)}
            className="add-doubt-btn"
          >
            Ask a Question
          </button>
        )}
      </div>

      {/* Statistics */}
      <div className="doubts-stats-row">
        <div className="doubt-stat-card total">Total: {stats.total}</div>
        <div className="doubt-stat-card pending">Pending: {stats.pending}</div>
        <div className="doubt-stat-card resolved">Resolved: {stats.resolved}</div>
        <div className="doubt-stat-card">Answered: {stats.answered}</div>
      </div>

      {/* Filters */}
      <div className="doubts-filters">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">All Status</option>
          <option value="pending">Pending</option>
          <option value="answered">Answered</option>
          <option value="resolved">Resolved</option>
        </select>

        <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
          <option value="All">All Courses</option>
          {Array.from(new Set(doubts.map(d => d.course))).map(course => (
            <option key={course} value={course}>{course}</option>
          ))}
        </select>

        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="All">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Create Doubt Modal */}
      {showCreateForm && (
        <div className="doubt-modal-overlay">
          <div className="doubt-modal">
            <h3 style={{ marginTop: 0 }}>Ask a Question</h3>
            <form onSubmit={handleCreateDoubt} className="ask-doubt-form">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label>Course</label>
                  <select value={newDoubt.course} onChange={(e) => setNewDoubt({ ...newDoubt, course: e.target.value })} required>
                    <option value="">Select course</option>
                    {courses.map(c => (
                      <option key={c._id} value={c.courseName}>{c.courseName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Subject</label>
                  <select value={newDoubt.subject} onChange={(e) => setNewDoubt({ ...newDoubt, subject: e.target.value })} required>
                    <option value="">Select subject</option>
                    {subjects.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label>Category</label>
                  <select value={newDoubt.category} onChange={(e) => setNewDoubt({ ...newDoubt, category: e.target.value })}>
                    <option value="attendance">Regarding attendance</option>
                    <option value="marks">Regarding marks</option>
                    <option value="timetable">Regarding timetable</option>
                    <option value="other">Others</option>
                  </select>
                </div>
                <div>
                  <label>Faculty</label>
                  <select value={newDoubt.assignedTo} onChange={(e) => setNewDoubt({ ...newDoubt, assignedTo: e.target.value })} required>
                    <option value="">Select teacher/HOD</option>
                    {teachers.map(t => (
                      <option key={t._id} value={t._id}>{t.name} ({t.role === 'teacher_level1' ? 'HOD' : 'Teacher'})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label>Question</label>
                <input
                  type="text"
                  placeholder="Eg. Clarification about attendance for CS301"
                  value={newDoubt.question}
                  onChange={(e) => setNewDoubt({ ...newDoubt, question: e.target.value })}
                  required
                />
              </div>

              <div>
                <label>Description</label>
                <textarea
                  rows={4}
                  placeholder="Add details (optional)"
                  value={newDoubt.description}
                  onChange={(e) => setNewDoubt({ ...newDoubt, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="submit" className="add-doubt-btn">Submit</button>
                <button type="button" className="close-modal-btn" onClick={() => setShowCreateForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Doubts List */}
      <div className="doubts-list">
        {filteredDoubts.length === 0 ? (
          <div className="no-doubts">
            <h3>No doubts found</h3>
            <p>No doubts match your current filters.</p>
          </div>
        ) : (
          filteredDoubts.map(doubt => (
            <div key={doubt._id} className="doubt-card">
              <div className="doubt-card-header">
                <span className={`doubt-badge ${doubt.status}`}>{doubt.status}</span>
                <span className="doubt-course">{doubt.course}</span>
              </div>
              <div className="doubt-question">{doubt.question}</div>
              <div className="doubt-meta">Category: {doubt.category || 'other'} • Priority: {doubt.priority}</div>
              {doubt.description && <div className="doubt-answer">{doubt.description}</div>}

              {/* Answer actions */}
              <div className="doubt-actions">
                {(isTeacher || isHOD) && doubt.status === 'pending' && (
                  <button onClick={() => setAnsweringDoubt(doubt._id)} className="add-doubt-btn">Answer</button>
                )}
                {(isTeacher || isHOD) && doubt.status === 'answered' && (
                  <button onClick={() => handleResolveDoubt(doubt._id)} className="resolve-btn">Mark Resolved</button>
                )}
                {(doubt.student._id === user._id && doubt.status === 'pending') && (
                  <button onClick={() => handleDeleteDoubt(doubt._id)} className="close-modal-btn">Delete</button>
                )}
              </div>

              {answeringDoubt === doubt._id && (
                <div className="answer-form">
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Provide your answer here..."
                    rows={4}
                  />
                  <div className="form-actions">
                    <button onClick={() => handleAnswerDoubt(doubt._id)} className="add-doubt-btn">Submit Answer</button>
                    <button onClick={() => { setAnsweringDoubt(null); setAnswer(''); }} className="close-modal-btn">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default DoubtsNew;
