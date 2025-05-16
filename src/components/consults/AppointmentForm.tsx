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
import { AppointmentSubmission } from '@/types';

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
import VitalsForm from './VitalsForm';
import ObjectiveSection from './ObjectiveSection';
import { VitalSigns } from '@/components/consults/VitalsForm';

// Form schema validation
const AppointmentFormSchema = z.object({
  appointment_date: z.date({
    required_error: "Appointment date is required",
  }),
  appointment_time: z.string().min(1, { message: "Time is required" }),
  patient_id: z.string().min(1, { message: "Patient selection is required" }),
  chief_complaint: z.string().min(1, { message: "Chief complaint is required" }),
  subjective: z.string().min(1, { message: "Subjective notes are required" }),
  attending_nurse: z.string().min(1, { message: "Attending nurse is required" }),
  
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

type AppointmentFormValues = z.infer<typeof AppointmentFormSchema>;

interface ObjectiveItem {
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

interface AppointmentFormProps {
  patientId?: string | null;
  onSave: (appointmentData: AppointmentSubmission) => void;
  onCancel: () => void;
}

const AppointmentForm = ({ patientId, onSave, onCancel }: AppointmentFormProps) => {
  // Form and state setup
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(AppointmentFormSchema),
    defaultValues: {
      appointment_date: new Date(),
      appointment_time: format(new Date(), 'HH:mm'),
      patient_id: patientId || '',
      chief_complaint: '',
      subjective: '',
      attending_nurse: '',
    },
  });
  
  // State for data that doesn't easily fit in react-hook-form
  const [objectives, setObjectives] = useState<ObjectiveItem[]>([]);
  
  // Data loading states
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState<boolean>(true);
  const [nurseStaff, setNurseStaff] = useState<StaffOption[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState<boolean>(true);
  
  const { toast } = useToast();
  const { currentUser } = useAuth();

  // Update patient_id when patientId prop changes
  useEffect(() => {
    if (patientId) {
      form.setValue('patient_id', patientId);
    }
  }, [patientId, form]);

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

  // Fetch nurse staff from profiles table - filtered by role
  useEffect(() => {
    const fetchNurseStaff = async () => {
      setIsLoadingStaff(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, role')
          .in('role', ['nurse', 'admin'])
          .order('name', { ascending: true });
          
        if (error) throw error;
        
        if (data) {
          setNurseStaff(data);
          
          // Set current user as attending nurse if they are a nurse or admin
          if (currentUser) {
            const currentUserData = data.find(staff => staff.id === currentUser.id);
            if (currentUserData && (currentUserData.role === 'nurse' || currentUserData.role === 'admin')) {
              form.setValue('attending_nurse', currentUser.id);
            }
          }
        }
      } catch (error: any) {
        console.error("Error fetching nurse staff:", error);
        toast({
          title: "Error",
          description: "Failed to load nurse staff data",
          variant: "destructive"
        });
      } finally {
        setIsLoadingStaff(false);
      }
    };
    
    fetchNurseStaff();
  }, [toast, currentUser, form]);

  const handleVitalsChange = (vitalsData: VitalSigns) => {
    form.setValue('vital_signs', vitalsData);
  };

  // Form submission
  const onSubmit = (data: AppointmentFormValues) => {
    try {
      // Format data for Supabase
      const appointmentData: AppointmentSubmission = {
        patient_id: data.patient_id,
        appointment_date: format(data.appointment_date, 'yyyy-MM-dd'),
        appointment_time: data.appointment_time,
        chief_complaint: data.chief_complaint,
        subjective: data.subjective,
        objective: objectives.map(obj => obj.value),
        attending_nurse: data.attending_nurse,
        vital_signs: data.vital_signs || null,
        status: 'scheduled',
        consultation_id: null,
        created_by: currentUser?.id || ''
      };
      
      onSave(appointmentData);
    } catch (error: any) {
      console.error("Error creating appointment:", error);
      toast({
        title: "Error",
        description: error.message || "There was an error scheduling the appointment",
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
            name="appointment_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Appointment Date</FormLabel>
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
                        date < new Date() || date < new Date("1900-01-01")
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
            name="appointment_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Appointment Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Patient Information */}
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="patient_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Patient</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isLoadingPatients || !!patientId}
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
        </div>
        
        {/* Chief Complaint */}
        <FormField
          control={form.control}
          name="chief_complaint"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chief Complaint</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Primary reason for appointment" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Subjective */}
        <FormField
          control={form.control}
          name="subjective"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subjective Findings</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Patient's description of symptoms and concerns" 
                  className="min-h-24"
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
        
        {/* Nurse Information */}
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="attending_nurse"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Attending Nurse</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isLoadingStaff}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select nurse" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isLoadingStaff ? (
                      <div className="flex items-center justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="ml-2">Loading...</span>
                      </div>
                    ) : (
                      nurseStaff.map(staff => (
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
        
        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-700 hover:bg-blue-800">
            Schedule Appointment
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AppointmentForm; 