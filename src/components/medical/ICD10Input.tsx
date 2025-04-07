
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Label } from "@/components/ui/label";

interface ICD10InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const ICD10Input: React.FC<ICD10InputProps> = ({ 
  value, 
  onChange, 
  placeholder = 'Search ICD-10 codes...', 
  className 
}) => {
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
            }
          }
        );
        
        // Set up event listener for when an item is selected
        if (inputRef.current) {
          inputRef.current.addEventListener('autocomplete:selected', (event: any) => {
            if (event.detail && event.detail.itemData) {
              const selectedItem = event.detail.itemData;
              const formattedCode = `${selectedItem[0]} - ${selectedItem[1]}`;
              onChange(formattedCode);
            }
          });
        }
        
        autocompleterInitialized.current = true;
      } catch (error) {
        console.error('Error initializing autocompleter:', error);
      }
    }
  };

  return (
    <div className="relative w-full">
      <input
        id="icd10-input"
        ref={inputRef}
        type="text"
        value={value}
        placeholder={placeholder}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
          "ring-offset-background file:border-0 file:bg-transparent",
          "file:text-sm file:font-medium placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onChange={(e) => onChange(e.target.value)}
      />
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

export default ICD10Input;
