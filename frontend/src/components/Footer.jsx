import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Footer.css';

function Footer() {
  const { user } = useAuth();
  const role = user?.role;
  const roleClass =
    role === 'student' ? 'footer-student' :
    role === 'teacher_level2' ? 'footer-teacher' :
    role === 'teacher_level1' ? 'footer-hod' :
    role === 'admin' ? 'footer-admin' : '';

  return (
    <footer className={`footer ${roleClass}`}>
      <div className="footer-inner">
        <div className="footer-row">
          <span>© 2025 EduBridge.</span>
          <span> All rights reserved.</span>

        </div>

  {null}

        <div className="footer-row">
          <strong className="label">Need help?</strong>
          <span>Contact us:</span>
          <a href="mailto:support@edubridge.com" className="footer-link">support@edubridge.com</a>
          <span className="sep">|</span>
          <a href="tel:+910000000000" className="footer-link">+91-9167522405</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
