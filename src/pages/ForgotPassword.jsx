// src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import '../styles/ForgotPassword.css';
import { Link } from 'react-router-dom';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true); // mock submission
  };

  return (
    <div className="forgot-page">
      <div className="forgot-card">
        <h2>🔒 Forgot Password</h2>
        {!submitted ? (
          <form onSubmit={handleSubmit}>
            <p>Enter your email to receive reset instructions.</p>
            <input
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">Send Reset Link</button>
          </form>
        ) : (
          <p className="success-message">
            ✅ If an account exists, a reset link has been sent to <strong>{email}</strong>.
          </p>
        )}
        <Link to="/" className="back-link">← Back to Login</Link>
      </div>
    </div>
  );
}

export default ForgotPassword;
