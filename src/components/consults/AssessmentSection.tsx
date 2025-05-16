import { useState, useEffect } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardDescription
} from '@/components/ui/card';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl,
  FormMessage
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Control, useFormContext } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { ICD10Search } from '@/components/medical/ICD10Search';
import { AssessmentItem, ICD10Code } from '@/types';
import { X, PlusCircle } from 'lucide-react';

interface AssessmentSectionProps {
  control: Control<any>;
  defaultValues?: {
    assessmentItems?: AssessmentItem[];
    additionalRemarks?: string;
  };
}

export default function AssessmentSection({ control, defaultValues }: AssessmentSectionProps) {
  const [assessmentItems, setAssessmentItems] = useState<AssessmentItem[]>(
    defaultValues?.assessmentItems || []
  );
  
  const form = useFormContext();

  // Update the form values when assessment items change
  useEffect(() => {
    if (form && form.setValue) {
      form.setValue('assessmentItems', assessmentItems, { 
        shouldValidate: true, 
        shouldDirty: true 
      });
    }
  }, [assessmentItems, form]);

  const handleAddAssessmentItem = (code: ICD10Code) => {
    const newItem: AssessmentItem = {
      id: uuidv4(),
      icdCode: code.code,
      icdName: code.name,
      description: code.description || code.name,
    };

    setAssessmentItems(prev => [...prev, newItem]);
  };

  const handleRemoveAssessmentItem = (id: string) => {
    setAssessmentItems(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdateDescription = (id: string, description: string) => {
    setAssessmentItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, description } : item
      )
    );
  };

  return (
    <Card className="mb-6">
      <CardHeader className="bg-medical-light/10">
        <CardTitle className="text-medical-doctor text-lg">Assessment</CardTitle>
        <CardDescription>
          Clinical assessment findings and diagnosis
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* ICD-10 Search */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Diagnosis & Assessment Items</h3>
            </div>
            <div>
              <ICD10Search 
                onSelect={handleAddAssessmentItem} 
                selectedCodes={assessmentItems.map(item => ({
                  code: item.icdCode || "",
                  name: item.icdName || "",
                  description: item.description
                }))}
              />
            </div>
          </div>

          {/* Assessment Items List */}
          {assessmentItems.length > 0 && (
            <div className="space-y-3 pt-2">
              {assessmentItems.map((item) => (
                <div 
                  key={item.id}
                  className="flex gap-3 border rounded-md p-3 bg-muted/20"
                >
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div className="font-medium text-sm">
                        {item.icdCode && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md text-xs mr-2">
                            {item.icdCode}
                          </span>
                        )}
                        {item.icdName}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-muted-foreground"
                        onClick={() => handleRemoveAssessmentItem(item.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Textarea
                      value={item.description}
                      onChange={(e) => handleUpdateDescription(item.id, e.target.value)}
                      className="mt-2 min-h-[60px]"
                      placeholder="Additional details about this assessment..."
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Manual Assessment Entry */}
          {assessmentItems.length === 0 && (
            <div className="border border-dashed rounded-md p-4 text-center text-muted-foreground">
              <PlusCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/70" />
              <p className="text-sm">No assessment items added yet.</p>
              <p className="text-xs mt-1">Search for and select ICD-10 codes above to add diagnoses</p>
            </div>
          )}

          {/* Additional Remarks */}
          <FormField
            control={control}
            name="additionalRemarks"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Clinical Remarks</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter any additional remarks or notes about the assessment..."
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
