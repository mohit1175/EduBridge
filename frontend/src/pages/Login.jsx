import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Login.css';

// Demo users for quick testing
const demoUsers = [
  { email: 'john@student.com', password: 'password123', role: 'student', name: 'John Doe' },
  { email: 'jane@teacher.com', password: 'password123', role: 'teacher_level2', name: 'Jane Smith' },
  { email: 'admin@hod.com', password: 'password123', role: 'teacher_level1', name: 'Dr. Admin' }
];

function Login() {
  const [selectedUserIdx, setSelectedUserIdx] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
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

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Welcome to EduBridge</h2>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="user-select"><strong>Demo Users:</strong>&nbsp;</label>
          <select id="user-select" value={selectedUserIdx} onChange={handleUserSelect} style={{ padding: 6, borderRadius: 6 }}>
            <option value="">Select User</option>
            {demoUsers.map((u, i) => (
              <option key={u.email} value={i}>
                {u.role.replace('teacher_level1','HOD').replace('teacher_level2','Teacher').replace('student','Student')} - {u.email}
              </option>
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
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          {error && <div className="login-error">{error}</div>}
        </form>
      </div>
    </div>
  );
}

export default Login;
