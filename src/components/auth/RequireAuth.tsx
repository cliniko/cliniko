
import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface RequireAuthProps {
  children: JSX.Element;
  allowedRoles?: Array<'admin' | 'doctor' | 'nurse' | 'staff'>;
}

export default function RequireAuth({ children, allowedRoles }: RequireAuthProps) {
  const { currentUser, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-medical-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check if user has required role (if roles are specified)
  if (allowedRoles && currentUser && !allowedRoles.includes(currentUser.role)) {
    // User is authenticated but doesn't have the required role
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  return children;
}
