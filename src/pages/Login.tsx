import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { Loader2, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [isResetOpen, setIsResetOpen] = useState(false);
  const { login, resetPassword, isAuthenticated, loading, currentUser } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      await login(email, password);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetEmail) {
      await resetPassword(resetEmail);
      setIsResetOpen(false);
    } else {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
    }
  };

  // If authenticated, redirect based on user role
  if (isAuthenticated && currentUser) {
    switch (currentUser.role) {
      case 'admin':
        return <Navigate to="/users" />;
      case 'doctor':
        return <Navigate to="/consults" />;
      case 'nurse':
        return <Navigate to="/vitals" />;
      case 'staff':
        return <Navigate to="/patients" />;
      default:
        return <Navigate to="/dashboard" />;
    }
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-background p-3 sm:p-4 md:p-6">
      <div className="w-full max-w-[340px] sm:max-w-[380px] md:max-w-md space-y-4 sm:space-y-6">
        <div className="flex items-center justify-center">
          <div className="size-12 sm:size-14 md:size-16 bg-primary/90 rounded-md flex items-center justify-center text-white mb-2 sm:mb-4">
            <User className="size-6 sm:size-7 md:size-8" />
          </div>
        </div>
        
        <Card className="border shadow-lg">
          <CardHeader className="space-y-1 px-4 sm:px-6 py-4 sm:py-5">
            <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold text-center">Sign in to your account</CardTitle>
            <CardDescription className="text-center text-xs sm:text-sm">Enter your credentials to continue</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
              <div className="space-y-1 sm:space-y-1.5">
                <Label htmlFor="email" className="text-xs sm:text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-8 sm:h-9 text-xs sm:text-sm"
                  required
                />
              </div>
              <div className="space-y-1 sm:space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs sm:text-sm">Password</Label>
                  <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="link" 
                        className="h-auto p-0 text-[10px] sm:text-xs"
                      >
                        Forgot password?
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Reset your password</DialogTitle>
                        <DialogDescription>
                          Enter your email address and we'll send you a link to reset your password.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleResetPassword} className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="reset-email">Email</Label>
                          <Input
                            id="reset-email"
                            type="email"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full"
                            required
                          />
                        </div>
                        <DialogFooter className="pt-4">
                          <Button 
                            type="submit" 
                            className="w-full"
                            disabled={loading}
                          >
                            {loading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              "Send Reset Link"
                            )}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-8 sm:h-9 text-xs sm:text-sm"
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3 sm:space-y-4 px-4 sm:px-6 pb-5 sm:pb-6">
              <Button 
                type="submit" 
                className="w-full h-9 sm:h-10 text-xs sm:text-sm" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-1.5 sm:mr-2 size-3.5 sm:size-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
              <p className="text-center text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary font-medium hover:underline">
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
