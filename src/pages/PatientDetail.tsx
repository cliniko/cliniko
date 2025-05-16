import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, CalendarPlus, ClipboardCheck, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Patient } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

interface Consult {
  id: string;
  date: string;
  time: string;
  patient_id: string;
  chief_complaint: string;
  attending_physician_name: string;
  created_at: string;
  status: string;
}

const PatientDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  const {
    data: patient,
    isLoading: isLoadingPatient,
  } = useQuery({
    queryKey: ['patient', id],
    queryFn: async () => {
      try {
        if (!id) throw new Error("Patient ID is required");
        
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        // Map to our Patient type
        const patientData: Patient = {
          id: data.id,
          name: data.name,
          dateOfBirth: data.date_of_birth,
          gender: data.gender,
          contact: data.contact || undefined,
          email: data.email || undefined,
          address: data.address || undefined,
          position: data.position || undefined,
          designation: data.designation || undefined,
          medicalHistory: data.medical_history || undefined,
          createdAt: data.created_at
        };
        
        return patientData;
      } catch (error: any) {
        console.error("Error fetching patient:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load patient details",
          variant: "destructive"
        });
        throw error;
      }
    },
    enabled: !!id
  });
  
  const {
    data: consults,
    isLoading: isLoadingConsults,
  } = useQuery({
    queryKey: ['patient-consults', id],
    queryFn: async () => {
      try {
        if (!id) throw new Error("Patient ID is required");
        
        // Use SQL function to get consults with physician names
        const { data, error } = await supabase
          .rpc('get_patient_consults', { patient_id_param: id });
          
        if (error) throw error;
        
        return data as Consult[];
      } catch (error: any) {
        console.error("Error fetching consults:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load consultation records",
          variant: "destructive"
        });
        return [];
      }
    },
    enabled: !!id
  });
  
  const {
    data: appointments,
    isLoading: isLoadingAppointments,
  } = useQuery({
    queryKey: ['patient-appointments', id],
    queryFn: async () => {
      try {
        if (!id) throw new Error("Patient ID is required");
        
        // Use SQL function to get appointments with nurse names
        const { data, error } = await supabase
          .rpc('get_patient_appointments', { patient_id_param: id });
          
        if (error) throw error;
        
        return data || [];
      } catch (error: any) {
        console.error("Error fetching appointments:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load appointment records",
          variant: "destructive"
        });
        return [];
      }
    },
    enabled: !!id
  });
  
  const calculateAge = (dateOfBirth: string) => {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    
    return age;
  };
  
  const formatDate = (date: string) => {
    try {
      return format(parseISO(date), 'MMM d, yyyy');
    } catch (e) {
      return date;
    }
  };
  
  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return format(date, 'h:mm a');
    } catch (e) {
      return time;
    }
  };

  if (isLoadingPatient) {
    return (
      <div className="container max-w-6xl mx-auto p-4 flex items-center justify-center h-64">
        <div className="text-center">Loading patient details...</div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="container max-w-6xl mx-auto p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Patient Not Found</h1>
          <p className="mt-2">The requested patient does not exist or was deleted.</p>
          <Button 
            className="mt-4"
            onClick={() => navigate('/patients')}
          >
            Return to Patients
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-4 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-700">Patient Details</h1>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1.5"
          onClick={() => navigate('/patients')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Patient List
        </Button>
      </div>
      
      {/* Patient Information Card */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-blue-50">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <CardTitle className="text-xl">{patient.name}</CardTitle>
              <CardDescription>
                {patient.gender}, {patient.dateOfBirth ? `${calculateAge(patient.dateOfBirth)} years old` : 'Unknown Age'}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1.5"
                onClick={() => navigate(`/consults/new?patientId=${patient.id}`)}
              >
                <FileText className="h-4 w-4" />
                New Consult
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1.5"
                onClick={() => navigate(`/appointments/new?patientId=${patient.id}`)}
              >
                <CalendarPlus className="h-4 w-4" />
                Schedule Appointment
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Position</h3>
              <p className="mt-1">{patient.position || 'Not specified'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Designation</h3>
              <p className="mt-1">{patient.designation || 'Not specified'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Contact Number</h3>
              <p className="mt-1">{patient.contact || 'Not specified'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Email</h3>
              <p className="mt-1">{patient.email || 'Not specified'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Date of Birth</h3>
              <p className="mt-1">{patient.dateOfBirth ? formatDate(patient.dateOfBirth) : 'Not specified'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Registered On</h3>
              <p className="mt-1">{formatDate(patient.createdAt)}</p>
            </div>
            {patient.address && (
              <div className="col-span-2">
                <h3 className="text-sm font-medium text-gray-500">Address</h3>
                <p className="mt-1">{patient.address}</p>
              </div>
            )}
            {patient.medicalHistory && (
              <div className="col-span-2 mt-2">
                <h3 className="text-sm font-medium text-gray-500">Medical History</h3>
                <p className="mt-1 whitespace-pre-line">{patient.medicalHistory}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Medical Records Tabs */}
      <div>
        <Tabs defaultValue="consults" className="w-full">
          <TabsList className="grid grid-cols-2 w-[400px]">
            <TabsTrigger value="consults">Consultation Records</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
          </TabsList>
          
          {/* Consultations Tab */}
          <TabsContent value="consults" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Consultation History</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingConsults ? (
                  <div className="text-center py-4">Loading consultations...</div>
                ) : consults && consults.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">Date</TableHead>
                        <TableHead className="w-[100px]">Time</TableHead>
                        <TableHead>Chief Complaint</TableHead>
                        <TableHead>Physician</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {consults.map((consult) => (
                        <TableRow key={consult.id}>
                          <TableCell>{formatDate(consult.date)}</TableCell>
                          <TableCell>{formatTime(consult.time)}</TableCell>
                          <TableCell>{consult.chief_complaint}</TableCell>
                          <TableCell>{consult.attending_physician_name}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/consults/${consult.id}`)}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    No consultation records found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Appointments Tab */}
          <TabsContent value="appointments" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Appointment Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingAppointments ? (
                  <div className="text-center py-4">Loading appointments...</div>
                ) : appointments && appointments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">Date</TableHead>
                        <TableHead className="w-[100px]">Time</TableHead>
                        <TableHead>Nurse</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments.map((appointment: any) => (
                        <TableRow key={appointment.id}>
                          <TableCell>{formatDate(appointment.appointment_date)}</TableCell>
                          <TableCell>{formatTime(appointment.appointment_time)}</TableCell>
                          <TableCell>{appointment.nurse_name}</TableCell>
                          <TableCell>
                            <Badge className={
                              appointment.status === 'scheduled' ? "bg-blue-500" :
                              appointment.status === 'completed' ? "bg-green-500" :
                              "bg-red-500"
                            }>
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/appointments/${appointment.id}`)}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    No appointments scheduled
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PatientDetail; 