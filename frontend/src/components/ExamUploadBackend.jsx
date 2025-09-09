import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../utils/api';

function parseCSV(text) {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.trim());
  const headers = lines[0].split(',').map(h => h.trim());
  const idx = (name) => headers.findIndex(h => h.toLowerCase() === name.toLowerCase());
  const iStudent = idx('student') !== -1 ? idx('student') : idx('roll') !== -1 ? idx('roll') : -1;
  const iMarks = idx('marks');
  const iCourse = idx('course') !== -1 ? idx('course') : idx('subject');
  const iExam = idx('exam') !== -1 ? idx('exam') : idx('examname');
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim());
    if (!cols.length) continue;
    rows.push({
      studentRef: cols[iStudent],
      marks: Number(cols[iMarks]),
      course: cols[iCourse],
      examName: iExam !== -1 ? cols[iExam] : undefined,
    });
  }
  return rows.filter(r => r.studentRef && !Number.isNaN(r.marks) && r.course);
}

export default function ExamUploadBackend({ date, semester }) {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [courses, setCourses] = useState([]);
  const [courseMap, setCourseMap] = useState({});
  const [studentsLookup, setStudentsLookup] = useState({});
  const [examCategory, setExamCategory] = useState('ICA'); // ICA | Internal | External
  const [icaVariant, setIcaVariant] = useState('ICA Test 1'); // When ICA selected
  const [totalMarks, setTotalMarks] = useState(20);

  useEffect(() => {
    // Load teacher's assigned courses from backend
  const loadCourses = async () => {
      try {
        let list = await apiClient.getCourses({ instructor: user?.id });
        // Fallbacks: department, then all
        if (!list || list.length === 0) {
          list = await apiClient.getCourses({ department: user?.department });
        }
        if (!list || list.length === 0) {
          list = await apiClient.getCourses();
        }
        // Client-side filter to teacher's own courses if instructor populated
        const mine = (list || []).filter(c => c?.instructor?._id === user?.id || c?.instructor === user?.id);
        setCourses(mine.length ? mine : (list || []));
        const map = {};
        (mine.length ? mine : (list || [])).forEach(c => { map[c.courseName] = c; });
        setCourseMap(map);
      } catch (e) {
        setMessage('Failed to load courses');
      }
    };
    if (user?.id) loadCourses();
  }, [user?.id]);

  // When subject changes, load students of that course for mapping
  useEffect(() => {
    const loadStudents = async () => {
      try {
        const course = courseMap[subject];
        if (!course?._id) return;
        const students = await apiClient.getCourseStudents(course._id);
        const map = {};
        students.forEach(s => {
          if (s._id) map[s._id] = s._id; // id -> id
          if (s.rollNumber) map[String(s.rollNumber).trim()] = s._id; // roll -> id
          if (s.email) map[String(s.email).trim().toLowerCase()] = s._id; // email -> id
          if (s.name) map[String(s.name).trim().toLowerCase()] = s._id; // name -> id
        });
        setStudentsLookup(map);
      } catch (e) {
        // non-fatal
      }
    };
    if (subject) loadStudents();
  }, [subject, courseMap]);

  // Available ICA variants based on course credits
  const icaOptions = useMemo(() => {
    const credits = courseMap[subject]?.credits || 0;
    if (credits >= 4) return ['ICA Test 1', 'ICA Test 2', 'ICA Test 3', 'ICA Practical'];
    if (credits >= 2) return ['ICA Test 1', 'ICA Test 2'];
    return ['ICA Test 1'];
  }, [subject, courseMap]);

  // Adjust total marks automatically
  useEffect(() => {
    if (examCategory === 'ICA' && icaVariant === 'ICA Practical') setTotalMarks(10);
    else if (examCategory === 'ICA') setTotalMarks(20);
  }, [examCategory, icaVariant]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!file || !subject) { setMessage('Select subject and CSV'); return; }
    setBusy(true);
    try {
      const text = await file.text();
      const rows = parseCSV(text);
      if (!rows.length) { setMessage('No valid rows in CSV'); return; }
      const payload = rows.map(r => ({
        student: studentsLookup[r.studentRef?.toString().toLowerCase()] || studentsLookup[r.studentRef] || r.studentRef,
        course: subject || r.course,
        examType: examCategory,
        examName: r.examName || (examCategory === 'ICA' ? icaVariant : examCategory),
        marks: r.marks,
        totalMarks: Number(totalMarks),
        date: date || new Date(),
        semester: semester ? Number(semester) : courseMap[subject]?.semester,
      }));
      const res = await apiClient.uploadExamResults(payload);
      setMessage(`Uploaded ${res.results?.length || 0} results`);
    } catch (err) {
      setMessage(err.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="exam-upload-container">
      <h3>Upload Exam Results</h3>
      {message && <div className={`upload-toast ${message.toLowerCase().includes('upload') ? 'success' : 'error'}`}>{message}</div>}
      <form onSubmit={onSubmit} className="upload-form">
        <div className="form-row">
          <div className="form-group">
            <label>Subject *</label>
            <select value={subject} onChange={e => setSubject(e.target.value)} required>
              <option value="">Select Subject</option>
              {courses.map(c => (
                <option key={c._id} value={c.courseName}>{c.courseName} (Sem {c.semester}, {c.credits} cr)</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Category *</label>
            <select value={examCategory} onChange={e => setExamCategory(e.target.value)} required>
              <option value="ICA">ICA</option>
              <option value="Internal">Other Internal</option>
              <option value="External">External</option>
            </select>
          </div>
          {examCategory === 'ICA' && (
            <div className="form-group">
              <label>ICA Variant *</label>
              <select value={icaVariant} onChange={e => setIcaVariant(e.target.value)}>
                {icaOptions.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
              </select>
            </div>
          )}
          <div className="form-group">
            <label>Total Marks *</label>
            <input type="number" min={1} value={totalMarks} onChange={e => setTotalMarks(e.target.value)} required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>CSV *</label>
            <input type="file" accept=".csv" onChange={e => setFile(e.target.files?.[0] || null)} required />
            <small>Columns: Student(or Roll/Email/Name), Marks[, Course, Exam]</small>
          </div>
        </div>
        <button className="upload-btn" type="submit" disabled={busy || !file || !subject}>Upload</button>
      </form>
    </div>
  );
}
