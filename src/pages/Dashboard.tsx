import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarClock, Users, UserCog, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isSystemInfoOpen, setIsSystemInfoOpen] = useState(false);
  const today = format(new Date(), 'yyyy-MM-dd');
  
  useEffect(() => {
    document.title = 'Dashboard - Cliniko';
  }, []);

  // Get today's appointments count
  const { 
    data: todayAppointments,
    isLoading: isLoadingAppointments
  } = useQuery({
    queryKey: ['todayAppointments'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('appointment_date', today)
        .eq('status', 'scheduled');
        
      if (error) throw error;
      return count || 0;
    },
    refetchInterval: 30000 // Refetch every 30 seconds
  });
  
  // Get total patients count
  const { 
    data: patientsCount,
    isLoading: isLoadingPatients
  } = useQuery({
    queryKey: ['patientsCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });
        
      if (error) throw error;
      return count || 0;
    },
    refetchInterval: 60000 // Refetch every minute
  });
  
  // Get active users count
  const { 
    data: usersCount,
    isLoading: isLoadingUsers
  } = useQuery({
    queryKey: ['usersCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
        
      if (error) throw error;
      return count || 0;
    },
    refetchInterval: 60000 // Refetch every minute
  });
  
  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold text-medical-doctor truncate">Welcome back, {currentUser?.name}</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">
          Access your management tools and information below
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {/* APPOINTMENTS - Highest priority */}
        <Card className="overflow-hidden card-doctor">
          <CardHeader className="pb-2 p-4 sm:p-5 card-header-doctor rounded-t-lg">
            <div className="size-10 sm:size-12 lg:size-14 rounded-md bg-medical-doctor/15 flex items-center justify-center mb-2">
              <CalendarClock className="size-6 sm:size-7 lg:size-8 text-medical-doctor" />
            </div>
            <CardTitle className="text-lg sm:text-xl">Today's Schedule</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Upcoming appointments</CardDescription>
          </CardHeader>
          <CardContent className="pb-2 px-4 sm:px-5">
            {isLoadingAppointments ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className="text-xl sm:text-2xl font-bold">{todayAppointments}</p>
            )}
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Scheduled today</p>
          </CardContent>
          <CardFooter className="p-4 sm:p-5 pt-2">
            <Button 
              onClick={() => handleNavigate('/appointments')}
              className="w-full h-8 sm:h-9 text-xs sm:text-sm bg-medical-doctor hover:bg-medical-doctor-dark text-white"
            >
              View Calendar
            </Button>
          </CardFooter>
        </Card>
        
        {/* PATIENTS - Second priority */}
        <Card className="overflow-hidden card-nurse">
          <CardHeader className="pb-2 p-4 sm:p-5 card-header-nurse rounded-t-lg">
            <div className="size-10 sm:size-12 lg:size-14 rounded-md bg-medical-nurse/15 flex items-center justify-center mb-2">
              <Users className="size-6 sm:size-7 lg:size-8 text-medical-nurse" />
            </div>
            <CardTitle className="text-lg sm:text-xl">Patients</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Manage patient records</CardDescription>
          </CardHeader>
          <CardContent className="pb-2 px-4 sm:px-5">
            {isLoadingPatients ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className="text-xl sm:text-2xl font-bold">{patientsCount}</p>
            )}
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Registered patients</p>
          </CardContent>
          <CardFooter className="p-4 sm:p-5 pt-2">
            <Button 
              onClick={() => handleNavigate('/patients')}
              variant="outline" 
              className="w-full h-8 sm:h-9 text-xs sm:text-sm hover:bg-medical-nurse hover:text-white"
            >
              View Patients
            </Button>
          </CardFooter>
        </Card>
        
        {/* USERS - Lowest priority */}
        <Card className="overflow-hidden card-admin">
          <CardHeader className="pb-2 p-4 sm:p-5 card-header-admin rounded-t-lg">
            <div className="size-10 sm:size-12 lg:size-14 rounded-md bg-medical-admin/15 flex items-center justify-center mb-2">
              <UserCog className="size-6 sm:size-7 lg:size-8 text-medical-admin" />
            </div>
            <CardTitle className="text-lg sm:text-xl">Users</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Manage system access</CardDescription>
          </CardHeader>
          <CardContent className="pb-2 px-4 sm:px-5">
            {isLoadingUsers ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className="text-xl sm:text-2xl font-bold">{usersCount}</p>
            )}
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Active users</p>
          </CardContent>
          <CardFooter className="p-4 sm:p-5 pt-2">
            <Button 
              onClick={() => handleNavigate('/users')}
              variant="outline" 
              className="w-full h-8 sm:h-9 text-xs sm:text-sm hover:bg-medical-admin hover:text-white"
            >
              Manage Users
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* System Information - Hidden in collapsible section */}
      <div>
        <Collapsible
          open={isSystemInfoOpen}
          onOpenChange={setIsSystemInfoOpen}
          className="border border-border/60 rounded-md bg-gradient-to-b from-white to-card/50 dark:from-slate-800/90 dark:to-slate-900 shadow-sm"
        >
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full flex justify-between p-4 sm:p-5 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-t-md">
              <div className="flex items-center">
                <Info className="h-4 w-4 mr-2 text-medical-staff-dark dark:text-medical-staff-medium" />
                <span className="font-medium text-gray-900 dark:text-gray-200">System Information</span>
              </div>
              {isSystemInfoOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 sm:px-5 pb-5">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              This application features enterprise-grade architecture with comprehensive data visualization and reporting functions.
            </p>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};

export default Dashboard;
