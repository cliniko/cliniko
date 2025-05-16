import React from 'react';
import { AssessmentItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AssessmentDisplayProps {
  assessmentItems?: AssessmentItem[] | null;
  additionalRemarks?: string | null;
  legacyAssessment?: any;
}

export default function AssessmentDisplay({ 
  assessmentItems, 
  additionalRemarks,
  legacyAssessment 
}: AssessmentDisplayProps) {
  // Handle different data formats
  const hasStructuredData = assessmentItems && assessmentItems.length > 0;
  const hasAdditionalRemarks = additionalRemarks && additionalRemarks.trim().length > 0;
  const hasLegacyData = legacyAssessment && (!hasStructuredData || !hasAdditionalRemarks);
  
  return (
    <Card className="mb-4 overflow-hidden">
      <CardHeader className="bg-medical-light/10 py-3">
        <CardTitle className="text-medical-doctor text-lg">Assessment</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Structured ICD-10 Assessment Items */}
        {hasStructuredData && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Diagnosis</h3>
            <div className="space-y-2">
              {assessmentItems!.map((item) => (
                <div key={item.id} className="border rounded-md p-3">
                  <div className="flex items-center mb-1">
                    {item.icdCode && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md text-xs mr-2">
                        {item.icdCode}
                      </span>
                    )}
                    <span className="font-medium">{item.icdName || 'Unnamed Assessment'}</span>
                  </div>
                  <p className="text-sm text-gray-700">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Additional Remarks */}
        {hasAdditionalRemarks && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Additional Clinical Remarks</h3>
            <div className="border rounded-md p-3 whitespace-pre-line text-sm">
              {additionalRemarks}
            </div>
          </div>
        )}
        
        {/* Legacy Assessment Data */}
        {hasLegacyData && !hasStructuredData && !hasAdditionalRemarks && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Assessment</h3>
            <div className="border rounded-md p-3 whitespace-pre-line text-sm">
              {typeof legacyAssessment === 'string' 
                ? legacyAssessment 
                : Array.isArray(legacyAssessment)
                  ? legacyAssessment.join('\n')
                  : JSON.stringify(legacyAssessment)}
            </div>
          </div>
        )}
        
        {/* No data case */}
        {!hasStructuredData && !hasAdditionalRemarks && !hasLegacyData && (
          <div className="text-center py-4 text-gray-500">
            No assessment information available
          </div>
        )}
      </CardContent>
    </Card>
  );
} 