
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { User, UserRole } from '@/types';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // This would normally check with Supabase for an existing session
        const storedUser = localStorage.getItem('emr-user');
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Authentication error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // In a real app with Supabase, we'd do:
      // const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      // if (error) throw error;
      
      // Mock login for demo - would call Supabase in real implementation
      if (email && password) {
        // Mock user data
        const mockUser: User = {
          id: '1',
          email,
          name: email.split('@')[0],
          role: 'doctor', // Default to doctor role
          createdAt: new Date().toISOString(),
        };
        
        setCurrentUser(mockUser);
        localStorage.setItem('emr-user', JSON.stringify(mockUser));
        
        toast({
          title: "Login successful",
          description: "Welcome back to the EMR system.",
        });
        
        navigate('/dashboard');
      } else {
        throw new Error("Please provide email and password");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Please check your credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      setLoading(true);
      
      // In a real app with Supabase, we'd do:
      // const { data, error } = await supabase.auth.signUp({ email, password });
      // if (error) throw error;
      // Then store additional user data in a Supabase table
      
      // Mock registration for demo
      if (email && password && name) {
        const mockUser: User = {
          id: Date.now().toString(),
          email,
          name,
          role,
          createdAt: new Date().toISOString(),
        };
        
        setCurrentUser(mockUser);
        localStorage.setItem('emr-user', JSON.stringify(mockUser));
        
        toast({
          title: "Registration successful",
          description: "Your account has been created.",
        });
        
        navigate('/dashboard');
      } else {
        throw new Error("Please provide all required information");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An error occurred during registration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // In a real app with Supabase, we'd do:
      // const { error } = await supabase.auth.signOut();
      // if (error) throw error;
      
      // Mock logout
      setCurrentUser(null);
      localStorage.removeItem('emr-user');
      navigate('/');
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "An error occurred during logout",
        variant: "destructive",
      });
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
