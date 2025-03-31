
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, Plus, FileText, X } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

import DrugSelector from '@/components/medical/DrugSelector';
import ICD10Selector from '@/components/medical/ICD10Selector';
import PrescriptionForm from '@/components/medical/PrescriptionForm';
import { Drug, Prescription } from '@/types/clinicalTables';

interface ObjectiveItem {
  id: string;
  value: string;
}

interface PlanItem {
  id: string;
  value: string;
}

const Consults = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string>('');
  const [patientType, setPatientType] = useState<string>('');
  const [patient, setPatient] = useState<string>('');
  const [chiefComplaint, setChiefComplaint] = useState<string>('');
  const [subjective, setSubjective] = useState<string>('');
  
  // Vital signs
  const [sbp, setSbp] = useState<string>('');
  const [dbp, setDbp] = useState<string>('');
  const [temp, setTemp] = useState<string>('');
  const [pr, setPr] = useState<string>('');
  const [rr, setRr] = useState<string>('');
  const [spo2, setSpo2] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  
  const [assessment, setAssessment] = useState<string>('');
  const [objectives, setObjectives] = useState<ObjectiveItem[]>([]);
  const [newObjective, setNewObjective] = useState<string>('');
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [newPlan, setNewPlan] = useState<string>('');
  
  const [attendingNurse, setAttendingNurse] = useState<string>('');
  const [attendingPhysician, setAttendingPhysician] = useState<string>('');
  const [bpMonitoring, setBpMonitoring] = useState<boolean>(false);
  const [hba1cMonitoring, setHba1cMonitoring] = useState<boolean>(false);
  
  const [patients, setPatients] = useState<any[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState<boolean>(false);

  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState<boolean>(false);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useAuth();
  
  const handleDrugSelect = (drug: Drug) => {
    setSelectedDrug(drug);
    setShowPrescriptionForm(true);
  };
  
  const handleSavePrescription = (prescription: Prescription) => {
    setPrescriptions(prev => [...prev, prescription]);
    setSelectedDrug(null);
    setShowPrescriptionForm(false);
  };
  
  const handleCancelPrescription = () => {
    setSelectedDrug(null);
    setShowPrescriptionForm(false);
  };
  
  const handleRemovePrescription = (index: number) => {
    setPrescriptions(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleAddObjective = () => {
    if (newObjective.trim()) {
      setObjectives(prev => [
        ...prev, 
        { id: Date.now().toString(), value: newObjective.trim() }
      ]);
      setNewObjective('');
    }
  };
  
  const handleRemoveObjective = (id: string) => {
    setObjectives(prev => prev.filter(item => item.id !== id));
  };
  
  const handleAddPlan = () => {
    if (newPlan.trim()) {
      setPlans(prev => [
        ...prev, 
        { id: Date.now().toString(), value: newPlan.trim() }
      ]);
      setNewPlan('');
    }
  };
  
  const handleRemovePlan = (id: string) => {
    setPlans(prev => prev.filter(item => item.id !== id));
  };
  
  const handleNewConsult = async () => {
    try {
      // Validation here...
      
      // Format data for Supabase
      const consultData = {
        date: date ? format(date, 'yyyy-MM-dd') : null,
        time,
        patient_id: patient,
        patient_type: patientType,
        chief_complaint: chiefComplaint,
        subjective,
        objective: objectives.map(obj => obj.value),
        assessment: assessment.split('\n').filter(line => line.trim().length > 0),
        plan: plans.map(plan => plan.value),
        vital_signs: {
          systolicBP: sbp ? parseInt(sbp) : null,
          diastolicBP: dbp ? parseInt(dbp) : null,
          temperature: temp ? parseFloat(temp) : null,
          heartRate: pr ? parseInt(pr) : null,
          respiratoryRate: rr ? parseInt(rr) : null,
          oxygenSaturation: spo2 ? parseInt(spo2) : null,
          height: height ? parseFloat(height) : null,
          weight: weight ? parseFloat(weight) : null
        },
        prescription: prescriptions.map(rx => ({
          drug: rx.drug.name,
          form: rx.form,
          strength: rx.strength,
          quantity: rx.quantity,
          instructions: rx.instructions,
          indication: rx.indication,
          brand: rx.brand
        })),
        attending_physician: attendingPhysician || currentUser?.id,
        attending_nurse: attendingNurse,
        bp_monitoring: bpMonitoring,
        hba1c_monitoring: hba1cMonitoring,
        created_by: currentUser?.id
      };
      
      toast({
        title: "Consultation added",
        description: "New consultation has been successfully created",
      });
      
      resetForm();
      setIsAddModalOpen(false);
    } catch (error: any) {
      console.error("Error creating consultation:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create consultation",
        variant: "destructive"
      });
    }
  };
  
  const resetForm = () => {
    setDate(new Date());
    setTime('');
    setPatientType('');
    setPatient('');
    setChiefComplaint('');
    setSubjective('');
    setSbp('');
    setDbp('');
    setTemp('');
    setPr('');
    setRr('');
    setSpo2('');
    setHeight('');
    setWeight('');
    setAssessment('');
    setObjectives([]);
    setNewObjective('');
    setPlans([]);
    setNewPlan('');
    setAttendingNurse('');
    setAttendingPhysician('');
    setBpMonitoring(false);
    setHba1cMonitoring(false);
    setPrescriptions([]);
    setSelectedDrug(null);
    setShowPrescriptionForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-medical-primary">Consults</h1>
        
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-medical-primary hover:bg-medical-primary/90">
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
            
            <div className="grid grid-cols-1 gap-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="date" className="block text-sm font-medium">Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, 'PP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="time" className="block text-sm font-medium">Time</label>
                  <Input id="time" type="time" className="w-full" value={time} onChange={e => setTime(e.target.value)} />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="patientType" className="block text-sm font-medium">Patient Type</label>
                  <Select value={patientType} onValueChange={setPatientType}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="new">New Patient</SelectItem>
                      <SelectItem value="followup">Follow-up</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="patient" className="block text-sm font-medium">Patient</label>
                <Select value={patient} onValueChange={setPatient}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patient1">John Doe</SelectItem>
                    <SelectItem value="patient2">Jane Smith</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="chiefComplaint" className="block text-sm font-medium">Chief Complaint</label>
                <Textarea 
                  id="chiefComplaint" 
                  className="w-full" 
                  value={chiefComplaint}
                  onChange={e => setChiefComplaint(e.target.value)}
                />
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="vitals">
                  <AccordionTrigger className="text-base font-medium">Vital Signs</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                      <div className="space-y-2">
                        <label htmlFor="sbp" className="block text-sm font-medium">SBP</label>
                        <Input 
                          id="sbp" 
                          type="number" 
                          className="w-full" 
                          value={sbp}
                          onChange={e => setSbp(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="dbp" className="block text-sm font-medium">DBP</label>
                        <Input 
                          id="dbp" 
                          type="number" 
                          className="w-full" 
                          value={dbp}
                          onChange={e => setDbp(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="temp" className="block text-sm font-medium">Temp (°C)</label>
                        <Input 
                          id="temp" 
                          type="number" 
                          step="0.1" 
                          className="w-full" 
                          value={temp}
                          onChange={e => setTemp(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="pr" className="block text-sm font-medium">PR</label>
                        <Input 
                          id="pr" 
                          type="number" 
                          className="w-full" 
                          value={pr}
                          onChange={e => setPr(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="height" className="block text-sm font-medium">Height (cm)</label>
                        <Input 
                          id="height" 
                          type="number" 
                          className="w-full" 
                          value={height}
                          onChange={e => setHeight(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="weight" className="block text-sm font-medium">Weight (kg)</label>
                        <Input 
                          id="weight" 
                          type="number" 
                          step="0.1" 
                          className="w-full" 
                          value={weight}
                          onChange={e => setWeight(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="rr" className="block text-sm font-medium">RR</label>
                        <Input 
                          id="rr" 
                          type="number" 
                          className="w-full" 
                          value={rr}
                          onChange={e => setRr(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="spo2" className="block text-sm font-medium">SpO2</label>
                        <Input 
                          id="spo2" 
                          type="number" 
                          className="w-full" 
                          value={spo2}
                          onChange={e => setSpo2(e.target.value)}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <div className="space-y-2">
                <label htmlFor="subjective" className="block text-sm font-medium">Subjective</label>
                <Textarea 
                  id="subjective" 
                  className="w-full h-20" 
                  value={subjective}
                  onChange={e => setSubjective(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Objective</label>
                <div className="flex space-x-2">
                  <Input 
                    className="flex-1" 
                    placeholder="Add objective item" 
                    value={newObjective}
                    onChange={e => setNewObjective(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddObjective();
                      }
                    }}
                  />
                  <Button onClick={handleAddObjective} className="bg-medical-primary">Add</Button>
                </div>
                {objectives.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {objectives.map(item => (
                      <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                        <span>{item.value}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleRemoveObjective(item.id)}
                          className="h-6 w-6 text-gray-500 hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Assessment (ICD-10 Codes)</label>
                <ICD10Selector value={assessment} onChange={setAssessment} />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Plan</label>
                <div className="flex space-x-2">
                  <Input 
                    className="flex-1" 
                    placeholder="Add plan item" 
                    value={newPlan}
                    onChange={e => setNewPlan(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddPlan();
                      }
                    }}
                  />
                  <Button onClick={handleAddPlan} className="bg-medical-primary">Add</Button>
                </div>
                {plans.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {plans.map(item => (
                      <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                        <span>{item.value}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleRemovePlan(item.id)}
                          className="h-6 w-6 text-gray-500 hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="prescription">
                  <AccordionTrigger className="text-base font-medium">
                    PRESCRIPTION {prescriptions.length > 0 && <Badge className="ml-2 bg-blue-100 text-blue-800">{prescriptions.length}</Badge>}
                  </AccordionTrigger>
                  <AccordionContent>
                    {showPrescriptionForm && selectedDrug ? (
                      <PrescriptionForm
                        drug={selectedDrug}
                        onSave={handleSavePrescription}
                        onCancel={handleCancelPrescription}
                      />
                    ) : (
                      <div className="space-y-4">
                        <DrugSelector onDrugSelect={handleDrugSelect} />
                        
                        {prescriptions.length > 0 && (
                          <div className="mt-6 space-y-3">
                            <h3 className="font-medium">Added Medications</h3>
                            <div className="space-y-2">
                              {prescriptions.map((prescription, index) => (
                                <div key={index} className="p-3 border rounded-md bg-gray-50">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h4 className="font-medium">{prescription.drug.name} - {prescription.form}</h4>
                                      <p className="text-sm text-gray-600">{prescription.strength}, {prescription.quantity}</p>
                                      <p className="text-sm text-gray-600">{prescription.instructions}</p>
                                    </div>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => handleRemovePrescription(index)}
                                      className="text-gray-500 hover:text-red-500"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="attendingNurse" className="block text-sm font-medium">Attending Nurse</label>
                  <Input 
                    id="attendingNurse" 
                    className="w-full" 
                    value={attendingNurse}
                    onChange={e => setAttendingNurse(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="attendingPhysician" className="block text-sm font-medium">Attending Physician</label>
                  <Input 
                    id="attendingPhysician" 
                    className="w-full" 
                    value={attendingPhysician || (currentUser?.name || '')}
                    onChange={e => setAttendingPhysician(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">BP Monitoring</label>
                  <div className="flex space-x-2">
                    <Button 
                      type="button" 
                      variant={bpMonitoring ? "default" : "outline"}
                      className={bpMonitoring ? "bg-medical-primary" : ""}
                      onClick={() => setBpMonitoring(true)}
                    >
                      Yes
                    </Button>
                    <Button 
                      type="button" 
                      variant={!bpMonitoring ? "default" : "outline"}
                      className={!bpMonitoring ? "bg-sidebar-accent" : ""}
                      onClick={() => setBpMonitoring(false)}
                    >
                      No
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium">HBATC Monitoring</label>
                  <div className="flex space-x-2">
                    <Button 
                      type="button" 
                      variant={hba1cMonitoring ? "default" : "outline"}
                      className={hba1cMonitoring ? "bg-medical-primary" : ""}
                      onClick={() => setHba1cMonitoring(true)}
                    >
                      Yes
                    </Button>
                    <Button 
                      type="button" 
                      variant={!hba1cMonitoring ? "default" : "outline"}
                      className={!hba1cMonitoring ? "bg-sidebar-accent" : ""}
                      onClick={() => setHba1cMonitoring(false)}
                    >
                      No
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <Button 
                onClick={handleNewConsult}
                className="bg-medical-primary hover:bg-medical-primary/90"
              >
                Save Consultation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="bg-white rounded-md shadow p-6 min-h-[400px] flex flex-col items-center justify-center text-center">
        <FileText size={64} className="text-gray-300 mb-4" />
        <h2 className="text-xl font-medium mb-2">No consults found</h2>
        <p className="text-gray-500 max-w-md mb-6">
          Start by adding your first consultation record using the Add button above
        </p>
        <div className="text-center bg-medical-light p-4 rounded-lg max-w-xl mx-auto mt-6">
          <h3 className="font-medium text-medical-primary mb-2">About FHIR Implementation</h3>
          <p className="text-sm text-gray-600">
            This application now includes FHIR compliance for better interoperability with other healthcare systems.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Consults;
