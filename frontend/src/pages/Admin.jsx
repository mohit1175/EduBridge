import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../utils/api';

function Admin() {
  const { isAdmin } = useAuth();
  const [csvText, setCsvText] = useState('email,name,rollNumber,department,semester\n');
  const [commonPassword, setCommonPassword] = useState('changeme123');
  const [staffCsv, setStaffCsv] = useState('email,name,role,department,semester\n');
  const [defaultRole, setDefaultRole] = useState('teacher_level2');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState(null);
  const [hodFile, setHodFile] = useState(null);
  const [enrollFile, setEnrollFile] = useState(null);
  // Simplified page: metrics removed
  const [coursesCsv, setCoursesCsv] = useState('program,department,semester,subject,courseCode,credits,description\n');
  const [coursesFile, setCoursesFile] = useState(null);
  const [teachersFile, setTeachersFile] = useState(null);
  const [studentsFile, setStudentsFile] = useState(null);
  const [usersFile, setUsersFile] = useState(null);

  // Metrics fetching removed for a cleaner Admin page

  // Removed class PDF upload action

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

  const handleBulkCreateUpload = async () => {
    if (!studentsFile) return;
    try {
      setBusy(true);
      // Reuse uploadFile which sends Multipart FormData
      const data = await apiClient.uploadFile('/admin/students/bulk/upload', studentsFile, { commonPassword });
      setMessage(`Created ${data.createdCount}, Skipped ${data.skipped.length}`);
    } catch (e) {
      setMessage(e.message || 'Bulk students upload failed');
    } finally {
      setBusy(false);
    }
  };

  const handleBulkUsersCreate = async () => {
    try {
      setBusy(true);
      const res = await apiClient.post('/admin/users/bulk', { csvText: staffCsv, commonPassword, defaultRole });
      setMessage(`Users created ${res.createdCount}, Skipped ${res.skipped.length}`);
    } catch (e) {
      setMessage(e.message || 'Bulk users create failed');
    } finally {
      setBusy(false);
    }
  };

  const handleBulkUsersCreateUpload = async () => {
    if (!usersFile) return;
    try {
      setBusy(true);
      const data = await apiClient.uploadFile('/admin/users/bulk/upload', usersFile, { commonPassword, defaultRole });
      setMessage(`Users created ${data.createdCount}, Skipped ${data.skipped.length}`);
    } catch (e) {
      setMessage(e.message || 'Bulk users upload failed');
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

  const handleCoursesInitText = async () => {
    try {
      setBusy(true);
      const res = await apiClient.post('/admin/courses/init/text', { csvText: coursesCsv });
      setMessage(`Courses: ${res.results?.filter(r=>r.status==='created').length || 0} created, ${res.results?.filter(r=>r.status==='updated').length || 0} updated`);
    } catch (e) {
      setMessage(e.message || 'Courses init failed');
    } finally {
      setBusy(false);
    }
  };

  const handleCoursesInitUpload = async () => {
    if (!coursesFile) return;
    try {
      setBusy(true);
      const res = await apiClient.uploadFile('/admin/courses/init/upload', coursesFile);
      const created = res.results?.filter(r=>r.status==='created').length || 0;
      const updated = res.results?.filter(r=>r.status==='updated').length || 0;
      setMessage(`Courses: ${created} created, ${updated} updated`);
    } catch (e) {
      setMessage(e.message || 'Courses init upload failed');
    } finally {
      setBusy(false);
    }
  };

  const handleTeachersAssignUpload = async () => {
    if (!teachersFile) return;
    try {
      setBusy(true);
      const res = await apiClient.uploadFile('/admin/courses/teachers/upload', teachersFile);
      const ok = res.results?.filter(r=>r.status==='assigned').length || 0;
      const skip = res.results?.length ? res.results.length - ok : 0;
      setMessage(`Teacher assignments: ${ok} assigned, ${skip} skipped`);
    } catch (e) {
      setMessage(e.message || 'Teacher assignments failed');
    } finally {
      setBusy(false);
    }
  };

  if (!isAdmin) return <div>Access denied</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ color: '#2563eb', marginBottom: 12 }}>Admin Tools</h2>
  {/* Metrics removed for minimal Admin tools */}

  <div style={{ display: 'grid', gap: 20, gridTemplateColumns: '1fr 1fr' }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ marginTop: 0, color: '#2563eb' }}>Initialize Courses</h3>
          <div style={{ marginBottom: 6 }}>
            <small>Columns: program, department, semester, subject, courseCode(optional), credits(optional), description(optional)</small>
            <span style={{ margin: '0 8px', color: '#94a3b8' }}>•</span>
            <a href="/csv_templates/courses_init.csv" download>Download CSV</a>
          </div>
          <textarea rows={8} value={coursesCsv} onChange={(e)=>setCoursesCsv(e.target.value)} style={{ width:'100%', display:'block' }} />
          <div style={{ display:'flex', gap:8, marginTop:10, alignItems:'center', flexWrap:'wrap' }}>
            <button className="login-btn" onClick={handleCoursesInitText} disabled={busy}>{busy ? 'Processing...' : 'Create/Update from Text'}</button>
            <input type="file" accept=".csv,.xlsx,.xls" onChange={(e)=>setCoursesFile(e.target.files?.[0]||null)} />
            <button className="login-btn" onClick={handleCoursesInitUpload} disabled={busy || !coursesFile}>{busy ? 'Processing...' : 'Upload File'}</button>
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ marginTop: 0, color: '#2563eb' }}>Assign Teachers to Courses</h3>
          <div style={{ marginBottom: 6 }}>
            <small>Columns: courseCode|courseName, teacherEmail|teacherName</small>
          </div>
          <input type="file" accept=".csv,.xlsx,.xls" onChange={(e)=>setTeachersFile(e.target.files?.[0]||null)} />
          <div style={{ marginTop: 10 }}>
            <button className="login-btn" onClick={handleTeachersAssignUpload} disabled={busy || !teachersFile}>{busy ? 'Processing...' : 'Upload'}</button>
          </div>
        </div>
  {/* Removed Upload Class PDF panel to keep Admin tools focused */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ marginTop: 0, color: '#2563eb' }}>Bulk Create Students</h3>
          <label>Common password:&nbsp;</label>
          <input value={commonPassword} onChange={(e) => setCommonPassword(e.target.value)} />
          <textarea rows={10} value={csvText} onChange={(e) => setCsvText(e.target.value)} style={{ width: '100%', display: 'block', marginTop: 8 }} />
          <div style={{ marginTop: 10 }}>
            <button className="login-btn" onClick={handleBulkCreate} disabled={busy}>{busy ? 'Creating...' : 'Create'}</button>
          </div>
          <div style={{ marginTop: 8 }}>
            <button
              type="button"
              className="login-btn"
              onClick={() => setCsvText('email,name,rollNumber,department,semester\nstudent1@college.com,Student One,STU101,Computer Science,5')}
            >
              Use sample template
            </button>
            <span style={{ margin: '0 8px', color: '#94a3b8' }}>or</span>
            <a href="/csv_templates/bulk_students.csv" download>Download CSV</a>
          </div>
          <div style={{ marginTop: 10, display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
            <input type="file" accept=".csv,.xlsx,.xls" onChange={(e)=>setStudentsFile(e.target.files?.[0]||null)} />
            <button className="login-btn" onClick={handleBulkCreateUpload} disabled={busy || !studentsFile}>{busy ? 'Uploading...' : 'Upload CSV'}</button>
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ marginTop: 0, color: '#2563eb' }}>Bulk Create Staff/Users</h3>
          <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
            <label>Common password:&nbsp;</label>
            <input value={commonPassword} onChange={(e) => setCommonPassword(e.target.value)} />
            <label>Default role:&nbsp;</label>
            <select value={defaultRole} onChange={(e)=>setDefaultRole(e.target.value)}>
              <option value="teacher_level2">Teacher</option>
              <option value="teacher_level1">HOD</option>
              <option value="admin">Admin</option>
              <option value="student">Student</option>
            </select>
          </div>
          <textarea rows={10} value={staffCsv} onChange={(e) => setStaffCsv(e.target.value)} style={{ width: '100%', display: 'block', marginTop: 8 }} />
          <div style={{ marginTop: 10 }}>
            <button className="login-btn" onClick={handleBulkUsersCreate} disabled={busy}>{busy ? 'Creating...' : 'Create'}</button>
          </div>
          <div style={{ marginTop: 8 }}>
            <button
              type="button"
              className="login-btn"
              onClick={() => setStaffCsv('email,name,role,department,semester\nhod1@college.com,HOD One,teacher_level1,Computer Science,\nteacher1@college.com,Teacher One,teacher_level2,Computer Science,\nadmin1@college.com,Admin One,admin,,')}
            >
              Use sample template
            </button>
            <span style={{ margin: '0 8px', color: '#94a3b8' }}>or</span>
            <a href="/csv_templates/bulk_users.csv" download>Download CSV</a>
          </div>
          <div style={{ marginTop: 10, display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
            <input type="file" accept=".csv,.xlsx,.xls" onChange={(e)=>setUsersFile(e.target.files?.[0]||null)} />
            <button className="login-btn" onClick={handleBulkUsersCreateUpload} disabled={busy || !usersFile}>{busy ? 'Uploading...' : 'Upload CSV'}</button>
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ marginTop: 0, color: '#2563eb' }}>Assign HODs to Courses</h3>
          <input type="file" accept=".csv,.xlsx,.xls" onChange={(e) => setHodFile(e.target.files?.[0] || null)} />
          <div style={{ marginTop: 8 }}>
            <small>Columns: courseCode|courseName, hodEmail|hodName</small>
            <span style={{ margin: '0 8px', color: '#94a3b8' }}>•</span>
            <a href="/csv_templates/hod_assignments.csv" download>Download CSV</a>
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
            <span style={{ margin: '0 8px', color: '#94a3b8' }}>•</span>
            <a href="/csv_templates/course_enrollments.csv" download>Download CSV</a>
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


