import React, { useEffect, useMemo, useState, useCallback } from 'react';
import '../styles/Exams.css';
import '../styles/StudyMaterials.css';
import apiClient from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

function StudyMaterials() {
  const { user, isTeacher, isHOD, isStudent } = useAuth();
  const [courses, setCourses] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Upload form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseId, setCourseId] = useState('');
  const [file, setFile] = useState(null);

  const isUploader = isTeacher || isHOD;

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [courseList, materialList] = await Promise.all([
        isStudent
          ? apiClient.getCourses({ department: user?.department, semester: user?.semester })
          : (isHOD ? apiClient.getCourses() : apiClient.getCourses({ instructor: user?._id })),
        apiClient.getStudyMaterials()
      ]);
      setCourses(courseList || []);
      setMaterials(materialList || []);
    } catch (e) {
      setMessage('Failed to load study materials');
    } finally {
      setLoading(false);
    }
  }, [isStudent, isHOD, user?.department, user?.semester, user?._id]);

  useEffect(() => { loadData(); }, [loadData]);

  const courseMap = useMemo(() => {
    const m = {}; (courses || []).forEach(c => m[c._id] = c); return m;
  }, [courses]);

  const filtered = useMemo(() => {
    if (subjectFilter === 'All') return materials;
    return materials.filter(m => m.course?._id === subjectFilter);
  }, [materials, subjectFilter]);

  const onUpload = async (e) => {
    e.preventDefault();
    if (!title || !file || !courseId) { setMessage('Fill title, file, and subject'); return; }
    try {
      const res = await apiClient.uploadStudyMaterial({ file, title, description, courseId });
      setMessage('Uploaded successfully');
      setTitle(''); setDescription(''); setCourseId(''); setFile(null);
      setMaterials(prev => [res.material, ...prev]);
    } catch (e) {
      setMessage(e.message || 'Upload failed');
    }
  };

  const openMaterial = async (mat) => {
    try {
      const blob = await apiClient.downloadFile(`/materials/${mat._id}/file`);
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch (e) {
      setMessage(e.message || 'Failed to open file');
    }
  };

  return (
    <div className="sm-container">
      <h2 className="sm-title">Study Materials</h2>

      {isUploader && (
        <div className="sm-card sm-upload">
          <h3>Upload Study Material</h3>
          <form onSubmit={onUpload} className="sm-form">
            <div className="sm-field">
              <label className="sm-label">Subject</label>
              <select className="sm-select" value={courseId} onChange={e => setCourseId(e.target.value)} required>
                <option value="">Select Subject</option>
                {courses.map(c => (
                  <option key={c._id} value={c._id}>{c.courseName} (Sem {c.semester})</option>
                ))}
              </select>
            </div>
            <div className="sm-field">
              <label className="sm-label">Title</label>
              <input className="sm-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Unit 1 Notes" required />
            </div>
            <div className="sm-field-wide">
              <label className="sm-label">Description</label>
              <input className="sm-input" value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional" />
            </div>
            <div className="sm-field-file">
              <label className="sm-label">File</label>
              <input className="sm-file" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.xls,.xlsx" onChange={e => setFile(e.target.files?.[0] || null)} required />
            </div>
            <div className="sm-actions">
              <button type="submit" className="sm-upload-btn">Upload</button>
            </div>
          </form>
          {message && (
            <div className={`sm-message ${message.includes('successfully') ? 'ok' : 'err'}`}>{message}</div>
          )}
        </div>
      )}

      <div className="sm-toolbar">
        <strong>Materials</strong>
        <select className="sm-filter" value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)}>
          <option value="All">All Subjects</option>
          {courses.map(c => (
            <option key={c._id} value={c._id}>{c.courseName}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="sm-loading">Loading…</div>
      ) : filtered.length ? (
        <div className="sm-grid">
          {filtered.map((mat) => (
            <div key={mat._id} className="sm-item">
              <div className="sm-item-title">{mat.title}</div>
              {mat.description && <div className="sm-item-desc">{mat.description}</div>}
              <div className="sm-item-meta">Subject: <b>{mat.course?.courseName}</b></div>
              <button onClick={() => openMaterial(mat)} className="download-btn-modern sm-open-btn">Open</button>
            </div>
          ))}
        </div>
      ) : (
        <div className="sm-empty">No study materials found.</div>
      )}
    </div>
  );
}

export default StudyMaterials;