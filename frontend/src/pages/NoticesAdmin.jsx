import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import '../styles/AdminPages.css';

function NoticesAdmin() {
  const { isAdmin } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [form, setForm] = useState({ title: '', description: '', visibleTo: 'all', expiresAt: '' });
  const [files, setFiles] = useState([]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notices/admin?limit=20');
      setList(res.notices || []);
      setErr('');
    } catch (e) {
      setErr('Failed to load notices');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const createNotice = async () => {
    if (!form.title.trim()) return;
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('visibleTo', form.visibleTo);
      if (form.expiresAt) fd.append('expiresAt', form.expiresAt);
      Array.from(files || []).forEach(f => fd.append('files', f));
  await api.postFormData('/notices', fd);
      setForm({ title: '', description: '', visibleTo: 'all', expiresAt: '' });
      setFiles([]);
      await load();
    } catch (_) {
      setErr('Failed to create notice');
    }
  };

  const deleteNotice = async (id) => {
    if (!window.confirm('Delete this notice?')) return;
    try {
  await api.delete(`/notices/${id}`);
      await load();
    } catch (_) { setErr('Failed to delete notice'); }
  };

  if (!isAdmin) return <div>Unauthorized</div>;

  return (
    <div className="admin-page">
      <h2 className="admin-title">Admin Notices</h2>
      <div className="admin-grid-2">
        <div className="admin-card">
          <h3>Create Notice</h3>
          <div className="form-group">
            <label>Title</label>
            <input className="form-control" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea className="form-control" rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Visible To</label>
            <select className="form-control" value={form.visibleTo} onChange={e => setForm({ ...form, visibleTo: e.target.value })}>
              <option value="all">All</option>
              <option value="student">Student</option>
              <option value="teacher_level2">Teacher</option>
              <option value="teacher_level1">HOD</option>
            </select>
          </div>
          <div className="form-group">
            <label>Expires At</label>
            <input className="form-control" type="date" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Attachments</label>
            <input className="form-control" type="file" multiple onChange={e => setFiles(e.target.files)} />
          </div>
          <div className="admin-actions">
            <button className="login-btn" onClick={createNotice}>Publish</button>
          </div>
        </div>
        <div className="admin-card">
          <h3>Recent Notices</h3>
          {loading ? <div>Loading…</div> : err ? <div style={{ color: 'red' }}>{err}</div> : (
            <div className="notice-list">
              {list.map(n => (
                <div key={n._id} className="notice-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="notice-item-title">{n.title}</div>
                    <div className="notice-item-actions">
                      <button className="login-btn btn-danger" onClick={() => deleteNotice(n._id)}>Delete</button>
                    </div>
                  </div>
                  <div className="muted">{n.description}</div>
                  <div className="notice-item-meta">Visible to: {Array.isArray(n.visibleTo) ? n.visibleTo.join(', ') : (n.visibleTo || 'all')}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NoticesAdmin;
