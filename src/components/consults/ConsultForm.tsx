import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Custom Components
import ICD10Input from '@/components/medical/ICD10Input';
import VitalsForm from './VitalsForm';
import ObjectiveSection from './ObjectiveSection';
import PlanSection from './PlanSection';
import PrescriptionSection from './PrescriptionSection';
import { Drug, Prescription } from '@/types/clinicalTables';
import { ICD10Code } from '@/components/medical/ICD10Input';
import { VitalSigns } from '@/components/consults/VitalsForm';

// Form schema validation
const ConsultFormSchema = z.object({
  date: z.date({
    required_error: "Consultation date is required",
  }),
  time: z.string().min(1, { message: "Time is required" }),
  patient_id: z.string().min(1, { message: "Patient selection is required" }),
  patient_type: z.string().min(1, { message: "Patient type is required" }),
  chief_complaint: z.string().min(1, { message: "Chief complaint is required" }),
  subjective: z.string().min(1, { message: "Subjective notes are required" }),
  attending_physician: z.string().min(1, { message: "Attending physician is required" }),
  attending_nurse: z.string().optional(),
  bp_monitoring: z.boolean().default(false),
  hba1c_monitoring: z.boolean().default(false),
  
  // These will be handled separately
  vital_signs: z.object({
    systolicBP: z.number().nullable().optional(),
    diastolicBP: z.number().nullable().optional(),
    temperature: z.number().nullable().optional(),
    heartRate: z.number().nullable().optional(),
    respiratoryRate: z.number().nullable().optional(),
    oxygenSaturation: z.number().nullable().optional(),
    height: z.number().nullable().optional(),
    weight: z.number().nullable().optional(),
  }).optional(),
});

