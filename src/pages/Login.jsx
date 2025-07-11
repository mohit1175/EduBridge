import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import staticUsers from '../data/users.json'; // Fallback for offline mode
import '../styles/Login.css';

function Login() {
  const [selectedUserIdx, setSelectedUserIdx] = useState('');
  const [formData, setFormData] = useState({
    role: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [useBackend, setUseBackend] = useState(true);
  const navigate = useNavigate();

  const emailToName = {
    'a@a.com': 'Alice',
    'b@b.com': 'Bob',
    'c@c.com': 'Mohit',
    'ram@a.com': 'ram',
    'shyam@a.com': 'shyam',
    'krishna@a.com': 'krishna'
  };

  // Load users from backend or fallback to static data
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const backendUsers = await authService.getUsers();
        setUsers(backendUsers.map(user => ({
          email: user.email,
          role: user.role,
          name: user.name,
          // For demo purposes, use simple passwords
          password: user.email === 'a@a.com' ? 'a' :
                    user.email === 'b@b.com' ? 'b' :
                    user.email === 'c@c.com' ? 'c' :
                    user.name ? `${user.name}123` : 'demo123'
        })));
        setUseBackend(true);
      } catch (error) {
        console.warn('Backend not available, using static data:', error.message);
        setUsers(staticUsers); // Use imported static data
        setUseBackend(false);
      }
    };

    loadUsers();
  }, []);

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (useBackend) {
        // Use backend API
        const response = await authService.login(formData.email, formData.password, formData.role);
        
        // Store authentication data
        localStorage.setItem('userRole', response.user.role);
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userId', response.user.id);
        
        const name = response.user.name || emailToName[response.user.email] || response.user.email.split('@')[0];
        localStorage.setItem('username', name);
        
        navigate('/home/dashboard');
      } else {
        // Fallback to static authentication
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
      }
    } catch (error) {
      setError(error.message || 'Login failed. Please try again.');
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
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          {error && <div className="login-error">{error}</div>}
          {!useBackend && (
            <div style={{ marginTop: 10, fontSize: 12, color: '#666' }}>
              ⚠️ Running in offline mode (backend not available)
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default Login;
