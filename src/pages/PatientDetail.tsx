import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, CalendarPlus, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
import { ArchiveButton } from '@/components/ui/archive-button';
import { ArchivedBadge } from '@/components/ui/archived-badge';
import { useAuth } from '@/context/AuthContext';

interface Consult {
  id: string;
  date: string;
  time: string;
  patient_id: string;
  chief_complaint: string;
  attending_physician_name: string;
  attending_physician: string;
  created_at: string;
  status: string;
  is_archived?: boolean;
}

const PatientDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();
  const [showArchived, setShowArchived] = useState(false);
  
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
          createdAt: data.created_at,
          isArchived: data.is_archived
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
    queryKey: ['patient-consults', id, showArchived],
    queryFn: async () => {
      try {
        if (!id) throw new Error("Patient ID is required");
        
        // Use SQL function to get consults with physician names
        let consultData;

        // If showArchived is true, use the archive-aware function
        if (showArchived) {
          try {
            const { data: archivedData, error: archivedError } = await supabase
              .rpc('fetch_patient_consults_with_archived', {
                patient_id_param: id
              });
              
            if (archivedError) throw archivedError;
            consultData = archivedData;
          } catch (err) {
            console.error("Archive function error:", err);
            // Fall back to standard function
            const { data, error } = await supabase
              .rpc('fetch_patient_consults', { 
                patient_id_param: id
              });
            
            if (error) throw error;
            consultData = data;
          }
        } else {
          // Otherwise, use the regular function
          const { data, error } = await supabase
            .rpc('fetch_patient_consults', { 
              patient_id_param: id
            });
          
          if (error) throw error;
          consultData = data;
        }

        return consultData as Consult[];
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
    queryKey: ['patient-appointments', id, showArchived],
    queryFn: async () => {
      try {
        if (!id) throw new Error("Patient ID is required");
        
        // Use SQL function to get appointments with nurse names
        let appointmentData;

        // If showArchived is true, use the archive-aware function
        if (showArchived) {
          try {
            const { data: archivedData, error: archivedError } = await supabase
              .rpc('fetch_patient_appointments_with_archived', {
                patient_id_param: id
              });
              
            if (archivedError) throw archivedError;
            appointmentData = archivedData;
          } catch (err) {
            console.error("Archive function error:", err);
            // Fall back to standard function
            const { data, error } = await supabase
              .rpc('fetch_patient_appointments', { 
                patient_id_param: id
              });
            
            if (error) throw error;
            appointmentData = data;
          }
        } else {
          // Otherwise, use the regular function
          const { data, error } = await supabase
            .rpc('fetch_patient_appointments', { 
              patient_id_param: id
            });
          
          if (error) throw error;
          appointmentData = data;
        }

        return appointmentData || [];
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
  
  const handleArchive = async () => {
    try {
      if (!id) return;

      const { error } = await supabase
        .from('patients')
        .update({ is_archived: true })
        .eq('id', id);

      if (error) throw error;

      // Show success message
      toast({
        title: "Patient archived",
        description: "The patient record has been successfully archived."
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['patient', id] });

      // Wait a moment for the optimistic UI update
      setTimeout(() => {
        navigate('/patients');
      }, 500);
    } catch (error: any) {
      console.error("Error archiving patient:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to archive patient record",
        variant: "destructive"
      });
    }
  };

  const handleUnarchive = async () => {
    try {
      if (!id) return;

      const { error } = await supabase
        .from('patients')
        .update({ is_archived: false })
        .eq('id', id);

      if (error) throw error;

      // Show success message
      toast({
        title: "Patient restored",
        description: "The patient record has been successfully restored."
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
    } catch (error: any) {
      console.error("Error restoring patient:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to restore patient record",
        variant: "destructive"
      });
    }
  };

  if (isLoadingPatient) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8 flex items-center justify-center h-64">
        <div className="text-center text-sm sm:text-base">Loading patient details...</div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-6">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-red-600">Patient Not Found</h1>
          <p className="mt-2 text-sm sm:text-base">The requested patient does not exist or was deleted.</p>
          <Button 
            className="mt-4 text-sm"
            onClick={() => navigate('/patients')}
          >
            Return to Patients
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto px-2 sm:px-4 py-4 space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <h1 className="text-xl sm:text-2xl font-bold text-blue-700">Patient Details</h1>
          {patient.isArchived && <ArchivedBadge />}
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1.5 text-xs sm:text-sm"
            onClick={() => navigate('/patients')}
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="sm:inline">Back</span>
            <span className="hidden sm:inline"> to Patient List</span>
          </Button>
          
          {/* Only show the archive button to admin users */}
          {currentUser?.role === 'admin' && (
            <ArchiveButton 
              isArchived={patient.isArchived || false} 
              onArchive={handleArchive}
              onUnarchive={handleUnarchive}
              recordType="patient"
            />
          )}
        </div>
      </div>
      
      {/* Patient Information Card */}
      <Card className={`overflow-hidden ${
        patient.isArchived 
          ? 'bg-gradient-to-b from-amber-50/50 to-amber-50/30 border-amber-200/50 dark:from-amber-900/20 dark:to-slate-900' 
          : 'card-doctor'
        }`}
      >
        <CardHeader className={`rounded-t-lg ${
          patient.isArchived 
            ? "bg-amber-50/70 dark:bg-amber-900/20" 
            : "card-header-doctor bg-opacity-80"
          }`}
        >
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                {patient.name}
              </CardTitle>
              <CardDescription className="dark:text-gray-300">
                {patient.gender}, {patient.dateOfBirth ? `${calculateAge(patient.dateOfBirth)} years old` : 'Unknown Age'}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {!patient.isArchived && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1.5 border-medical-doctor/30 hover:bg-medical-doctor hover:text-white"
                    onClick={() => navigate(`/consults/new?patientId=${patient.id}`)}
                  >
                    <FileText className="h-4 w-4" />
                    <span className="sm:inline">New Consult</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1.5 border-medical-nurse/30 hover:bg-medical-nurse hover:text-white"
                    onClick={() => navigate(`/appointments/new?patientId=${patient.id}`)}
                  >
                    <CalendarPlus className="h-4 w-4" />
                    <span className="sm:inline">Schedule</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 sm:gap-x-8">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Position</h3>
              <p className="mt-1 text-sm sm:text-base dark:text-gray-300">{patient.position || 'Not specified'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Designation</h3>
              <p className="mt-1 text-sm sm:text-base dark:text-gray-300">{patient.designation || 'Not specified'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact Number</h3>
              <p className="mt-1 text-sm sm:text-base dark:text-gray-300">{patient.contact || 'Not specified'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</h3>
              <p className="mt-1 text-sm sm:text-base break-words dark:text-gray-300">{patient.email || 'Not specified'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Date of Birth</h3>
              <p className="mt-1 text-sm sm:text-base dark:text-gray-300">{patient.dateOfBirth ? formatDate(patient.dateOfBirth) : 'Not specified'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Registered On</h3>
              <p className="mt-1 text-sm sm:text-base dark:text-gray-300">{formatDate(patient.createdAt)}</p>
            </div>
            {patient.address && (
              <div className="col-span-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</h3>
                <p className="mt-1 text-sm sm:text-base dark:text-gray-300">{patient.address}</p>
              </div>
            )}
            {patient.medicalHistory && (
              <div className="col-span-2 mt-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Medical History</h3>
                <p className="mt-1 text-sm sm:text-base whitespace-pre-line dark:text-gray-300">{patient.medicalHistory}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Medical Records Tabs */}
      <div>
        <Tabs defaultValue="consults" className="w-full">
          <TabsList className="grid grid-cols-2 w-full max-w-md">
            <TabsTrigger value="consults">Consultation Records</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
          </TabsList>
          
          {/* Show archive toggle for admin users */}
          {currentUser?.role === 'admin' && (
            <div className="flex justify-end mt-3 sm:mt-4">
              <div className="flex items-center gap-2 bg-amber-50/50 p-1.5 sm:p-2 px-2 sm:px-3 rounded-md border border-amber-200 text-xs sm:text-sm">
                <label htmlFor="showArchived" className="whitespace-nowrap">
                  Show archived records
                </label>
                <input
                  id="showArchived"
                  type="checkbox"
                  checked={showArchived}
                  onChange={(e) => setShowArchived(e.target.checked)}
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                />
              </div>
            </div>
          )}
          
          {/* Consultations Tab */}
          <TabsContent value="consults" className="mt-3 sm:mt-4">
            <Card className="card-doctor">
              <CardHeader className="pb-2 sm:pb-3 card-header-doctor rounded-t-lg">
                <CardTitle className="text-base sm:text-lg">Consultation History</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                {isLoadingConsults ? (
                  <div className="text-center py-4 text-sm sm:text-base">Loading consultations...</div>
                ) : consults && consults.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">Date</TableHead>
                          <TableHead className="w-[90px]">Time</TableHead>
                          <TableHead>Chief Complaint</TableHead>
                          <TableHead className="hidden sm:table-cell">Physician</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {consults.map((consult) => (
                          <TableRow key={consult.id} className={consult.status === 'archived' ? "bg-amber-50/30" : ""}>
                            <TableCell>{formatDate(consult.date)}</TableCell>
                            <TableCell>{formatTime(consult.time)}</TableCell>
                            <TableCell className="max-w-[150px] truncate">{consult.chief_complaint}</TableCell>
                            <TableCell className="hidden sm:table-cell">{consult.attending_physician_name}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/consults/${consult.id}`)}
                                className="whitespace-nowrap"
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-6 text-sm sm:text-base text-gray-500">
                    No consultation records found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Appointments Tab */}
          <TabsContent value="appointments" className="mt-3 sm:mt-4">
            <Card className="card-nurse">
              <CardHeader className="pb-2 sm:pb-3 card-header-nurse rounded-t-lg">
                <CardTitle className="text-base sm:text-lg">Appointment Schedule</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                {isLoadingAppointments ? (
                  <div className="text-center py-4 text-sm sm:text-base">Loading appointments...</div>
                ) : appointments && appointments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">Date</TableHead>
                          <TableHead className="w-[90px]">Time</TableHead>
                          <TableHead className="hidden sm:table-cell">Nurse</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {appointments.map((appointment: any) => (
                          <TableRow 
                            key={appointment.id}
                            className={appointment.is_archived ? "bg-amber-50/30" : ""}
                          >
                            <TableCell>{formatDate(appointment.appointment_date)}</TableCell>
                            <TableCell>{formatTime(appointment.appointment_time)}</TableCell>
                            <TableCell className="hidden sm:table-cell">{appointment.nurse_name}</TableCell>
                            <TableCell>
                              <Badge variant={appointment.status as "scheduled" | "completed" | "cancelled"}>
                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                              </Badge>
                              {appointment.is_archived && (
                                <ArchivedBadge size="sm" className="ml-2" />
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/appointments/${appointment.id}`)}
                                className="whitespace-nowrap"
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-6 text-sm sm:text-base text-gray-500">
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