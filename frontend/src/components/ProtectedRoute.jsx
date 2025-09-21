import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const { exp } = jwtDecode(token);
    if (Date.now() >= exp * 1000) {
      return true;
    }
    return false;
  } catch (e) {
    return true;
  }
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');

  if (!token || isTokenExpired(token)) {
    // If token is missing or expired, clear local storage and redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    return <Navigate to="/login" />;
  }

  try {
    const decodedToken = jwtDecode(token);
    const userRole = decodedToken.role;
    
    if (allowedRoles && !allowedRoles.includes(userRole)) {
      // If user has a valid token but not the required role, redirect to the dashboard
      return <Navigate to="/dashboard" />;
    }
  } catch (error) {
    console.error('Error decoding token:', error);
    localStorage.removeItem('token');
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
