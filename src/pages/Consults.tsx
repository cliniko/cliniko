import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

import ConsultForm from '@/components/consults/ConsultForm';
import ConsultsList from '@/components/consults/ConsultsList';

const Consults = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [patients, setPatients] = useState<Record<string, string>>({});
  
  const { toast } = useToast();
  const { currentUser } = useAuth();
  
  // Fetch patients for mapping IDs to names
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const { data, error } = await supabase
          .from('patients')
          .select('id, name');
          
        if (error) throw error;
        
        const patientMap: Record<string, string> = {};
        if (data) {
          data.forEach(patient => {
            patientMap[patient.id] = patient.name;
          });
        }
        
        setPatients(patientMap);
      } catch (error: any) {
        console.error("Error fetching patients:", error);
      }
    };
    
    fetchPatients();
  }, []);
  
  // Fetch consultations with patient data
  useEffect(() => {
    fetchConsultations();
  }, []);
  
  const fetchConsultations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select('*, patients(name)')
        .order('date', { ascending: false });
        
      if (error) throw error;
      
      // Format the data to include patient name
      const formattedData = data?.map(consult => ({
        ...consult,
        patient_name: consult.patients?.name || 'Unknown Patient'
      })) || [];
      
      setConsultations(formattedData);
    } catch (error: any) {
      console.error("Error fetching consultations:", error);
      toast({
        title: "Error",
        description: "Failed to fetch consultations",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNewConsult = async (consultData: any) => {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .insert([consultData])
        .select();
        
      if (error) throw error;
      
      toast({
        title: "Consultation added",
        description: "New consultation has been successfully created",
      });
      
      setIsAddModalOpen(false);
      fetchConsultations();
    } catch (error: any) {
      console.error("Error creating consultation:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create consultation",
        variant: "destructive"
      });
    }
  };
  
  const handleViewConsult = (id: string) => {
    // Implementation for viewing a consultation
    console.log("View consultation", id);
  };
  
  const handleEditConsult = (id: string) => {
    // Implementation for editing a consultation
    console.log("Edit consultation", id);
  };
  
  const handleDeleteConsult = async (id: string) => {
    try {
      const { error } = await supabase
        .from('consultations')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Consultation deleted",
        description: "The consultation has been successfully deleted",
      });
      
      fetchConsultations();
    } catch (error: any) {
      console.error("Error deleting consultation:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete consultation",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-medical-doctor">Consults</h1>
        
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-medical-doctor hover:bg-medical-doctor-dark">
              <Plus size={16} className="mr-1" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Consultation</DialogTitle>
              <DialogDescription>
                Enter the details for the new consultation record
              </DialogDescription>
            </DialogHeader>
            
            <ConsultForm
              onSave={handleNewConsult}
              onCancel={() => setIsAddModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <ConsultsList
        consultations={consultations}
        onView={handleViewConsult}
        onEdit={handleEditConsult}
        onDelete={handleDeleteConsult}
      />
    </div>
  );
};

export default Consults;
