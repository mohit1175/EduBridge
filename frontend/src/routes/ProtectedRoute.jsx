import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/" replace />;
  }
  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    // redirect to role home
    return <Navigate to={`/${user.role}`} replace />;
  }
  return children;
}