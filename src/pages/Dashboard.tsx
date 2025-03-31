
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Clipboard, Users, UserCog, ActivitySquare } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Just to demonstrate useEffect usage - could do more initialization here
    document.title = 'Dashboard - Clinic Health Data';
  }, []);
  
  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-medical-primary">Welcome back, {currentUser?.name}</h1>
      <p className="text-gray-600">
        Access your healthcare management tools and patient information below
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <Clipboard className="h-8 w-8 text-medical-primary" />
            <CardTitle className="text-lg">Consultations</CardTitle>
            <CardDescription>Manage patient visits</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-2xl font-bold">0</p>
            <p className="text-sm text-gray-600">Today's appointments</p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => handleNavigate('/consults')}
              variant="outline" 
              className="w-full text-medical-primary hover:bg-medical-primary hover:text-white"
            >
              View Consults
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <Users className="h-8 w-8 text-medical-secondary" />
            <CardTitle className="text-lg">Patients</CardTitle>
            <CardDescription>Manage patient records</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-2xl font-bold">0</p>
            <p className="text-sm text-gray-600">Registered patients</p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => handleNavigate('/patients')}
              variant="outline" 
              className="w-full text-medical-secondary hover:bg-medical-secondary hover:text-white"
            >
              View Patients
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <ActivitySquare className="h-8 w-8 text-medical-accent" />
            <CardTitle className="text-lg">Vital Signs</CardTitle>
            <CardDescription>Monitor patient health</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-2xl font-bold">0</p>
            <p className="text-sm text-gray-600">Recent readings</p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => handleNavigate('/vitals')}
              variant="outline" 
              className="w-full text-medical-accent hover:bg-medical-accent hover:text-white"
            >
              View Vitals
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <UserCog className="h-8 w-8 text-medical-success" />
            <CardTitle className="text-lg">Users</CardTitle>
            <CardDescription>Manage system access</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-2xl font-bold">1</p>
            <p className="text-sm text-gray-600">Active users</p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => handleNavigate('/users')}
              variant="outline" 
              className="w-full text-medical-success hover:bg-medical-success hover:text-white"
            >
              Manage Users
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>About FHIR Implementation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-medical-primary">
              This application now includes FHIR compliance for better interoperability with other healthcare systems.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
