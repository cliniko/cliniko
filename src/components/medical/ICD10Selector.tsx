
import React, { useState, useEffect, useRef } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from '@/lib/utils';

interface ICD10SelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const ICD10Selector: React.FC<ICD10SelectorProps> = ({ value, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleterInitialized = useRef(false);
  
  useEffect(() => {
    // Check if the required libraries are loaded
    if (!window.Def || !window.jQuery) {
      loadExternalResources().then(() => {
        initializeAutocompleter();
      });
    } else if (!autocompleterInitialized.current) {
      initializeAutocompleter();
    }
    
    return () => {
      // Clean up if needed
    };
  }, []);

  const loadExternalResources = async () => {
    // Load jQuery if not already loaded
    if (!window.jQuery) {
      const jqueryScript = document.createElement('script');
      jqueryScript.src = 'https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js';
      jqueryScript.async = true;
      document.head.appendChild(jqueryScript);
      
      await new Promise<void>((resolve) => {
        jqueryScript.onload = () => resolve();
      });
    }
    
    // Load autocomplete-lhc script if not already loaded
    if (!window.Def) {
      const autocompleteScript = document.createElement('script');
      autocompleteScript.src = 'https://lhcforms-static.nlm.nih.gov/autocomplete-lhc-versions/17.0.3/autocomplete-lhc.min.js';
      autocompleteScript.async = true;
      document.head.appendChild(autocompleteScript);
      
      const autocompleteCss = document.createElement('link');
      autocompleteCss.rel = 'stylesheet';
      autocompleteCss.href = 'https://lhcforms-static.nlm.nih.gov/autocomplete-lhc-versions/17.0.3/autocomplete-lhc.min.css';
      document.head.appendChild(autocompleteCss);
      
      await new Promise<void>((resolve) => {
        autocompleteScript.onload = () => resolve();
      });
    }
  };

  const initializeAutocompleter = () => {
    if (inputRef.current && window.Def && window.jQuery) {
      try {
        const autocompleter = new window.Def.Autocompleter.Search(
          inputRef.current.id,
          'https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search?sf=code,name',
          {
            tableFormat: true,
            valueCols: [0],
            colHeaders: ['Code', 'Name'],
            maxSelect: 1,
            matchListValue: true,
            autoFill: true,
            allowFreeText: true,
            freeTextRule: 'match',
            valueSelector: function(item: any) {
              return `${item[0]} - ${item[1]}`; // Combine code and description
            },
            afterMatch: function(item: any) {
              const formattedCode = `${item[0]} - ${item[1]}`;
              // If there's already some text, add a new line before the new code
              const newValue = value ? `${value}\n${formattedCode}` : formattedCode;
              onChange(newValue);
            }
          }
        );
        
        autocompleterInitialized.current = true;
      } catch (error) {
        console.error('Error initializing autocompleter:', error);
      }
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="space-y-2 w-full">
      <Textarea
        placeholder="Enter assessment or select ICD-10 codes..."
        className="min-h-[120px] w-full"
        value={value}
        onChange={handleTextareaChange}
      />
      
      <div className="relative">
        <Label htmlFor="icd10-search">Search ICD-10 Codes</Label>
        <input
          id="icd10-search"
          ref={inputRef}
          type="text"
          placeholder="Type to search ICD-10 codes..."
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
            "ring-offset-background file:border-0 file:bg-transparent",
            "file:text-sm file:font-medium placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          )}
        />
      </div>
      
      <p className="text-xs text-muted-foreground">
        Search ICD-10 codes by code or description (e.g., "E11" or "diabetes")
      </p>
    </div>
  );
};

// Add TypeScript declarations for the external libraries
declare global {
  interface Window {
    Def: any;
    jQuery: any;
  }
}

export default ICD10Selector;
