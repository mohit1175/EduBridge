import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import '../styles/AdminPages.css';

function AdminLogs() {
  const { isAdmin } = useAuth();
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const load = async (p = 1) => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/logs?page=${p}&limit=10`);
      setLogs(res.logs || []);
      setPage(res.page || p);
      setPages(res.pages || 1);
      setErr('');
    } catch (e) {
      setErr('Failed to load logs');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(1); }, []);

  const del = async (id) => {
    if (!window.confirm('Delete this log?')) return;
    try { await api.del(`/admin/logs/${id}`); await load(page); } catch (_) {}
  };

  if (!isAdmin) return <div>Unauthorized</div>;

  return (
    <div className="admin-page">
      <h2 className="admin-title">Admin Logs</h2>
      {loading ? <div>Loading…</div> : err ? <div style={{ color: 'red' }}>{err}</div> : (
        <>
          <div className="table-wrap">
            <table className="table-admin">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Action</th>
                  <th>Status</th>
                  <th>Actor</th>
                  <th>Counts</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l._id}>
                    <td>{new Date(l.createdAt).toLocaleString()}</td>
                    <td>{l.action}</td>
                    <td>
                      <span className={`badge ${l.status==='success' ? 'badge-green' : 'badge-yellow'}`}>{l.status}</span>
                    </td>
                    <td>{l.actorEmail}</td>
                    <td>{Object.entries(l.counts || {}).filter(([,v]) => v).map(([k,v]) => `${k}:${v}`).join(', ')}</td>
                    <td><button className="login-btn btn-danger" onClick={() => del(l._id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="login-btn" disabled={page<=1} onClick={() => load(page-1)}>Prev</button>
            <span>Page {page} of {pages}</span>
            <button className="login-btn" disabled={page>=pages} onClick={() => load(page+1)}>Next</button>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminLogs;
