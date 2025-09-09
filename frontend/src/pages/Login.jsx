import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Login.css';

// Demo users for quick testing (matches seeded accounts)
const demoUsers = [
  { email: 'ashish.gavande@teacher.com', password: 'password123', role: 'teacher_level1', name: 'ashish gavande' },
  { email: 'jayashree.ravee@teacher.com', password: 'password123', role: 'teacher_level2', name: 'jayashree ravee' },
  { email: 'omkar.mohite@teacher.com', password: 'password123', role: 'teacher_level2', name: 'omkar mohite' },
  { email: 'amol.jogalekar@teacher.com', password: 'password123', role: 'teacher_level2', name: 'amol jogalekar' },
  { email: 'neelam.jain@teacher.com', password: 'password123', role: 'teacher_level2', name: 'neelam jain' },
  { email: 'mohit@student.com', password: 'password123', role: 'student', name: 'Mohit' },
  { email: 'yashvi@student.com', password: 'password123', role: 'student', name: 'Yashvi' },
  { email: 'neha@student.com', password: 'password123', role: 'student', name: 'Neha' },
  { email: 'sahaj@student.com', password: 'password123', role: 'student', name: 'Sahaj' },
  { email: 'pratham@student.com', password: 'password123', role: 'student', name: 'Pratham' },
  { email: 'admin@college.com', password: 'password123', role: 'admin', name: 'Super Admin' },
];

function Login() {
  const [selectedUserIdx, setSelectedUserIdx] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleUserSelect = (e) => {
    const idx = e.target.value;
    setSelectedUserIdx(idx);
    if (idx !== '') {
      const user = demoUsers[idx];
      setFormData({
        email: user.email,
        password: user.password
      });
    } else {
      setFormData({ email: '', password: '' });
    }
    setError('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      navigate('/home/dashboard');
    } catch (error) {
      setError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = ({ open }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {open ? (
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Zm11 4a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="#64748b" strokeWidth="1.5"/>
      ) : (
        <>
          <path d="M3 3l18 18" stroke="#64748b" strokeWidth="1.5"/>
          <path d="M10.58 6.08C11.04 6.03 11.51 6 12 6c7 0 11 6 11 6a16.5 16.5 0 0 1-4.11 4.49" stroke="#64748b" strokeWidth="1.5" fill="none"/>
          <path d="M6.4 7.55A16.6 16.6 0 0 0 1 12s4 7 11 7c1.27 0 2.46-.2 3.57-.55" stroke="#64748b" strokeWidth="1.5" fill="none"/>
        </>
      )}
    </svg>
  );

  const [changeEmail, setChangeEmail] = useState('');
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [changing, setChanging] = useState(false);
  const [changeMsg, setChangeMsg] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChanging(true);
    setChangeMsg('');
    try {
      // call API
      const res = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:4000/api') + '/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: changeEmail, oldPassword: oldPass, newPassword: newPass })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to change password');
      setChangeMsg('Password updated successfully. You can now log in with the new password.');
      setChangeEmail(''); setOldPass(''); setNewPass('');
    } catch (err) {
      setChangeMsg(err.message);
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Welcome to EduBridge</h2>
        <div className="demo-select-wrap">
          <label htmlFor="user-select"><strong>Demo Users:</strong>&nbsp;</label>
          <select id="user-select" className="demo-select" value={selectedUserIdx} onChange={handleUserSelect}>
            <option value="">Select user</option>
            {demoUsers.map((u, i) => (
              <option key={u.email} value={i}>
                {u.role.replace('teacher_level1','HOD').replace('teacher_level2','Teacher').replace('student','Student')} - {u.email}
              </option>
            ))}
          </select>
        </div>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="username"
            />
          </div>
          <div className="input-group">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
            <button type="button" className="toggle-pass" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
              <EyeIcon open={showPassword} />
            </button>
          </div>
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          {error && <div className="login-error">{error}</div>}
        </form>

        <div className="divider" role="separator" aria-label="Change password" />

        <form className="change-pass" onSubmit={handleChangePassword}>
          <h3>Change password</h3>
          <div className="input-group">
            <input type="email" placeholder="Account email" value={changeEmail} onChange={(e)=>setChangeEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            <input type="password" placeholder="Current password" value={oldPass} onChange={(e)=>setOldPass(e.target.value)} required />
          </div>
          <div className="input-group">
            <input type="password" placeholder="New password (min 6)" value={newPass} onChange={(e)=>setNewPass(e.target.value)} required />
          </div>
          <button type="submit" disabled={changing}>{changing ? 'Updating...' : 'Update Password'}</button>
          {changeMsg && <div className="login-error" style={{ marginTop: 8 }}>{changeMsg}</div>}
        </form>
      </div>
    </div>
  );
}

export default Login;
