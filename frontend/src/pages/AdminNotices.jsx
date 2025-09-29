import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export default function AdminNotices() {
  const { isAdmin } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const pageSize = 5;
  const [form, setForm] = useState({ title: '', description: '', visibleTo: 'all', published: true, expiresAt: '' });
  const [files, setFiles] = useState([]);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState('');

  const load = async (p = page) => {
    try {
      setLoading(true);
      const d = await api.getAdminNotices({ page: p, limit: pageSize });
      setList(d.notices || []);
      setPage(d.page || p);
      setPages(d.pages || 1);
  
    } catch (e) {
      console.error('Failed to load notices', e);
      setMessage(e.message || 'Failed to load notices');
    } finally { setLoading(false); }
  };
  useEffect(() => { load(1); }, []);

  const reset = () => { setForm({ title: '', description: '', visibleTo: 'all', published: true, expiresAt: '' }); setFiles([]); setEditing(null); };

  const submit = async () => {
    try {
      setLoading(true);
      if (editing) {
        await api.updateNotice(editing._id, { ...form, files: Array.from(files) });
        setMessage('Notice updated');
      } else {
        await api.createNotice({ ...form, files: Array.from(files) });
        setMessage('Notice created');
      }
      reset();
  await load(page);
    } catch (e) { setMessage(e.message || 'Failed'); } finally { setLoading(false); }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this notice?')) return;
    try { setLoading(true); await api.deleteNotice(id); setMessage('Notice deleted');
      // If deleting last item on a page, shift to previous page when needed
      const nextPage = list.length === 1 && page > 1 ? page - 1 : page;
      await load(nextPage);
    }
    catch (e) { setMessage(e.message || 'Delete failed'); }
    finally { setLoading(false); }
  };

  const startEdit = (n) => {
    setEditing(n);
    const vis = Array.isArray(n.visibleTo) ? (n.visibleTo.includes('all') ? 'all' : (n.visibleTo[0] || 'all')) : (n.visibleTo || 'all');
    setForm({ title: n.title, description: n.description || '', visibleTo: vis, published: !!n.published, expiresAt: n.expiresAt ? n.expiresAt.slice(0,10) : '' });
    setFiles([]);
  };

  if (!isAdmin) return <div>Access denied</div>;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h2 style={{ color:'#2563eb', margin:0 }}>Admin Notices</h2>
        <button className="btn btn-ghost" onClick={load} disabled={loading}>{loading ? 'Loading…' : 'Refresh'}</button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        <div style={{ background:'#fff', padding:20, borderRadius:12, boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ marginTop:0, marginBottom:10 }}>{editing ? 'Edit Notice' : 'Create Notice'}</h3>
          <div className="notice-form-grid">
            <div>
              <label className="notice-label">Title</label>
              <input className="notice-input" placeholder="Enter title" value={form.title} onChange={e=>setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="notice-label">Description</label>
              <textarea className="notice-textarea" placeholder="Write the notice details…" value={form.description} onChange={e=>setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="notice-label">Visible to</label>
              <select className="notice-select" value={form.visibleTo} onChange={e=>setForm({ ...form, visibleTo: e.target.value })}>
                <option value="all">All</option>
                <option value="student">Students</option>
                <option value="teacher_level2">Teachers</option>
                <option value="teacher_level1">HODs</option>
                <option value="admin">Admins</option>
              </select>
            </div>
            <div className="notice-actions">
              <label><input type="checkbox" checked={form.published} onChange={e=>setForm({ ...form, published: e.target.checked })} /> Published</label>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <label className="notice-label" style={{ margin:0 }}>Expires on</label>
                <input className="notice-input" type="date" value={form.expiresAt} onChange={e=>setForm({ ...form, expiresAt: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="notice-label">Attachments</label>
              <input className="notice-input" type="file" multiple onChange={e=>setFiles(e.target.files)} />
            </div>
            <div className="notice-actions notice-actions-right">
              <button className="btn btn-primary" onClick={submit} disabled={loading || !form.title.trim()}>{loading ? 'Saving…' : (editing ? 'Update' : 'Create')}</button>
              {editing && <button className="btn btn-secondary" onClick={reset}>Cancel</button>}
            </div>
          </div>
          {message && <div style={{ color:'#2563eb', marginTop:10 }}>{message}</div>}
        </div>
  <div style={{ background:'#fff', padding:16, borderRadius:12, boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ marginTop:0 }}>All Notices</h3>
          {loading ? <div>Loading…</div> : (
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'#f1f5f9' }}>
                  <th style={{ textAlign:'left', padding:8 }}>Title</th>
                  <th style={{ textAlign:'left', padding:8 }}>Visible To</th>
                  <th style={{ textAlign:'left', padding:8 }}>Published</th>
                  <th style={{ textAlign:'left', padding:8 }}>Created</th>
                  <th style={{ textAlign:'left', padding:8 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map(n => (
                  <tr key={n._id} style={{ borderTop:'1px solid #e2e8f0' }}>
                    <td style={{ padding:8 }}>
                      <div style={{ fontWeight:600 }}>{n.title}</div>
                      {n.description ? <div style={{ color:'#64748b', fontSize:12, maxWidth:420, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{n.description}</div> : null}
                      {n.attachments?.length ? (
                        <div style={{ marginTop:4 }}>
                          {n.attachments.map((a,i)=>{
                            const href = `${api.getOrigin()}${a.url}`;
                            return (<a key={i} href={href} target="_blank" rel="noreferrer" style={{ marginRight:8 }}>{a.filename}</a>);
                          })}
                        </div>
                      ) : null}
                    </td>
                    <td style={{ padding:8 }}>{(n.visibleTo || []).join(', ')}</td>
                    <td style={{ padding:8 }}>{n.published ? 'Yes' : 'No'}</td>
                    <td style={{ padding:8 }}>{new Date(n.createdAt).toLocaleString()}</td>
                    <td style={{ padding:8 }}>
                      <div className="table-actions">
                        <button className="btn btn-secondary btn-sm" onClick={()=>startEdit(n)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={()=>del(n._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!list.length && (
                  <tr><td colSpan={5} style={{ padding:12, color:'#64748b' }}>No notices yet.</td></tr>
                )}
              </tbody>
            </table>
          )}
          {/* Pagination */}
          <div style={{ display:'flex', justifyContent:'center', gap:6, marginTop:12 }}>
            {Array.from({ length: pages }).map((_, idx) => {
              const p = idx + 1;
              const active = p === page;
              return (
                <button
                  key={p}
                  className={`btn ${active ? 'btn-primary' : 'btn-ghost'} btn-sm`}
                  onClick={() => { if (p !== page) { setPage(p); load(p); } }}
                >{p}</button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
