import React, { useEffect, useState } from 'react';
import api from '../../api/client';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/users').then(({ data }) => setUsers(data)).catch(err => setError(err?.response?.data?.message || 'Failed to load users'));
  }, []);

  return (
    <div>
      <h2>Manage Users</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}