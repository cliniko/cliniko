
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';
import { Drug, Prescription } from '@/types/clinicalTables';

interface PrescriptionFormProps {
  drug: Drug;
  onSave: (prescription: Prescription) => void;
  onCancel: () => void;
}

const PrescriptionForm: React.FC<PrescriptionFormProps> = ({ drug, onSave, onCancel }) => {
  const [brand, setBrand] = useState<string>('');
  const [strength, setStrength] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [instructions, setInstructions] = useState<string>('');
  const [indication, setIndication] = useState<string>('');

  const handleSubmit = () => {
    const newPrescription: Prescription = {
      drug,
      brand: brand || undefined,
      form: drug.form,
      strength,
      quantity,
      instructions,
      indication
    };
    
    onSave(newPrescription);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{drug.name}</h2>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={onCancel}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="brand">Brand <span className="text-gray-400">(Optional)</span></Label>
            <Input
              id="brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Select brand"
            />
          </div>
          
          <div>
            <Label htmlFor="form">Form</Label>
            <Input
              id="form"
              value={drug.form}
              disabled
              className="bg-gray-50"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="strength">Strength</Label>
            <Input
              id="strength"
              value={strength}
              onChange={(e) => setStrength(e.target.value)}
              placeholder="e.g., 500 mg"
            />
          </div>
          
          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g., 30 tablets"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="instructions">Instructions</Label>
          <Textarea
            id="instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="e.g., Take 1 tablet every 6 hours as needed for pain"
            rows={3}
          />
        </div>
        
        <div>
          <Label htmlFor="indication">Indication</Label>
          <Textarea
            id="indication"
            value={indication}
            onChange={(e) => setIndication(e.target.value)}
            placeholder="e.g., For relief of mild to moderate pain"
            rows={2}
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} className="bg-medical-primary hover:bg-medical-primary/90">
          Save Medicine
        </Button>
      </div>
    </div>
  );
};

export default PrescriptionForm;
