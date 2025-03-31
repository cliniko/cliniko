
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';

interface VitalsFormProps {
  sbp: string;
  dbp: string;
  temp: string;
  pr: string;
  rr: string;
  spo2: string;
  height: string;
  weight: string;
  onChange: (field: string, value: string) => void;
}

const VitalsForm = ({
  sbp,
  dbp,
  temp,
  pr,
  rr,
  spo2,
  height,
  weight,
  onChange
}: VitalsFormProps) => {
  return (
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
                onChange={e => onChange('sbp', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="dbp" className="block text-sm font-medium">DBP</label>
              <Input 
                id="dbp" 
                type="number" 
                className="w-full" 
                value={dbp}
                onChange={e => onChange('dbp', e.target.value)}
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
                onChange={e => onChange('temp', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="pr" className="block text-sm font-medium">PR</label>
              <Input 
                id="pr" 
                type="number" 
                className="w-full" 
                value={pr}
                onChange={e => onChange('pr', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="height" className="block text-sm font-medium">Height (cm)</label>
              <Input 
                id="height" 
                type="number" 
                className="w-full" 
                value={height}
                onChange={e => onChange('height', e.target.value)}
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
                onChange={e => onChange('weight', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="rr" className="block text-sm font-medium">RR</label>
              <Input 
                id="rr" 
                type="number" 
                className="w-full" 
                value={rr}
                onChange={e => onChange('rr', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="spo2" className="block text-sm font-medium">SpO2</label>
              <Input 
                id="spo2" 
                type="number" 
                className="w-full" 
                value={spo2}
                onChange={e => onChange('spo2', e.target.value)}
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default VitalsForm;
