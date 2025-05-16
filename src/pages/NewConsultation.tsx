import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ConsultForm from '@/components/consults/ConsultForm';
import { Consultation } from '@/types';

const NewConsultation = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Extract patient ID from query parameter if available
  const queryParams = new URLSearchParams(location.search);
  const patientId = queryParams.get('patientId');
  
  const handleSaveConsultation = async (consultData: Omit<Consultation, 'id' | 'created_at'>) => {
    setIsSubmitting(true);
    try {
      // Insert the consultation data into the database
      const { data, error } = await supabase
        .from('consultations')
        .insert([consultData])
        .select();
        
      if (error) throw error;
      
      toast({
        title: "Consultation Created",
        description: "The consultation has been successfully created",
      });
      
      // Navigate to consultations list
      navigate('/consults');
    } catch (error: any) {
      console.error('Error saving consultation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create consultation",
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
          <h1 className="text-2xl font-bold text-blue-700">New Consultation</h1>
          <p className="text-gray-600 mt-1">Create a new consultation record</p>
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
          <CardTitle>Consultation Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ConsultForm 
            patientId={patientId}
            onSave={handleSaveConsultation}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default NewConsultation; 