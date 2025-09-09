import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../utils/api';

function Admin() {
  const { isAdmin } = useAuth();
  const [csvText, setCsvText] = useState('email,name,rollNumber,department,semester\n');
  const [commonPassword, setCommonPassword] = useState('changeme123');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState(null);
  const [hodFile, setHodFile] = useState(null);
  const [enrollFile, setEnrollFile] = useState(null);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiClient.get('/admin/metrics/overview');
        setMetrics(data);
      } catch (_) {}
    };
    load();
  }, []);

  const handleUploadPdf = async () => {
    if (!file) return;
    try {
      setBusy(true);
      const res = await apiClient.uploadFile('/admin/upload/pdf', file);
      setMessage(`Uploaded: ${res.filePath}`);
    } catch (e) {
      setMessage(e.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  const handleBulkCreate = async () => {
    try {
      setBusy(true);
      const res = await apiClient.post('/admin/students/bulk', { csvText, commonPassword });
      setMessage(`Created ${res.createdCount}, Skipped ${res.skipped.length}`);
    } catch (e) {
      setMessage(e.message || 'Bulk create failed');
    } finally {
      setBusy(false);
    }
  };

  const handleHodAssign = async () => {
    if (!hodFile) return;
    try {
      setBusy(true);
      const res = await apiClient.uploadFile('/admin/courses/hod/upload', hodFile);
      setMessage(`HOD assigned: ${res.results?.filter(r=>r.status==='assigned').length || 0}, Skipped: ${res.results?.filter(r=>r.status!=='assigned').length || 0}`);
    } catch (e) {
      setMessage(e.message || 'HOD assign failed');
    } finally {
      setBusy(false);
    }
  };

  const handleEnrollments = async () => {
    if (!enrollFile) return;
    try {
      setBusy(true);
      const res = await apiClient.uploadFile('/admin/enrollments/upload', enrollFile);
      const ok = res.results?.filter(r=>r.status==='enrolled').length || 0;
      const skip = res.results?.length ? res.results.length - ok : 0;
      setMessage(`Enrollments: ${ok} enrolled, ${skip} skipped`);
    } catch (e) {
      setMessage(e.message || 'Enrollments failed');
    } finally {
      setBusy(false);
    }
  };

  if (!isAdmin) return <div>Access denied</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ color: '#2563eb', marginBottom: 12 }}>Admin Tools</h2>
      {metrics && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16,
          marginBottom: 20
        }}>
          <div className="stat-card blue">Students<strong>{metrics.totals.students}</strong></div>
          <div className="stat-card blue">Teachers<strong>{metrics.totals.teachers}</strong></div>
          <div className="stat-card blue">Courses<strong>{metrics.totals.courses}</strong></div>
          <div className="stat-card blue">Attendance<strong>{metrics.attendanceRate}%</strong></div>
        </div>
      )}

      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: '1fr 1fr' }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ marginTop: 0, color: '#2563eb' }}>Upload Class PDF</h3>
          <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0])} />
          <div style={{ marginTop: 10 }}>
            <button className="login-btn" onClick={handleUploadPdf} disabled={busy}>{busy ? 'Uploading...' : 'Upload'}</button>
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ marginTop: 0, color: '#2563eb' }}>Bulk Create Students</h3>
          <label>Common password:&nbsp;</label>
          <input value={commonPassword} onChange={(e) => setCommonPassword(e.target.value)} />
          <textarea rows={10} value={csvText} onChange={(e) => setCsvText(e.target.value)} style={{ width: '100%', display: 'block', marginTop: 8 }} />
          <div style={{ marginTop: 10 }}>
            <button className="login-btn" onClick={handleBulkCreate} disabled={busy}>{busy ? 'Creating...' : 'Create'}</button>
          </div>
          <div style={{ marginTop: 8 }}>
            <a href="#" onClick={(e) => { e.preventDefault(); setCsvText('email,name,rollNumber,department,semester\nstudent1@college.com,Student One,STU101,Computer Science,5'); }}>Use sample template</a>
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ marginTop: 0, color: '#2563eb' }}>Assign HODs to Courses</h3>
          <input type="file" accept=".csv,.xlsx,.xls" onChange={(e) => setHodFile(e.target.files?.[0] || null)} />
          <div style={{ marginTop: 8 }}>
            <small>Columns: courseCode|courseName, hodEmail|hodName</small>
          </div>
          <div style={{ marginTop: 10 }}>
            <button className="login-btn" onClick={handleHodAssign} disabled={busy || !hodFile}>{busy ? 'Processing...' : 'Upload'}</button>
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ marginTop: 0, color: '#2563eb' }}>Enroll Students to Courses</h3>
          <input type="file" accept=".csv,.xlsx,.xls" onChange={(e) => setEnrollFile(e.target.files?.[0] || null)} />
          <div style={{ marginTop: 8 }}>
            <small>Columns: student(email|roll|name), courseCode|courseName</small>
          </div>
          <div style={{ marginTop: 10 }}>
            <button className="login-btn" onClick={handleEnrollments} disabled={busy || !enrollFile}>{busy ? 'Processing...' : 'Upload'}</button>
          </div>
        </div>
      </div>
      {message && <div style={{ marginTop: 16, color: '#2563eb' }}>{message}</div>}
    </div>
  );
}

export default Admin;


