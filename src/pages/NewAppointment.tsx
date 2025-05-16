import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AppointmentForm from '@/components/consults/AppointmentForm';
import { AppointmentSubmission } from '@/types';
import { format } from 'date-fns';

const NewAppointment = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Extract patient ID from query parameter if available
  const queryParams = new URLSearchParams(location.search);
  const patientId = queryParams.get('patientId');
  
  const handleSaveAppointment = async (appointmentData: AppointmentSubmission) => {
    setIsSubmitting(true);
    try {
      // Ensure appointment_date is a string for database insertion
      const dbData = {
        ...appointmentData,
        appointment_date: appointmentData.appointment_date instanceof Date 
          ? format(appointmentData.appointment_date, 'yyyy-MM-dd')
          : appointmentData.appointment_date
      };
      
      // Insert the appointment data into the database
      const { data, error } = await supabase
        .from('appointments')
        .insert([dbData])
        .select();
        
      if (error) throw error;
      
      toast({
        title: "Appointment Scheduled",
        description: "The appointment has been successfully scheduled",
      });
      
      // Navigate to appointments list
      navigate('/appointments');
    } catch (error: any) {
      console.error('Error saving appointment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to schedule appointment",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="container max-w-5xl mx-auto p-4 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-700">Schedule New Appointment</h1>
          <p className="text-gray-600 mt-1">Create a new appointment for the patient</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1.5"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Appointment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <AppointmentForm 
            patientId={patientId}
            onSave={handleSaveAppointment}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default NewAppointment; 