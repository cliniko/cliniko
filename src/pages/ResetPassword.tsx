import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if we have access token in the URL (from email link)
    const hash = window.location.hash;
    console.log('Reset password URL hash:', hash);
    
    if (!hash || !hash.includes('access_token')) {
      toast({
        title: "Invalid or expired link",
        description: "Please request a new password reset link",
        variant: "destructive"
      });
      setTimeout(() => navigate('/'), 3000);
    }
  }, [navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setSuccess(true);
      toast({
        title: "Password updated",
        description: "Your password has been reset successfully",
      });

      // Redirect to login after successful reset
      setTimeout(() => navigate('/'), 3000);
      
    } catch (error: any) {
      console.error('Error resetting password:', error);
      setError(error.message || 'Failed to update password');
      toast({
        title: "Failed to reset password",
        description: error.message || 'An error occurred during password reset',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-background p-3 sm:p-4 md:p-6">
      <div className="w-full max-w-[340px] sm:max-w-[380px] md:max-w-md space-y-4 sm:space-y-6">
        <div className="flex items-center justify-center">
          <div className="size-12 sm:size-14 md:size-16 bg-primary/90 rounded-md flex items-center justify-center text-white mb-2 sm:mb-4">
            <KeyRound className="size-6 sm:size-7 md:size-8" />
          </div>
        </div>
        
        <Card className="border shadow-lg">
          <CardHeader className="space-y-1 px-4 sm:px-6 py-4 sm:py-5">
            <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold text-center">
              {success ? "Password Reset Complete" : "Reset Your Password"}
            </CardTitle>
            <CardDescription className="text-center text-xs sm:text-sm">
              {success 
                ? "Your password has been updated successfully. Redirecting to login..." 
                : "Enter a new password for your account"}
            </CardDescription>
          </CardHeader>
          
          {!success && (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
                {error && (
                  <div className="bg-destructive/10 text-destructive text-xs sm:text-sm p-2.5 rounded-md">
                    {error}
                  </div>
                )}
                
                <div className="space-y-1 sm:space-y-1.5">
                  <Label htmlFor="password" className="text-xs sm:text-sm">New Password</Label>
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
                
                <div className="space-y-1 sm:space-y-1.5">
                  <Label htmlFor="confirm-password" className="text-xs sm:text-sm">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                      Updating Password...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword; 