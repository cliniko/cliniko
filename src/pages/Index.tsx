
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  
  useEffect(() => {
    // Wait until authentication check is complete
    if (!loading) {
      // Redirect to dashboard if authenticated, otherwise to login
      if (isAuthenticated) {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    }
  }, [navigate, isAuthenticated, loading]);
  
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
