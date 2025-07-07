// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import users from '../data/users.json';
import '../styles/Login.css';

function Login() {
  // For demo: show user dropdown
  const [selectedUserIdx, setSelectedUserIdx] = useState('');
  const [formData, setFormData] = useState({
    role: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Demo: map email to name
  const emailToName = {
    'a@a.com': 'Alice',
    'b@b.com': 'Bob',
    'c@c.com': 'Mohit'
  };

  // When user selects from dropdown, auto-fill form
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
    // Authenticate using users.json
    const user = users.find(
      u => u.email === formData.email && u.password === formData.password && u.role === formData.role
    );
    if (!user) {
      setError('Invalid credentials or role.');
      return;
    }
    // Save user info to localStorage
    localStorage.setItem('userRole', user.role);
    const name = emailToName[user.email] || user.email.split('@')[0];
    localStorage.setItem('username', name);
    navigate('/home/dashboard');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>📘 Welcome to EduBridge</h2>
        {/* Demo user dropdown */}
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
          {/* Hide manual role selection for demo */}
          {/* <select name="role" value={formData.role} onChange={handleChange} required>
            <option value="">Select Role</option>
            <option value="student">Student</option>
            <option value="teacher_level1">Teacher HOD</option>
            <option value="teacher_level2">Teacher</option>
          </select> */}

          <div className="input-group">
            <span>📧</span>
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
            <span>🔒</span>
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

          {error && <div style={{ color: '#ef4444', marginBottom: 8 }}>{error}</div>}

          <div className="extras">
            <label>
              <input type="checkbox" /> Remember Me
            </label>
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>

          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
