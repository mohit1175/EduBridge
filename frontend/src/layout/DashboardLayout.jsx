import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function DashboardLayout({ role, items }) {
  return (
    <div className={`dashboard-layout role-${role}`} style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar items={items} role={role} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ padding: 16, flex: 1 }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}