type ConsultFormValues = z.infer<typeof ConsultFormSchema>;

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
  // Form and state setup
  const form = useForm<ConsultFormValues>({
    resolver: zodResolver(ConsultFormSchema),
    defaultValues: {
      date: new Date(),
      time: format(new Date(), 'HH:mm'),
      patient_id: '',
      patient_type: '',
      chief_complaint: '',
      subjective: '',
      attending_physician: '',
      attending_nurse: '',
      bp_monitoring: false,
      hba1c_monitoring: false,
    },
  });
  
  // State for data that doesn't easily fit in react-hook-form
  const [objectives, setObjectives] = useState<ObjectiveItem[]>([]);
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [assessment, setAssessment] = useState<string>('');
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState<boolean>(false);
  
  // Data loading states
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState<boolean>(true);
  const [medicalStaff, setMedicalStaff] = useState<StaffOption[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState<boolean>(true);
  
  const { toast } = useToast();
  const { currentUser } = useAuth();

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
              form.setValue('attending_physician', currentUser.id);
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
  }, [toast, currentUser, form]);

  // Prescription handlers
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

  const handleVitalsChange = (vitalsData: VitalSigns) => {
    form.setValue('vital_signs', vitalsData);
  };

  // Function to handle ICD10 code selection
  const handleICD10Select = (code: ICD10Code) => {
    setAssessment(prev => 
      `${prev ? prev + '\n' : ''}${code.code} - ${code.description}`
    );
  };

  // Form submission
  const onSubmit = (data: ConsultFormValues) => {
    try {
      // Format data for Supabase
      const consultData = {
        ...data,
        date: format(data.date, 'yyyy-MM-dd'),
        objective: objectives.map(obj => obj.value),
        assessment: assessment.split('\n').filter(line => line.trim().length > 0),
        plan: plans.map(plan => plan.value),
        prescription: prescriptions.map(rx => ({
          drug: rx.drug.name,
          form: rx.form,
          strength: rx.strength,
          quantity: rx.quantity,
          instructions: rx.instructions,
          indication: rx.indication,
          brand: rx.brand
        })),
        created_by: currentUser?.id || '',
      };
      
      onSave(consultData);
    } catch (error: any) {
      console.error("Error creating consultation:", error);
      toast({
        title: "Error",
        description: error.message || "There was an error creating the consultation",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Date & Time Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
                    <FormControl>
              <Button
                variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
                    </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                initialFocus
              />
            </PopoverContent>
          </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Patient Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="patient_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Patient</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoadingPatients}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
            </SelectTrigger>
                  </FormControl>
            <SelectContent>
                    {isLoadingPatients ? (
                      <div className="flex items-center justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="ml-2">Loading...</span>
                      </div>
                    ) : (
                      patients.map(patient => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name}
                        </SelectItem>
                      ))
                    )}
            </SelectContent>
          </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="patient_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Patient Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient type" />
          </SelectTrigger>
                  </FormControl>
          <SelectContent>
                    <SelectItem value="new">New Patient</SelectItem>
                    <SelectItem value="follow_up">Follow-up</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="chronic">Chronic Care</SelectItem>
          </SelectContent>
        </Select>
                <FormMessage />
              </FormItem>
            )}
        />
      </div>
      
        {/* Chief Complaint & Subjective */}
        <FormField
          control={form.control}
          name="chief_complaint"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chief Complaint</FormLabel>
              <FormControl>
                <Input placeholder="Primary reason for visit" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="subjective"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subjective</FormLabel>
              <FormControl>
        <Textarea 
                  placeholder="Patient's description of symptoms and history" 
                  className="min-h-32"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Vitals */}
        <div className="p-4 border rounded-md">
          <h3 className="text-lg font-semibold mb-4">Vital Signs</h3>
          <VitalsForm onChange={handleVitalsChange} />
      </div>
      
        {/* Objective Findings */}
        <div className="p-4 border rounded-md">
          <h3 className="text-lg font-semibold mb-4">Objective Findings</h3>
      <ObjectiveSection 
        objectives={objectives}
        setObjectives={setObjectives}
      />
        </div>
      
        {/* Assessment */}
        <div className="p-4 border rounded-md">
          <h3 className="text-lg font-semibold mb-4">Assessment</h3>
      <div className="space-y-2">
            <Textarea 
              value={assessment}
              onChange={(e) => setAssessment(e.target.value)}
              placeholder="Diagnostic assessment"
              className="min-h-32"
            />
            <div className="text-xs text-muted-foreground">
              Enter assessment, each line will be treated as a separate item
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="text-md font-medium mb-2">ICD-10 Code Lookup</h4>
        <ICD10Input 
              onSelect={(code: ICD10Code) => {
                setAssessment(prev => 
                  `${prev ? prev + '\n' : ''}${code.code} - ${code.description}`
                );
              }}
            />
          </div>
      </div>
      
        {/* Plan */}
        <div className="p-4 border rounded-md">
          <h3 className="text-lg font-semibold mb-4">Plan</h3>
      <PlanSection
        plans={plans}
        setPlans={setPlans}
      />
        </div>
      
        {/* Prescription */}
        <div className="p-4 border rounded-md">
          <h3 className="text-lg font-semibold mb-4">Prescriptions</h3>
      <PrescriptionSection
        prescriptions={prescriptions}
            onDrugSelect={handleDrugSelect}
        onSave={handleSavePrescription}
        onCancel={handleCancelPrescription}
        onRemove={handleRemovePrescription}
            selectedDrug={selectedDrug}
            showPrescriptionForm={showPrescriptionForm}
          />
        </div>
        
        {/* Medical Staff */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="attending_physician"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Attending Physician</FormLabel>
          <Select 
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoadingStaff}
          >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select physician" />
            </SelectTrigger>
                  </FormControl>
            <SelectContent>
                    {isLoadingStaff ? (
                      <div className="flex items-center justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="ml-2">Loading...</span>
                      </div>
                    ) : (
                      medicalStaff
                        .filter(staff => ['doctor', 'admin'].includes(staff.role))
                        .map(staff => (
                          <SelectItem key={staff.id} value={staff.id}>
                            {staff.name} ({staff.role})
                          </SelectItem>
                        ))
                    )}
            </SelectContent>
          </Select>
                <FormMessage />
              </FormItem>
            )}
          />
      
          <FormField
            control={form.control}
            name="attending_nurse"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Attending Nurse</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoadingStaff}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select nurse (optional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isLoadingStaff ? (
                      <div className="flex items-center justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="ml-2">Loading...</span>
          </div>
                    ) : (
                      medicalStaff
                        .filter(staff => ['nurse', 'admin'].includes(staff.role))
                        .map(staff => (
                          <SelectItem key={staff.id} value={staff.id}>
                            {staff.name} ({staff.role})
                          </SelectItem>
                        ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Monitoring */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="bp_monitoring"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Blood Pressure Monitoring</FormLabel>
                  <FormDescription>
                    Recommend regular blood pressure monitoring
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="hba1c_monitoring"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>HbA1c Monitoring</FormLabel>
                  <FormDescription>
                    Recommend regular HbA1c monitoring
                  </FormDescription>
          </div>
              </FormItem>
            )}
          />
      </div>
      
        {/* Form Actions */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
          <Button type="submit">Save Consultation</Button>
      </div>
      </form>
    </Form>
  );
};

export default ConsultForm;
