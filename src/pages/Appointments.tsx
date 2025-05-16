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

const Appointments = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get all appointments
  const {
    data: appointmentsData,
    isLoading,
    refetch: refetchAppointments
  } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      try {
        // Create a custom query with joins to get patient and nurse names
        const { data, error } = await supabase
          .rpc('get_appointments_with_details');
        
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
        return <Badge className="bg-blue-500">Scheduled</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">Cancelled</Badge>;
      default:
        return <Badge>Unknown</Badge>;
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

  return (
    <div className="container max-w-6xl mx-auto p-4 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-700">Appointment Calendar</h1>
          <p className="text-gray-600 mt-1">View and manage scheduled appointments</p>
        </div>
        <Button 
          className="bg-blue-700 hover:bg-blue-800 flex items-center gap-1.5"
          onClick={() => navigate('/appointments/new')}
        >
          <CalendarPlus className="h-4 w-4" />
          New Appointment
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
          <span className="ml-2 text-lg text-gray-600">Loading appointments...</span>
        </div>
      ) : appointmentsData && appointmentsData.length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupAppointmentsByDate(appointmentsData as Appointment[]))
            .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
            .map(([date, appointments]) => (
              <Card key={date} className="overflow-hidden">
                <CardHeader className="bg-gray-50 pb-3">
                  <CardTitle className="text-lg text-blue-700">
                    {formatDate(date)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[150px]">Time</TableHead>
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
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewAppointment(appointment.id)}
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
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-600 mb-4">No appointments scheduled</p>
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