import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

import ICD10Input from '@/components/medical/ICD10Input';
import { Drug, Prescription } from '@/types/clinicalTables';
import VitalsForm from './VitalsForm';
import ObjectiveSection from './ObjectiveSection';
import PlanSection from './PlanSection';
import PrescriptionSection from './PrescriptionSection';

interface ObjectiveItem {
  id: string;
  value: string;
}

interface PlanItem {
  id: string;
  value: string;
}

interface PatientOption {
  id: string;
  name: string;
}

interface StaffOption {
  id: string;
  name: string;
  role: string;
}

interface ConsultFormProps {
  onSave: (consultData: any) => void;
  onCancel: () => void;
}

const ConsultForm = ({ onSave, onCancel }: ConsultFormProps) => {
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
  const [plans, setPlans] = useState<PlanItem[]>([]);
  
  const [attendingNurse, setAttendingNurse] = useState<string>('');
  const [attendingPhysician, setAttendingPhysician] = useState<string>('');
  const [bpMonitoring, setBpMonitoring] = useState<boolean>(false);
  const [hba1cMonitoring, setHba1cMonitoring] = useState<boolean>(false);
  
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState<boolean>(true);
  
  const [medicalStaff, setMedicalStaff] = useState<StaffOption[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState<boolean>(true);

  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState<boolean>(false);
  
  const { toast } = useToast();
  const { currentUser } = useAuth();

  // Set current time on component mount with correct format
  useEffect(() => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    setTime(`${hours}:${minutes}`);
  }, []);

  // Fetch patients from Supabase
  useEffect(() => {
    const fetchPatients = async () => {
      setIsLoadingPatients(true);
      try {
        const { data, error } = await supabase
          .from('patients')
          .select('id, name')
          .order('name', { ascending: true });
          
        if (error) throw error;
        
        if (data) {
          setPatients(data);
        }
      } catch (error: any) {
        console.error("Error fetching patients:", error);
        toast({
          title: "Error",
          description: "Failed to load patients data",
          variant: "destructive"
        });
      } finally {
        setIsLoadingPatients(false);
      }
    };
    
    fetchPatients();
  }, [toast]);

  // Fetch medical staff from profiles table - filtered by role
  useEffect(() => {
    const fetchMedicalStaff = async () => {
      setIsLoadingStaff(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, role')
          .in('role', ['doctor', 'nurse', 'admin', 'staff'])
          .order('name', { ascending: true });
          
        if (error) throw error;
        
        if (data) {
          setMedicalStaff(data);
          
          // Set current user as attending physician if they are a doctor or admin
          if (currentUser) {
            const currentUserData = data.find(staff => staff.id === currentUser.id);
            if (currentUserData && (currentUserData.role === 'doctor' || currentUserData.role === 'admin')) {
              setAttendingPhysician(currentUser.id);
            }
          }
        }
      } catch (error: any) {
        console.error("Error fetching medical staff:", error);
        toast({
          title: "Error",
          description: "Failed to load medical staff data",
          variant: "destructive"
        });
      } finally {
        setIsLoadingStaff(false);
      }
    };
    
    fetchMedicalStaff();
  }, [toast, currentUser]);

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

  const handleDrugSelect = (drug: Drug) => {
    setSelectedDrug(drug);
    setShowPrescriptionForm(true);
  };

  const handleVitalsChange = (field: string, value: string) => {
    switch(field) {
      case 'sbp': setSbp(value); break;
      case 'dbp': setDbp(value); break;
      case 'temp': setTemp(value); break;
      case 'pr': setPr(value); break;
      case 'rr': setRr(value); break;
      case 'spo2': setSpo2(value); break;
      case 'height': setHeight(value); break;
      case 'weight': setWeight(value); break;
    }
  };
  
  const handleSubmit = () => {
    try {
      if (!patient) {
        toast({
          title: "Missing Patient",
          description: "Please select a patient for this consultation",
          variant: "destructive"
        });
        return;
      }
      
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
        created_by: currentUser?.id || ''
      };
      
      onSave(consultData);
    } catch (error: any) {
      console.error("Error creating consultation:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create consultation",
        variant: "destructive"
      });
    }
  };

  // Filter medical staff by role
  const physicians = medicalStaff.filter(staff => 
    staff.role === 'doctor' || staff.role === 'admin'
  );
  
  const nurses = medicalStaff.filter(staff => 
    staff.role === 'nurse' || staff.role === 'staff'
  );
  
  return (
    
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
            <SelectValue placeholder={isLoadingPatients ? "Loading patients..." : "Select patient"} />
          </SelectTrigger>
          <SelectContent>
            {patients.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
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
      
      <VitalsForm
        sbp={sbp}
        dbp={dbp}
        temp={temp}
        pr={pr}
        rr={rr}
        spo2={spo2}
        height={height}
        weight={weight}
        onChange={handleVitalsChange}
      />
      
      <div className="space-y-2">
        <label htmlFor="subjective" className="block text-sm font-medium">Subjective</label>
        <Textarea 
          id="subjective" 
          className="w-full h-20" 
          value={subjective}
          onChange={e => setSubjective(e.target.value)}
        />
      </div>
      
      <ObjectiveSection 
        objectives={objectives}
        setObjectives={setObjectives}
      />
      
      <div className="space-y-2">
        <label className="block text-sm font-medium">Assessment (ICD-10 Codes)</label>
        <ICD10Input 
          value={assessment} 
          onChange={setAssessment} 
          placeholder="Search and select ICD-10 codes..."
          minHeight="120px"
        />
        <p className="text-xs text-muted-foreground">
          Search and click to select ICD-10 codes
        </p>
      </div>
      
      <PlanSection
        plans={plans}
        setPlans={setPlans}
      />
      
      <PrescriptionSection
        showPrescriptionForm={showPrescriptionForm}
        selectedDrug={selectedDrug}
        prescriptions={prescriptions}
        onSave={handleSavePrescription}
        onCancel={handleCancelPrescription}
        onRemove={handleRemovePrescription}
        onDrugSelect={handleDrugSelect}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="attendingNurse" className="block text-sm font-medium">Attending Nurse</label>
          <Select value={attendingNurse} onValueChange={setAttendingNurse}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={isLoadingStaff ? "Loading nurses..." : "Select nurse"} />
            </SelectTrigger>
            <SelectContent>
              {nurses.map((nurse) => (
                <SelectItem key={nurse.id} value={nurse.id}>{nurse.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="attendingPhysician" className="block text-sm font-medium">Attending Physician</label>
          <Select 
            value={attendingPhysician} 
            onValueChange={setAttendingPhysician}
            defaultValue={currentUser?.id}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={isLoadingStaff ? "Loading physicians..." : "Select physician"} />
            </SelectTrigger>
            <SelectContent>
              {physicians.map((physician) => (
                <SelectItem key={physician.id} value={physician.id}>{physician.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
      
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          className="bg-medical-primary hover:bg-medical-primary/90"
        >
          Save Consultation
        </Button>
      </div>
    </div>
  );
};

export default ConsultForm;
