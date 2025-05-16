
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading, currentUser } = useAuth();
  
  useEffect(() => {
    // Only redirect when auth state is confirmed (not loading)
    if (!loading) {
      if (isAuthenticated && currentUser) {
        // Redirect based on user role
        switch (currentUser.role) {
          case 'admin':
            navigate('/users', { replace: true });
            break;
          case 'doctor':
            navigate('/consults', { replace: true });
            break;
          case 'nurse':
            navigate('/dashboard', { replace: true });
            break;
          case 'staff':
            navigate('/patients', { replace: true });
            break;
          default:
            navigate('/dashboard', { replace: true });
        }
      } else if (!isAuthenticated) {
        // Only redirect to login if actually not authenticated
        navigate('/', { replace: true });
      }
    }
  }, [navigate, isAuthenticated, loading, currentUser]);
  
  // Show optimized loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-64">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-8 w-1/2 mx-auto" />
        </div>
      </div>
    );
  }
  
  return null;
};

export default Index;
