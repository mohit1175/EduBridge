import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import users from '../data/users.json';
import '../styles/Login.css';

function Login() {
  const [selectedUserIdx, setSelectedUserIdx] = useState('');
  const [formData, setFormData] = useState({
    role: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const emailToName = {
    'a@a.com': 'Alice',
    'b@b.com': 'Bob',
    'c@c.com': 'Mohit',
    'ram@a.com': 'ram',
    'shyam@a.com': 'shyam',
    'krishna@a.com': 'krishna'
  };

  const handleUserSelect = (e) => {
    const idx = e.target.value;
    setSelectedUserIdx(idx);
    if (idx !== '') {
      const user = users[idx];
      setFormData({
        role: user.role,
        email: user.email,
        password: user.password
      });
    } else {
      setFormData({ role: '', email: '', password: '' });
    }
    setError('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const user = users.find(
      u => u.email === formData.email && u.password === formData.password && u.role === formData.role
    );
    if (!user) {
      setError('Invalid credentials or role.');
      return;
    }
    localStorage.setItem('userRole', user.role);
    const name = emailToName[user.email] || user.email.split('@')[0];
    localStorage.setItem('username', name);
    navigate('/home/dashboard');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Welcome to EduBridge</h2>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="user-select"><strong>Demo Users:</strong>&nbsp;</label>
          <select id="user-select" value={selectedUserIdx} onChange={handleUserSelect} style={{ padding: 6, borderRadius: 6 }}>
            <option value="">Select User</option>
            {users.map((u, i) => (
              <option key={u.email} value={i}>{u.role.replace('teacher_level1','HOD').replace('teacher_level2','Teacher').replace('student','Student')} - {u.email}</option>
            ))}
          </select>
        </div>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <span></span>
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
            <span></span>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="login-btn">Login</button>
          {error && <div className="login-error">{error}</div>}
        </form>
      </div>
    </div>
  );
}

export default Login;
