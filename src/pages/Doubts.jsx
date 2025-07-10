import React, { useState, useEffect } from 'react';
import '../styles/Doubts.css'; // Create this if you want to style it

function Doubts() {
  // Load from localStorage or use default
  const [doubts, setDoubts] = useState(() => {
    const stored = localStorage.getItem('doubts');
    return stored ? JSON.parse(stored) : [
      { id: 1, course: 'Math', question: 'What is integration by parts?', status: 'pending', student: 'John Doe', answer: '', teacher: '' },
      { id: 2, course: 'CS', question: 'What is the difference between == and ===?', status: 'resolved', student: 'Jane Smith', answer: '=== checks type too.', teacher: 'Mr. Khan' }
    ];
  });
  const [showModal, setShowModal] = useState(false);
  const [question, setQuestion] = useState('');
  const [course, setCourse] = useState('');
  const [search, setSearch] = useState('');
  const [filterCourse, setFilterCourse] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const role = localStorage.getItem('userRole');
  const username = localStorage.getItem('username');
  const [answerModal, setAnswerModal] = useState({ open: false, doubtId: null });
  const [answerText, setAnswerText] = useState('');

  useEffect(() => {
    localStorage.setItem('doubts', JSON.stringify(doubts));
  }, [doubts]);

  // Stats
  const total = doubts.length;
  const pending = doubts.filter(d => d.status === 'pending').length;
  const resolved = doubts.filter(d => d.status === 'resolved').length;

  // Filtered doubts
  const filteredDoubts = doubts.filter(d =>
    (role === 'teacher_level2' ? true : d.student === username) &&
    (filterCourse === 'All' || d.course === filterCourse) &&
    (filterStatus === 'All' || d.status === filterStatus) &&
    (d.question.toLowerCase().includes(search.toLowerCase()) || d.course.toLowerCase().includes(search.toLowerCase()))
  );

  // Add doubt
  const handleSubmit = (e) => {
    e.preventDefault();
    const newDoubt = {
      id: Date.now(),
      course,
      question,
      status: 'pending',
      student: username || 'Student',
      answer: '',
      teacher: ''
    };
    setDoubts([newDoubt, ...doubts]);
    setCourse('');
    setQuestion('');
    setShowModal(false);
  };

  // Resolve doubt
  const handleResolve = (id) => {
    setDoubts(doubts.map(d => d.id === id ? { ...d, status: 'resolved', answer: 'Answered by teacher.', teacher: 'Mr. Khan' } : d));
  };

  // Answer doubt (for teacher)
  const handleAnswer = (id) => {
    setAnswerModal({ open: true, doubtId: id });
    setAnswerText('');
  };

  const handleSubmitAnswer = (e) => {
    e.preventDefault();
    setDoubts(doubts.map(d => d.id === answerModal.doubtId ? { ...d, status: 'resolved', answer: answerText, teacher: username || 'Teacher' } : d));
    setAnswerModal({ open: false, doubtId: null });
    setAnswerText('');
  };

  return (
    <div className="doubts-page">
      <h2>Doubts & Q&A</h2>

      {/* Statistics */}
      <div className="doubts-stats-row">
        <div className="doubt-stat-card total">Total<br/><strong>{total}</strong></div>
        <div className="doubt-stat-card pending">Pending<br/><strong>{pending}</strong></div>
        <div className="doubt-stat-card resolved">Resolved<br/><strong>{resolved}</strong></div>
        {role !== 'teacher_level2' && (
          <button className="add-doubt-btn" onClick={() => setShowModal(true)}>+ Ask Doubt</button>
        )}
      </div>

      {/* Filters */}
      <div className="doubts-filters">
        <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
        <select value={filterCourse} onChange={e => setFilterCourse(e.target.value)}>
          <option>All</option>
          <option>Math</option>
          <option>CS</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option>All</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Doubt Cards */}
      <div className="doubts-list">
        {filteredDoubts.length === 0 && <div className="no-doubts">No doubts found.</div>}
        {filteredDoubts.map(doubt => (
          <div className="doubt-card" key={doubt.id}>
            <div className="doubt-card-header">
              <span className={`doubt-badge ${doubt.status}`}>{doubt.status === 'pending' ? 'Pending' : 'Resolved'}</span>
              <span className="doubt-course">{doubt.course}</span>
            </div>
            <div className="doubt-question">{doubt.question}</div>
            <div className="doubt-meta">Asked by <strong>{doubt.student}</strong></div>
            {doubt.status === 'resolved' && (
              <div className="doubt-answer">
                <span className="doubt-answer-label">Answer:</span> {doubt.answer} <span className="doubt-teacher">- {doubt.teacher}</span>
              </div>
            )}
            {doubt.status === 'pending' && role === 'teacher_level2' && (
              <button className="resolve-btn" onClick={() => handleAnswer(doubt.id)}>Answer</button>
            )}
            {doubt.status === 'pending' && role !== 'teacher_level2' && (
              <button className="resolve-btn" onClick={() => handleResolve(doubt.id)}>Mark as Resolved</button>
            )}
          </div>
        ))}
      </div>

      {/* Modal for adding doubt */}
      {showModal && role !== 'teacher_level2' && (
        <div className="doubt-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="doubt-modal" onClick={e => e.stopPropagation()}>
            <h3>Ask a Doubt</h3>
            <form className="ask-doubt-form" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Course"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                required
              />
              <textarea
                placeholder="Your doubt..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
              />
              <button type="submit">Submit</button>
            </form>
            <button className="close-modal-btn" onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Modal for answering doubt (teacher) */}
      {answerModal.open && (
        <div className="doubt-modal-overlay" onClick={() => setAnswerModal({ open: false, doubtId: null })}>
          <div className="doubt-modal" onClick={e => e.stopPropagation()}>
            <h3>Answer Doubt</h3>
            <form className="ask-doubt-form" onSubmit={handleSubmitAnswer}>
              <textarea
                placeholder="Your answer..."
                value={answerText}
                onChange={e => setAnswerText(e.target.value)}
                required
              />
              <button type="submit">Submit Answer</button>
            </form>
            <button className="close-modal-btn" onClick={() => setAnswerModal({ open: false, doubtId: null })}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Doubts;
