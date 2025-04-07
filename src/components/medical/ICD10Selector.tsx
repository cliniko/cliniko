
import React, { useEffect, useRef } from 'react';
import { Label } from "@/components/ui/label";
import { cn } from '@/lib/utils';
import ICD10Input from './ICD10Input';

interface ICD10SelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const ICD10Selector: React.FC<ICD10SelectorProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-2 w-full">
      <ICD10Input
        value={value}
        onChange={onChange}
        placeholder="Type to search and enter ICD-10 codes..."
        minHeight="120px"
      />
      
      <p className="text-xs text-muted-foreground">
        Search ICD-10 codes by code or description (e.g., "E11" or "diabetes")
      </p>
    </div>
  );
};

export default ICD10Selector;
