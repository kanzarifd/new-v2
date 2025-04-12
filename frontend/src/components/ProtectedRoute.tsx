import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: 'admin' | 'user' | 'agent';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If no role is specified, allow access
  if (!role) {
    return <>{children}</>;
  }

  // If role is specified but user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Determine the appropriate dashboard based on role
  const getDashboardPath = (userRole: string) => {
    switch (userRole) {
      case 'admin':
        return '/admin';
      case 'agent':
        return '/agent';
      case 'user':
        return '/user';
      default:
        return '/';
    }
  };

  // If user's role doesn't match the required role
  if (user.role !== role) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;