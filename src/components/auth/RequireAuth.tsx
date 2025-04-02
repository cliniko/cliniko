
import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from "@/components/ui/skeleton";

interface RequireAuthProps {
  children: JSX.Element;
  allowedRoles?: Array<'admin' | 'doctor' | 'nurse' | 'staff'>;
}

export default function RequireAuth({ children, allowedRoles }: RequireAuthProps) {
  const { currentUser, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Preload critical components
    import('@/components/layout/AppLayout');
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-6 p-8 w-full max-w-xl">
          <Skeleton className="h-8 w-3/4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
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
    // Redirect to their role-specific dashboard
    switch (currentUser.role) {
      case 'admin':
        return <Navigate to="/users" replace />;
      case 'doctor':
        return <Navigate to="/consults" replace />;
      case 'nurse':
        return <Navigate to="/vitals" replace />;
      case 'staff':
        return <Navigate to="/patients" replace />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}
