
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading, currentUser } = useAuth();
  
  useEffect(() => {
    // Wait until authentication check is complete
    if (!loading) {
      if (isAuthenticated && currentUser) {
        // Redirect based on user role
        switch (currentUser.role) {
          case 'admin':
            navigate('/users');
            break;
          case 'doctor':
            navigate('/consults');
            break;
          case 'nurse':
            navigate('/vitals');
            break;
          case 'staff':
            navigate('/patients');
            break;
          default:
            navigate('/dashboard');
        }
      } else {
        navigate('/');
      }
    }
  }, [navigate, isAuthenticated, loading, currentUser]);
  
  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-medical-primary"></div>
      </div>
    );
  }
  
  return null;
};

export default Index;
