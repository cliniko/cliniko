
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Drug, Prescription } from '@/types/clinicalTables';
import DrugSelector from '@/components/medical/DrugSelector';
import PrescriptionForm from '@/components/medical/PrescriptionForm';

interface PrescriptionSectionProps {
  showPrescriptionForm: boolean;
  selectedDrug: Drug | null;
  prescriptions: Prescription[];
  onSave: (prescription: Prescription) => void;
  onCancel: () => void;
  onRemove: (index: number) => void;
  onDrugSelect: (drug: Drug) => void;
}

const PrescriptionSection = ({
  showPrescriptionForm,
  selectedDrug,
  prescriptions,
  onSave,
  onCancel,
  onRemove,
  onDrugSelect
}: PrescriptionSectionProps) => {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="prescription">
        <AccordionTrigger className="text-base font-medium">
          PRESCRIPTION {prescriptions.length > 0 && <Badge className="ml-2 bg-blue-100 text-blue-800">{prescriptions.length}</Badge>}
        </AccordionTrigger>
        <AccordionContent>
          {showPrescriptionForm && selectedDrug ? (
            <PrescriptionForm
              drug={selectedDrug}
              onSave={onSave}
              onCancel={onCancel}
            />
          ) : (
            <div className="space-y-4">
              <DrugSelector onDrugSelect={onDrugSelect} />
              
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
                            onClick={() => onRemove(index)}
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
  );
};

export default PrescriptionSection;
