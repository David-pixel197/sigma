import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function PrivateRoute({ children }) {
  const { isLoggedIn } = useAuth(); 

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  return children;
}