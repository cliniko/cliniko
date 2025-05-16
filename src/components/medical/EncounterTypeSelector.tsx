import { useState, useEffect } from 'react';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Control } from 'react-hook-form';
import { EncounterType, ConsultationReference } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface EncounterTypeSelectorProps {
  control: Control<any>;
  patientId: string;
  defaultEncounterType?: EncounterType;
  defaultReferenceId?: string | null;
}

export default function EncounterTypeSelector({ 
  control, 
  patientId,
  defaultEncounterType = EncounterType.NEW_CONSULT,
  defaultReferenceId = null
}: EncounterTypeSelectorProps) {
  const [selectedType, setSelectedType] = useState<EncounterType>(defaultEncounterType);
  const [previousConsultations, setPreviousConsultations] = useState<ConsultationReference[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch previous consultations when patient ID changes or when FOLLOW_UP is selected
  useEffect(() => {
    const fetchPreviousConsultations = async () => {
      if (!patientId || selectedType !== EncounterType.FOLLOW_UP) return;
      
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('consultations')
          .select('id, date, chief_complaint')
          .eq('patient_id', patientId)
          .eq('is_archived', false)
          .order('date', { ascending: false })
          .limit(20);
          
        if (error) throw error;
        
        const formattedConsults: ConsultationReference[] = data?.map(consult => ({
          id: consult.id,
          date: consult.date,
          chiefComplaint: consult.chief_complaint
        })) || [];
        
        setPreviousConsultations(formattedConsults);
      } catch (error) {
        console.error('Error fetching previous consultations:', error);
        setPreviousConsultations([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPreviousConsultations();
  }, [patientId, selectedType]);

  const formatConsultationOption = (consult: ConsultationReference) => {
    try {
      const formattedDate = format(new Date(consult.date), 'yyyy-MM-dd');
      return `${formattedDate}: ${consult.chiefComplaint}`;
    } catch (e) {
      return `${consult.date}: ${consult.chiefComplaint}`;
    }
  };

  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="encounterType"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Encounter Type</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={(value) => {
                  setSelectedType(value as EncounterType);
                  field.onChange(value);
                }}
                defaultValue={field.value || defaultEncounterType}
                className="flex flex-wrap gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value={EncounterType.NEW_CONSULT} 
                    id="new-consult" 
                  />
                  <Label htmlFor="new-consult" className="cursor-pointer">New Consult</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value={EncounterType.FOLLOW_UP} 
                    id="follow-up" 
                  />
                  <Label htmlFor="follow-up" className="cursor-pointer">Follow-up</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value={EncounterType.EMERGENCY} 
                    id="emergency" 
                  />
                  <Label htmlFor="emergency" className="cursor-pointer">Emergency</Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {selectedType === EncounterType.FOLLOW_UP && (
        <FormField
          control={control}
          name="referenceConsultationId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reference Consultation</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value || defaultReferenceId || undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={
                      isLoading 
                        ? "Loading previous consultations..." 
                        : "Select a previous consultation"
                    } />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {previousConsultations.map(consult => (
                    <SelectItem key={consult.id} value={consult.id}>
                      {formatConsultationOption(consult)}
                    </SelectItem>
                  ))}
                  {previousConsultations.length === 0 && !isLoading && (
                    <SelectItem value="none" disabled>
                      No previous consultations found
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
} 