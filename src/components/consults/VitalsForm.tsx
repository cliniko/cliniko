import { useState, useEffect } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';

export interface VitalSigns {
  systolicBP: number | null;
  diastolicBP: number | null;
  temperature: number | null;
  heartRate: number | null;
  respiratoryRate: number | null;
  oxygenSaturation: number | null;
  height: number | null;
  weight: number | null;
}

interface VitalsFormProps {
  sbp?: string;
  dbp?: string;
  temp?: string;
  pr?: string;
  rr?: string;
  spo2?: string;
  height?: string;
  weight?: string;
  vitals?: VitalSigns;
  onChange: ((field: string, value: string) => void) | ((vitals: VitalSigns) => void);
}

const VitalsForm = ({
  sbp: externalSbp = '',
  dbp: externalDbp = '',
  temp: externalTemp = '',
  pr: externalPr = '',
  rr: externalRr = '',
  spo2: externalSpo2 = '',
  height: externalHeight = '',
  weight: externalWeight = '',
  vitals,
  onChange
}: VitalsFormProps) => {
  // Internal state for the values
  const [sbp, setSbp] = useState(externalSbp);
  const [dbp, setDbp] = useState(externalDbp);
  const [temp, setTemp] = useState(externalTemp);
  const [pr, setPr] = useState(externalPr);
  const [rr, setRr] = useState(externalRr);
  const [spo2, setSpo2] = useState(externalSpo2);
  const [height, setHeight] = useState(externalHeight);
  const [weight, setWeight] = useState(externalWeight);
  
  // Update internal state when props change
  useEffect(() => {
    setSbp(externalSbp);
    setDbp(externalDbp);
    setTemp(externalTemp);
    setPr(externalPr);
    setRr(externalRr);
    setSpo2(externalSpo2);
    setHeight(externalHeight);
    setWeight(externalWeight);
  }, [externalSbp, externalDbp, externalTemp, externalPr, externalRr, externalSpo2, externalHeight, externalWeight]);
  
  // Also update from vitals object if provided
  useEffect(() => {
    if (vitals) {
      if (vitals.systolicBP !== undefined) setSbp(vitals.systolicBP?.toString() || '');
      if (vitals.diastolicBP !== undefined) setDbp(vitals.diastolicBP?.toString() || '');
      if (vitals.temperature !== undefined) setTemp(vitals.temperature?.toString() || '');
      if (vitals.heartRate !== undefined) setPr(vitals.heartRate?.toString() || '');
      if (vitals.respiratoryRate !== undefined) setRr(vitals.respiratoryRate?.toString() || '');
      if (vitals.oxygenSaturation !== undefined) setSpo2(vitals.oxygenSaturation?.toString() || '');
      if (vitals.height !== undefined) setHeight(vitals.height?.toString() || '');
      if (vitals.weight !== undefined) setWeight(vitals.weight?.toString() || '');
    }
  }, [vitals]);
  
  const handleChange = (field: string, value: string) => {
    // Update internal state
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
    
    // Call the appropriate onChange handler
    if (onChange.length === 1) {
      // It's the new function that takes a VitalSigns object
      const newVitals: VitalSigns = {
        systolicBP: sbp ? parseInt(sbp) : null,
        diastolicBP: dbp ? parseInt(dbp) : null,
        temperature: temp ? parseFloat(temp) : null,
        heartRate: pr ? parseInt(pr) : null,
        respiratoryRate: rr ? parseInt(rr) : null,
        oxygenSaturation: spo2 ? parseInt(spo2) : null,
        height: height ? parseFloat(height) : null,
        weight: weight ? parseFloat(weight) : null
      };
      
      // Update the specific field that changed
      switch(field) {
        case 'sbp': newVitals.systolicBP = value ? parseInt(value) : null; break;
        case 'dbp': newVitals.diastolicBP = value ? parseInt(value) : null; break;
        case 'temp': newVitals.temperature = value ? parseFloat(value) : null; break;
        case 'pr': newVitals.heartRate = value ? parseInt(value) : null; break;
        case 'rr': newVitals.respiratoryRate = value ? parseInt(value) : null; break;
        case 'spo2': newVitals.oxygenSaturation = value ? parseInt(value) : null; break;
        case 'height': newVitals.height = value ? parseFloat(value) : null; break;
        case 'weight': newVitals.weight = value ? parseFloat(value) : null; break;
      }
      
      (onChange as (vitals: VitalSigns) => void)(newVitals);
    } else {
      // It's the old function that takes field and value
      (onChange as (field: string, value: string) => void)(field, value);
    }
  };

  return (
    <Accordion type="single" collapsible className="w-full" defaultValue="vitals">
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
                onChange={e => handleChange('sbp', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="dbp" className="block text-sm font-medium">DBP</label>
              <Input 
                id="dbp" 
                type="number" 
                className="w-full" 
                value={dbp}
                onChange={e => handleChange('dbp', e.target.value)}
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
                onChange={e => handleChange('temp', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="pr" className="block text-sm font-medium">PR</label>
              <Input 
                id="pr" 
                type="number" 
                className="w-full" 
                value={pr}
                onChange={e => handleChange('pr', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="height" className="block text-sm font-medium">Height (cm)</label>
              <Input 
                id="height" 
                type="number" 
                className="w-full" 
                value={height}
                onChange={e => handleChange('height', e.target.value)}
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
                onChange={e => handleChange('weight', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="rr" className="block text-sm font-medium">RR</label>
              <Input 
                id="rr" 
                type="number" 
                className="w-full" 
                value={rr}
                onChange={e => handleChange('rr', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="spo2" className="block text-sm font-medium">SpO2</label>
              <Input 
                id="spo2" 
                type="number" 
                className="w-full" 
                value={spo2}
                onChange={e => handleChange('spo2', e.target.value)}
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default VitalsForm;
