import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CalendarPlus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO, isValid } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Appointment } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from '@/context/AuthContext';
import { ArchiveFilter } from '@/components/ui/archive-filter';

const Appointments = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [showArchived, setShowArchived] = useState(false);
  
  // Get all appointments
  const {
    data: appointmentsData,
    isLoading,
    refetch: refetchAppointments
  } = useQuery({
    queryKey: ['appointments', showArchived],
    queryFn: async () => {
      try {
        let data;
        let error;

        // If archive toggle is on, use the archive-aware function
        if (showArchived) {
          try {
            const { data: archivedData, error: archivedError } = await supabase
              .rpc('fetch_all_appointments_with_archived');
              
            if (archivedError) {
              console.error("Archive function error:", archivedError);
              throw archivedError;
            }
            
            data = archivedData;
            error = null;
          } catch (err) {
            console.error("Failed with archive function, falling back to standard:", err);
            // Fall back to standard function if archive function fails
            const response = await supabase
              .rpc('fetch_all_appointments');
            data = response.data;
            error = response.error;
          }
        } else {
          // Use the standard function (which only shows non-archived)
          const response = await supabase
            .rpc('fetch_all_appointments');
          data = response.data;
          error = response.error;
        }
        
        if (error) throw error;
        
        return data || [];
      } catch (error: any) {
        console.error("Error fetching appointments:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load appointments",
          variant: "destructive"
        });
        throw error;
      }
    }
  });
  
  const groupAppointmentsByDate = (appointments: Appointment[]) => {
    const grouped: Record<string, Appointment[]> = {};
    
    appointments.forEach(appointment => {
      if (!grouped[appointment.appointment_date]) {
        grouped[appointment.appointment_date] = [];
      }
      grouped[appointment.appointment_date].push(appointment);
    });
    
    // Sort each day's appointments by time
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => {
        return a.appointment_time.localeCompare(b.appointment_time);
      });
    });
    
    return grouped;
  };
  
  const handleViewAppointment = (appointmentId: string) => {
    navigate(`/appointments/${appointmentId}`);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline" className="bg-medical-nurse/10 text-medical-nurse border-medical-nurse/20">Scheduled</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-medical-doctor/10 text-medical-doctor border-medical-doctor/20">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-medical-danger/10 text-medical-danger border-medical-danger/20">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  const formatAppointmentTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
      
      if (!isValid(date)) return timeString;
      
      return format(date, 'h:mm a');
    } catch (e) {
      return timeString;
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return dateString;
      return format(date, 'MMMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  // Mobile view for appointments
  const renderMobileAppointments = (appointments: Appointment[]) => {
    const groupedAppointments = groupAppointmentsByDate(appointments);
    
    return (
      <div className="space-y-4 md:hidden">
        {Object.entries(groupedAppointments)
          .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
          .map(([date, appointments]) => (
            <Card key={date} className="overflow-hidden">
              <CardHeader className="py-3">
                <CardTitle className="text-base font-medium">
                  {formatDate(date)}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium">
                          {formatAppointmentTime(appointment.appointment_time)}
                        </div>
                        {getStatusBadge(appointment.status)}
                      </div>
                      <div className="text-sm text-gray-700 mb-1">
                        <span className="font-medium">Patient: </span>
                        {appointment.patient_name}
                      </div>
                      <div className="text-sm text-gray-700 mb-3">
                        <span className="font-medium">Nurse: </span>
                        {appointment.nurse_name}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewAppointment(appointment.id)}
                        className="text-medical-doctor w-full justify-center"
                      >
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-medical-doctor">Appointment Calendar</h1>
          <p className="text-gray-600 mt-1">View and manage scheduled appointments</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {currentUser?.role === 'admin' && (
            <ArchiveFilter 
              showArchived={showArchived} 
              onToggleShowArchived={setShowArchived} 
            />
          )}
          <Button 
            className="bg-medical-doctor hover:bg-medical-doctor-dark flex items-center gap-1.5 w-full sm:w-auto"
            onClick={() => navigate('/appointments/new')}
          >
            <CalendarPlus className="h-4 w-4" />
            New Appointment
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-medical-doctor mb-4" />
            <p className="text-sm text-gray-500">Loading appointments...</p>
          </CardContent>
        </Card>
      ) : appointmentsData && appointmentsData.length > 0 ? (
        <>
          {/* Mobile view */}
          {renderMobileAppointments(appointmentsData as Appointment[])}
          
          {/* Desktop view */}
          <div className="hidden md:block space-y-6">
            {Object.entries(groupAppointmentsByDate(appointmentsData as Appointment[]))
              .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
              .map(([date, appointments]) => (
                <Card key={date} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      {formatDate(date)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Time</TableHead>
                          <TableHead>Patient</TableHead>
                          <TableHead>Nurse</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {appointments.map((appointment) => (
                          <TableRow key={appointment.id}>
                            <TableCell className="font-medium">
                              {formatAppointmentTime(appointment.appointment_time)}
                            </TableCell>
                            <TableCell>{appointment.patient_name}</TableCell>
                            <TableCell>{appointment.nurse_name}</TableCell>
                            <TableCell>
                              {getStatusBadge(appointment.status)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewAppointment(appointment.id)}
                                className="text-medical-doctor"
                              >
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))}
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CalendarPlus className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">No appointments scheduled</p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/appointments/new')}
              className="flex items-center gap-1.5"
            >
              <CalendarPlus className="h-4 w-4" />
              Schedule New Appointment
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Appointments; 