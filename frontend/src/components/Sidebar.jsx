import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/Sidebar.css';

export default function Sidebar({ items = [], role }) {
  const roleClass = role === 'student' ? 'sidebar-student' : role === 'teacher' ? 'sidebar-teacher' : role === 'hod' ? 'sidebar-hod' : role === 'admin' ? 'sidebar-admin' : '';
  return (
    <aside className={`sidebar ${roleClass}`}>
      <div className="sidebar-title">Menu</div>
      <nav className="sidebar-nav">
        {items.map((item) => (
          <NavLink key={item.path} to={item.path} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}