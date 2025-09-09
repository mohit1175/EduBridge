import React, { useState } from 'react';
import './ExamConfig.css';

const demoSubjects = [
  { code: 'MATH101', name: 'Mathematics', totalMarks: 100, department: 'Science' },
  { code: 'CS201', name: 'Computer Science', totalMarks: 100, department: 'Engineering' },
  { code: 'PHY111', name: 'Physics', totalMarks: 50, department: 'Science' },
  { code: 'ENG301', name: 'English Literature', totalMarks: 50, department: 'Arts' },
];

function ExamConfig() {
  const [configs, setConfigs] = useState(() => {
    const stored = localStorage.getItem('examConfigs');
    return stored ? JSON.parse(stored) : [];
  });
  const [selectedSubject, setSelectedSubject] = useState('');
  const [icaOption, setIcaOption] = useState('best'); // 'best' or 'average'
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const subject = demoSubjects.find(s => s.code === selectedSubject);
    if (!subject) return;

    const newConfig = {
      subjectCode: selectedSubject,
      subjectName: subject.name,
      totalMarks: subject.totalMarks,
      internalMarks: subject.totalMarks === 100 ? 40 : 20,
      icaMarks: 20,
      icaOption: icaOption,
      icaTests: 3,
      otherInternals: subject.totalMarks === 100 ? 20 : 0,
      externalMarks: subject.totalMarks === 100 ? 60 : 30,
      createdAt: new Date().toISOString()
    };

    // Check if config already exists
    const existingIndex = configs.findIndex(c => c.subjectCode === selectedSubject);
    if (existingIndex >= 0) {
      configs[existingIndex] = newConfig;
      setConfigs([...configs]);
      setMessage('Configuration updated successfully!');
    } else {
      setConfigs([...configs, newConfig]);
      setMessage('Configuration added successfully!');
    }

    localStorage.setItem('examConfigs', JSON.stringify([...configs, newConfig]));
    setSelectedSubject('');
    setIcaOption('best');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDelete = (subjectCode) => {
    const updated = configs.filter(c => c.subjectCode !== subjectCode);
    setConfigs(updated);
    localStorage.setItem('examConfigs', JSON.stringify(updated));
    setMessage('Configuration deleted successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const getUnconfiguredSubjects = () => {
    const configuredCodes = configs.map(c => c.subjectCode);
    return demoSubjects.filter(s => !configuredCodes.includes(s.code));
  };

  return (
    <div className="exam-config-container">
      <h3>📋 Exam Configuration</h3>
      
      {message && <div className="config-toast">{message}</div>}

      {/* Add/Edit Configuration */}
      <div className="config-form-section">
        <h4>Configure Subject</h4>
        <form onSubmit={handleSubmit} className="config-form">
          <div className="form-group">
            <label>Subject:</label>
            <select 
              value={selectedSubject} 
              onChange={(e) => setSelectedSubject(e.target.value)}
              required
            >
              <option value="">Select Subject</option>
              {getUnconfiguredSubjects().map(s => (
                <option key={s.code} value={s.code}>
                  {s.name} ({s.totalMarks} marks)
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>ICA Option:</label>
            <select 
              value={icaOption} 
              onChange={(e) => setIcaOption(e.target.value)}
              required
            >
              <option value="best">Best of 3 Tests</option>
              <option value="average">Average of 3 Tests</option>
            </select>
          </div>

          <button type="submit" className="config-btn">Configure</button>
        </form>
      </div>

      {/* Current Configurations */}
      <div className="config-list-section">
        <h4>Current Configurations</h4>
        {configs.length === 0 ? (
          <p className="no-config">No configurations set yet.</p>
        ) : (
          <div className="config-grid">
            {configs.map((config, index) => (
              <div key={config.subjectCode} className="config-card">
                <div className="config-header">
                  <h5>{config.subjectName}</h5>
                  <button 
                    onClick={() => handleDelete(config.subjectCode)}
                    className="delete-btn"
                    title="Delete configuration"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="config-details">
                  <div className="mark-breakdown">
                    <div className="mark-item">
                      <span>Total:</span>
                      <strong>{config.totalMarks}</strong>
                    </div>
                    <div className="mark-item">
                      <span>Internal:</span>
                      <strong>{config.internalMarks}</strong>
                    </div>
                    <div className="mark-item">
                      <span>ICA:</span>
                      <strong>{config.icaMarks}</strong>
                    </div>
                    <div className="mark-item">
                      <span>External:</span>
                      <strong>{config.externalMarks}</strong>
                    </div>
                  </div>
                  
                  <div className="ica-info">
                    <p>{config.icaTests} MCQ Tests</p>
                    <p>{config.icaOption === 'best' ? 'Best Score' : 'Average Score'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Configuration Summary */}
      {configs.length > 0 && (
        <div className="config-summary">
          <h4>Configuration Summary</h4>
          <div className="summary-stats">
            <div className="summary-item">
              <span>Total Subjects:</span>
              <strong>{configs.length}</strong>
            </div>
            <div className="summary-item">
              <span>100 Marks Subjects:</span>
              <strong>{configs.filter(c => c.totalMarks === 100).length}</strong>
            </div>
            <div className="summary-item">
              <span>50 Marks Subjects:</span>
              <strong>{configs.filter(c => c.totalMarks === 50).length}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExamConfig; 