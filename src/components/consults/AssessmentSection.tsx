
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import ICD10Input from '@/components/medical/ICD10Input';

interface Assessment {
  impression: string;
  diagnosis?: string;
  icd10Code?: string;
}

interface AssessmentSectionProps {
  assessment: Assessment;
  onChange: (assessment: Assessment) => void;
}

const AssessmentSection: React.FC<AssessmentSectionProps> = ({ assessment, onChange }) => {
  const handleImpressionChange = (value: string) => {
    onChange({ ...assessment, impression: value });
  };

  const handleDiagnosisChange = (value: string) => {
    onChange({ ...assessment, diagnosis: value });
  };

  const handleICD10Change = (value: string) => {
    onChange({ ...assessment, icd10Code: value });
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="impression">Clinical Impression</Label>
          <Textarea
            id="impression"
            placeholder="Enter clinical impression..."
            value={assessment.impression}
            onChange={(e) => handleImpressionChange(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="diagnosis">Diagnosis</Label>
          <Textarea
            id="diagnosis"
            placeholder="Enter diagnosis..."
            value={assessment.diagnosis || ''}
            onChange={(e) => handleDiagnosisChange(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="icd10-input">Assessment (ICD-10 Codes)</Label>
          <ICD10Input
            value={assessment.icd10Code || ''}
            onChange={handleICD10Change}
            placeholder="Search and select ICD-10 codes..."
            minHeight="120px"
          />
          <p className="text-xs text-gray-500 mt-1">
            Search by code or description and click to select
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssessmentSection;
