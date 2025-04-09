import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: 'admin' | 'user';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If no role is specified, allow access
  if (!role) {
    return <>{children}</>;
  }

  // If role is specified but user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If user's role doesn't match the required role
  if (user.role !== role) {
    // Redirect to appropriate dashboard based on user's actual role
    return <Navigate to={user.role === 'admin' ? '/admin' : '/user'} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
