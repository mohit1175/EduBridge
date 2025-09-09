import React, { useState } from 'react';
import './ExamUpload.css';

function ExamUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [examType, setExamType] = useState('');
  const [subject, setSubject] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examLink, setExamLink] = useState('');
  const [message, setMessage] = useState('');
  const [uploadedExams, setUploadedExams] = useState(() => {
    const stored = localStorage.getItem('uploadedExams');
    return stored ? JSON.parse(stored) : [];
  });
  const [totalMarks, setTotalMarks] = useState('20'); // Default to 20

  const username = localStorage.getItem('username');
  const assignments = JSON.parse(localStorage.getItem('teacherAssignments') || '[]');
  const teacherCourses = assignments.filter(a => a.teacher === username).map(a => a.course);
  const examConfigs = JSON.parse(localStorage.getItem('examConfigs') || '[]');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      setSelectedFile(file);
      setMessage('');
    } else {
      setMessage('Please select a valid CSV file.');
      setSelectedFile(null);
    }
  };

  const handleUpload = (e) => {
    e.preventDefault();
    if (!selectedFile || !examType || !subject || !examDate || !totalMarks) {
      setMessage('Please fill all required fields.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvData = event.target.result;
        // Handle different line endings and clean up the data
        const lines = csvData.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim());
        
        // Validate CSV structure
        if (!headers.includes('Student') || !headers.includes('Marks')) {
          setMessage('CSV must contain "Student" and "Marks" columns.');
          return;
        }

        const results = [];
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(',').map(v => v.trim());
            const student = values[headers.indexOf('Student')];
            const marks = parseFloat(values[headers.indexOf('Marks')]);
            
            if (student && !isNaN(marks)) {
              results.push({
                student: student.trim(),
                marks: marks,
                total: parseFloat(totalMarks),
                examType,
                subject,
                date: examDate,
                uploadedBy: username,
                uploadedAt: new Date().toISOString()
              });
            }
          }
        }

        if (results.length === 0) {
          setMessage('No valid data found in CSV.');
          return;
        }

        // Save to localStorage
        const existingResults = JSON.parse(localStorage.getItem('examResults') || '[]');
        const updatedResults = [...existingResults, ...results];
        localStorage.setItem('examResults', JSON.stringify(updatedResults));

        // Add to uploaded exams list
        const newUpload = {
          id: Date.now(),
          examType,
          subject,
          examDate,
          examLink,
          totalMarks: parseFloat(totalMarks),
          resultsCount: results.length,
          uploadedBy: username,
          uploadedAt: new Date().toISOString()
        };

        const updatedUploads = [...uploadedExams, newUpload];
        setUploadedExams(updatedUploads);
        localStorage.setItem('uploadedExams', JSON.stringify(updatedUploads));

        setMessage(`Successfully uploaded ${results.length} results for ${examType} - ${subject}`);
        setSelectedFile(null);
        setExamType('');
        setSubject('');
        setExamDate('');
        setExamLink('');
        setTotalMarks('20');
        
        // Reset file input
        e.target.reset();
        
        setTimeout(() => setMessage(''), 5000);
      } catch (error) {
        setMessage('Error processing CSV file. Please check the format.');
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleDeleteUpload = (id) => {
    const updated = uploadedExams.filter(upload => upload.id !== id);
    setUploadedExams(updated);
    localStorage.setItem('uploadedExams', JSON.stringify(updated));
    setMessage('Upload deleted successfully.');
    setTimeout(() => setMessage(''), 3000);
  };

  const getExamTypes = () => {
    const types = ['ICA Test 1', 'ICA Test 2', 'ICA Test 3', 'Other Internal', 'External'];
    return types;
  };

  return (
    <div className="exam-upload-container">
      <h3>📤 Upload Exam Results</h3>
      
      {message && (
        <div className={`upload-toast ${message.includes('Successfully') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {/* Upload Form */}
      <div className="upload-form-section">
        <h4>Upload CSV Results</h4>
        <form onSubmit={handleUpload} className="upload-form">
          <div className="form-row">
            <div className="form-group">
              <label>Exam Type: *</label>
              <select 
                value={examType} 
                onChange={(e) => setExamType(e.target.value)}
                required
              >
                <option value="">Select Exam Type</option>
                {getExamTypes().map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Subject: *</label>
              <select 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)}
                required
              >
                <option value="">Select Subject</option>
                {teacherCourses.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Exam Date: *</label>
              <input 
                type="date" 
                value={examDate} 
                onChange={(e) => setExamDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Exam Link (Optional):</label>
              <input 
                type="url" 
                value={examLink} 
                onChange={(e) => setExamLink(e.target.value)}
                placeholder="https://forms.google.com/..."
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Total Marks: *</label>
              <select value={totalMarks} onChange={e => setTotalMarks(e.target.value)} required>
                <option value="">Select</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="25">25</option>
                <option value="30">30</option>
                <option value="40">40</option>
                <option value="50">50</option>
                <option value="60">60</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>CSV File: *</label>
            <input 
              type="file" 
              accept=".csv"
              onChange={handleFileChange}
              required
            />
            <small>CSV must contain "Student" and "Marks" columns</small>
          </div>

          <button type="submit" className="upload-btn" disabled={!selectedFile}>
            📤 Upload Results
          </button>
        </form>
      </div>

      {/* Uploaded Exams List */}
      <div className="uploaded-exams-section">
        <h4>Uploaded Exams</h4>
        {uploadedExams.length === 0 ? (
          <p className="no-uploads">No exams uploaded yet.</p>
        ) : (
          <div className="uploads-grid">
            {uploadedExams
              .filter(upload => upload.uploadedBy === username)
              .map((upload) => (
                <div key={upload.id} className="upload-card">
                  <div className="upload-header">
                    <h5>{upload.examType}</h5>
                    <button 
                      onClick={() => handleDeleteUpload(upload.id)}
                      className="delete-upload-btn"
                      title="Delete upload"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="upload-details">
                    <p><strong>Subject:</strong> {upload.subject}</p>
                    <p><strong>Date:</strong> {upload.examDate}</p>
                    <p><strong>Results:</strong> {upload.resultsCount} students</p>
                    {upload.examLink && (
                      <p><strong>Link:</strong> 
                        <a href={upload.examLink} target="_blank" rel="noopener noreferrer" className="exam-link">
                          View Form
                        </a>
                      </p>
                    )}
                    <p><strong>Uploaded:</strong> {new Date(upload.uploadedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* CSV Format Guide */}
      <div className="csv-guide">
        <h4>📋 CSV Format Guide</h4>
        <div className="guide-content">
          <p>Your CSV file should have the following format:</p>
          <div className="csv-example">
            <code>
              Student,Marks<br/>
              Alice,18<br/>
              Bob,16<br/>
              Mohit,20
            </code>
          </div>
          <ul>
            <li>First row should contain headers: "Student" and "Marks"</li>
            <li>Student names should match the names in the system</li>
            <li>Marks should be numeric values</li>
            <li>For ICA tests, marks are out of 20</li>
            <li>For other exams, marks follow the subject configuration</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ExamUpload; 