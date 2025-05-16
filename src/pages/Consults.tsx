import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

import ConsultForm from '@/components/consults/ConsultForm';
import ConsultsList from '@/components/consults/ConsultsList';
import { Consultation } from '@/types';

const Consults = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedConsultId, setSelectedConsultId] = useState<string | null>(null);
  const [selectedConsult, setSelectedConsult] = useState<Consultation | null>(null);
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
  
  const fetchConsultById = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select('*, patients(name)')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      if (data) {
        // Transform the database data to match our Consultation type
        const formattedConsult: Consultation = {
          id: data.id,
          patient_id: data.patient_id,
          patient_name: data.patients?.name || 'Unknown Patient',
          patient_type: data.patient_type,
          date: data.date,
          time: data.time,
          chief_complaint: data.chief_complaint,
          subjective: data.subjective,
          // Convert objective to the expected format if it's an array
          objective: Array.isArray(data.objective) 
            ? data.objective.map((item: string, index: number) => ({
                id: `obj-${index}`,
                value: item
              }))
            : [],
          // Convert assessment to string
          assessment: Array.isArray(data.assessment) 
            ? data.assessment.join('\n')
            : data.assessment?.toString() || '',
          // Convert plan to the expected format if it's an array
          plan: Array.isArray(data.plan) 
            ? data.plan.map((item: string, index: number) => ({
                id: `plan-${index}`,
                value: item
              }))
            : [],
          vital_signs: typeof data.vital_signs === 'object' && data.vital_signs !== null
            ? data.vital_signs as Consultation['vital_signs']
            : undefined,
          // Transform prescriptions if needed
          prescriptions: Array.isArray(data.prescription)
            ? data.prescription.map((rx: any) => ({
                name: rx.drug,
                dosage: rx.form,
                route: rx.route || '',
                frequency: rx.frequency || '',
                duration: rx.quantity,
                instructions: rx.instructions
              }))
            : [],
          attending_physician: data.attending_physician,
          attending_nurse: data.attending_nurse || '',
          bp_monitoring: data.bp_monitoring || false,
          hba1c_monitoring: data.hba1c_monitoring || false,
          created_by: data.created_by,
          created_at: data.created_at
        };
        
        setSelectedConsult(formattedConsult);
        return formattedConsult;
      }
    } catch (error: any) {
      console.error("Error fetching consultation details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch consultation details",
        variant: "destructive"
      });
      return null;
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
  
  const handleViewConsult = async (id: string) => {
    setSelectedConsultId(id);
    const consult = await fetchConsultById(id);
    if (consult) {
      setIsViewModalOpen(true);
    }
  };
  
  const handleEditConsult = async (id: string) => {
    setSelectedConsultId(id);
    const consult = await fetchConsultById(id);
    if (consult) {
      setIsEditModalOpen(true);
    }
  };
  
  const handleUpdateConsult = async (consultData: any) => {
    if (!selectedConsultId) return;
    
    try {
      // Format the data for Supabase
      const formattedData = {
        ...consultData,
        // Convert assessment string back to array if needed
        assessment: typeof consultData.assessment === 'string' 
          ? consultData.assessment.split('\n').filter((line: string) => line.trim().length > 0)
          : consultData.assessment,
        // Convert objective objects to simple strings array if needed
        objective: Array.isArray(consultData.objective) && consultData.objective.length > 0 && consultData.objective[0].value 
          ? consultData.objective.map((item: any) => item.value)
          : consultData.objective,
        // Convert plan objects to simple strings array if needed
        plan: Array.isArray(consultData.plan) && consultData.plan.length > 0 && consultData.plan[0].value
          ? consultData.plan.map((item: any) => item.value)
          : consultData.plan,
        // Convert prescriptions back to prescription array expected by the database
        prescription: Array.isArray(consultData.prescriptions)
          ? consultData.prescriptions.map((rx: any) => ({
              drug: rx.name,
              form: rx.dosage,
              route: rx.route,
              frequency: rx.frequency,
              quantity: rx.duration,
              instructions: rx.instructions,
              indication: rx.indication || ''
            }))
          : consultData.prescription
      };
      
      const { error } = await supabase
        .from('consultations')
        .update(formattedData)
        .eq('id', selectedConsultId);
        
      if (error) throw error;
      
      toast({
        title: "Consultation updated",
        description: "The consultation has been successfully updated",
      });
      
      setIsEditModalOpen(false);
      setSelectedConsultId(null);
      setSelectedConsult(null);
      fetchConsultations();
    } catch (error: any) {
      console.error("Error updating consultation:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update consultation",
        variant: "destructive"
      });
    }
  };
  
  const handleConfirmDelete = async () => {
    if (!selectedConsultId) return;
    
    try {
      const { error } = await supabase
        .from('consultations')
        .delete()
        .eq('id', selectedConsultId);
        
      if (error) throw error;
      
      toast({
        title: "Consultation deleted",
        description: "The consultation has been successfully deleted",
      });
      
      setIsDeleteDialogOpen(false);
      setSelectedConsultId(null);
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
  
  const handleDeleteConsult = (id: string) => {
    setSelectedConsultId(id);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-bold text-medical-doctor">Consults</h1>
        
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-medical-doctor hover:bg-medical-doctor-dark">
              <Plus size={16} className="mr-1" />
              <span className="hidden sm:inline">Add</span>
              <span className="sm:hidden">New</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-[90vw] md:max-w-4xl max-h-[90vh] overflow-y-auto">
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
        isLoading={isLoading}
      />
      
      {/* View Consult Modal */}
      {selectedConsult && (
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-[90vw] md:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>View Consultation</DialogTitle>
              <DialogDescription>
                Consultation details for {selectedConsult.patient_name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4 max-h-[calc(90vh-12rem)] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date & Time</h3>
                  <p className="text-base font-medium">
                    {new Date(selectedConsult.date).toLocaleDateString()} at {selectedConsult.time}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Patient Type</h3>
                  <p className="text-base capitalize">{selectedConsult.patient_type}</p>
                </div>
                
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-gray-500">Chief Complaint</h3>
                  <p className="text-base">{selectedConsult.chief_complaint}</p>
                </div>
                
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-gray-500">Subjective</h3>
                  <p className="text-base whitespace-pre-wrap">{selectedConsult.subjective}</p>
                </div>
                
                {selectedConsult.vital_signs && (
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Vital Signs</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50 p-3 rounded-md">
                      {selectedConsult.vital_signs.systolicBP && selectedConsult.vital_signs.diastolicBP && (
                        <div>
                          <p className="text-xs text-gray-500">Blood Pressure</p>
                          <p className="text-base font-medium">{selectedConsult.vital_signs.systolicBP}/{selectedConsult.vital_signs.diastolicBP} mmHg</p>
                        </div>
                      )}
                      
                      {selectedConsult.vital_signs.temperature && (
                        <div>
                          <p className="text-xs text-gray-500">Temperature</p>
                          <p className="text-base font-medium">{selectedConsult.vital_signs.temperature}°C</p>
                        </div>
                      )}
                      
                      {selectedConsult.vital_signs.heartRate && (
                        <div>
                          <p className="text-xs text-gray-500">Heart Rate</p>
                          <p className="text-base font-medium">{selectedConsult.vital_signs.heartRate} bpm</p>
                        </div>
                      )}
                      
                      {selectedConsult.vital_signs.respiratoryRate && (
                        <div>
                          <p className="text-xs text-gray-500">Respiratory Rate</p>
                          <p className="text-base font-medium">{selectedConsult.vital_signs.respiratoryRate} brpm</p>
                        </div>
                      )}
                      
                      {selectedConsult.vital_signs.oxygenSaturation && (
                        <div>
                          <p className="text-xs text-gray-500">SpO2</p>
                          <p className="text-base font-medium">{selectedConsult.vital_signs.oxygenSaturation}%</p>
                        </div>
                      )}
                      
                      {selectedConsult.vital_signs.height && (
                        <div>
                          <p className="text-xs text-gray-500">Height</p>
                          <p className="text-base font-medium">{selectedConsult.vital_signs.height} cm</p>
                        </div>
                      )}
                      
                      {selectedConsult.vital_signs.weight && (
                        <div>
                          <p className="text-xs text-gray-500">Weight</p>
                          <p className="text-base font-medium">{selectedConsult.vital_signs.weight} kg</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {selectedConsult.objective && selectedConsult.objective.length > 0 && (
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-gray-500">Objective</h3>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      {selectedConsult.objective.map((item: any, index: number) => (
                        <li key={index} className="text-base">{item.value}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {selectedConsult.assessment && (
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-gray-500">Assessment</h3>
                    <p className="text-base whitespace-pre-wrap">{selectedConsult.assessment}</p>
                  </div>
                )}
                
                {selectedConsult.plan && selectedConsult.plan.length > 0 && (
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-gray-500">Plan</h3>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      {selectedConsult.plan.map((item: any, index: number) => (
                        <li key={index} className="text-base">{item.value}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {selectedConsult.prescriptions && selectedConsult.prescriptions.length > 0 && (
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Prescriptions</h3>
                    <div className="space-y-2">
                      {selectedConsult.prescriptions.map((rx: any, index: number) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-md">
                          <p className="font-medium text-medical-primary">{rx.name}</p>
                          <p className="text-sm">{rx.dosage}, {rx.route}, {rx.frequency}, for {rx.duration}</p>
                          {rx.instructions && <p className="text-sm text-gray-600 mt-1">{rx.instructions}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleEditConsult(selectedConsult.id);
                  }}
                >
                  Edit
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Edit Consult Modal */}
      {selectedConsult && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-[90vw] md:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Consultation</DialogTitle>
              <DialogDescription>
                Update the consultation record for {selectedConsult.patient_name}
              </DialogDescription>
            </DialogHeader>
            
            <ConsultForm
              patientId={selectedConsult.patient_id}
              onSave={handleUpdateConsult}
              onCancel={() => setIsEditModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this consultation record. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Consults;
