import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(formData.email, formData.password);
      const rolePath = user.role === 'admin' ? '/admin' : user.role === 'teacher' ? '/teacher' : user.role === 'hod' ? '/hod' : '/student';
      navigate(rolePath);
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Welcome to EduBridge</h2>
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
          <button type="submit" className="login-btn" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
          {error && <div className="login-error">{error}</div>}
        </form>
        <div style={{ marginTop: 12 }}>
          <Link to="/forgot-password">Forgot password?</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
