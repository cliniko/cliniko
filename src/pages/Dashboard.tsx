import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Clipboard, Users, UserCog, ActivitySquare } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    document.title = 'Dashboard - Holcim Inc';
  }, []);
  
  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold text-medical-primary truncate">Welcome back, {currentUser?.name}</h1>
        <p className="text-sm md:text-base text-medical-gray mt-1 md:mt-2">
          Access your management tools and information below
      </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <Card className="overflow-hidden border border-border/60 transition-all hover:border-medical-primary/20 hover:shadow-md">
          <CardHeader className="pb-2 p-4 sm:p-5">
            <div className="size-10 sm:size-12 lg:size-14 rounded-md bg-medical-doctor-light flex items-center justify-center mb-2">
              <Clipboard className="size-6 sm:size-7 lg:size-8 text-medical-doctor" />
            </div>
            <CardTitle className="text-lg sm:text-xl">Consultations</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Manage patient visits</CardDescription>
          </CardHeader>
          <CardContent className="pb-2 px-4 sm:px-5">
            <p className="text-xl sm:text-2xl font-bold">0</p>
            <p className="text-xs sm:text-sm text-medical-gray">Today's appointments</p>
          </CardContent>
          <CardFooter className="p-4 sm:p-5 pt-2">
            <Button 
              onClick={() => handleNavigate('/consults')}
              variant="outline" 
              className="w-full h-8 sm:h-9 text-xs sm:text-sm hover:bg-medical-primary hover:text-white"
            >
              View Consults
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="overflow-hidden border border-border/60 transition-all hover:border-medical-primary/20 hover:shadow-md">
          <CardHeader className="pb-2 p-4 sm:p-5">
            <div className="size-10 sm:size-12 lg:size-14 rounded-md bg-medical-staff-light flex items-center justify-center mb-2">
              <Users className="size-6 sm:size-7 lg:size-8 text-medical-staff" />
            </div>
            <CardTitle className="text-lg sm:text-xl">Patients</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Manage patient records</CardDescription>
          </CardHeader>
          <CardContent className="pb-2 px-4 sm:px-5">
            <p className="text-xl sm:text-2xl font-bold">0</p>
            <p className="text-xs sm:text-sm text-medical-gray">Registered patients</p>
          </CardContent>
          <CardFooter className="p-4 sm:p-5 pt-2">
            <Button 
              onClick={() => handleNavigate('/patients')}
              variant="outline" 
              className="w-full h-8 sm:h-9 text-xs sm:text-sm hover:bg-medical-staff hover:text-white"
            >
              View Patients
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="overflow-hidden border border-border/60 transition-all hover:border-medical-primary/20 hover:shadow-md">
          <CardHeader className="pb-2 p-4 sm:p-5">
            <div className="size-10 sm:size-12 lg:size-14 rounded-md bg-medical-nurse-light flex items-center justify-center mb-2">
              <ActivitySquare className="size-6 sm:size-7 lg:size-8 text-medical-nurse" />
            </div>
            <CardTitle className="text-lg sm:text-xl">Vital Signs</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Monitor patient health</CardDescription>
          </CardHeader>
          <CardContent className="pb-2 px-4 sm:px-5">
            <p className="text-xl sm:text-2xl font-bold">0</p>
            <p className="text-xs sm:text-sm text-medical-gray">Recent readings</p>
          </CardContent>
          <CardFooter className="p-4 sm:p-5 pt-2">
            <Button 
              onClick={() => handleNavigate('/vitals')}
              variant="outline" 
              className="w-full h-8 sm:h-9 text-xs sm:text-sm hover:bg-medical-nurse hover:text-white"
            >
              View Vitals
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="overflow-hidden border border-border/60 transition-all hover:border-medical-primary/20 hover:shadow-md">
          <CardHeader className="pb-2 p-4 sm:p-5">
            <div className="size-10 sm:size-12 lg:size-14 rounded-md bg-medical-admin-light flex items-center justify-center mb-2">
              <UserCog className="size-6 sm:size-7 lg:size-8 text-medical-admin" />
            </div>
            <CardTitle className="text-lg sm:text-xl">Users</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Manage system access</CardDescription>
          </CardHeader>
          <CardContent className="pb-2 px-4 sm:px-5">
            <p className="text-xl sm:text-2xl font-bold">1</p>
            <p className="text-xs sm:text-sm text-medical-gray">Active users</p>
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
      
      <div>
        <Card className="border border-border/60">
          <CardHeader className="pb-2 p-4 sm:p-5">
            <CardTitle className="text-lg sm:text-xl">System Information</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-5 pb-5">
            <p className="text-xs sm:text-sm text-medical-gray">
              This application now features enterprise-grade architecture with comprehensive data visualization and reporting functions.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
