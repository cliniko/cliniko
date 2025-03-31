
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { ICD10Entry } from "@/types/clinicalTables";

interface ICD10SelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const ICD10Selector = ({ value, onChange }: ICD10SelectorProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedCodes, setSelectedCodes] = useState<ICD10Entry[]>([]);

  // Parse existing value into selectedCodes on initial load
  useEffect(() => {
    if (value && selectedCodes.length === 0) {
      const codes = value
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => {
          const match = line.match(/^([A-Z0-9.]+) - (.+)$/);
          if (match) {
            return {
              code: match[1],
              description: match[2],
              fullEntry: line
            };
          }
          return { code: "", description: line, fullEntry: line };
        });
      
      if (codes.length > 0) {
        setSelectedCodes(codes);
      }
    }
  }, [value]);

  // Initialize ICD-10 autocompletion
  useEffect(() => {
    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = (e) => reject(e);
        document.head.appendChild(script);
      });
    };
    
    const loadStylesheet = (href: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`link[href="${href}"]`)) {
          resolve();
          return;
        }
        
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.onload = () => resolve();
        link.onerror = (e) => reject(e);
        document.head.appendChild(link);
      });
    };
    
    const initializeClinicalTables = async () => {
      try {
        await loadStylesheet('https://clinicaltables.nlm.nih.gov/autocomplete-lhc-versions/19.2.4/autocomplete-lhc.min.css');
        await loadScript('https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js');
        await loadScript('https://clinicaltables.nlm.nih.gov/autocomplete-lhc-versions/19.2.4/autocomplete-lhc.min.js');
        
        if (inputRef.current && typeof window.Def !== 'undefined') {
          new window.Def.Autocompleter.Search(
            inputRef.current,
            'https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search',
            {
              tableFormat: true,
              valueCols: [0, 1],
              colHeaders: ['Code', 'Name'],
              maxSelect: 25,
              displayFields: [0, 1],
              searchTimeout: 500,
              autoSelect: true,
              cellClassName: 'autocomplete-cell',
              matchListValue: true,
              autoFocus: false,
              selectionEvent: function(item: any) {
                if (item && item.length >= 2) {
                  const code = item[0];
                  const description = item[1];
                  const newEntry: ICD10Entry = {
                    code,
                    description,
                    fullEntry: `${code} - ${description}`
                  };
                  
                  addCode(newEntry);
                  
                  if (inputRef.current) {
                    inputRef.current.value = '';
                  }
                }
              }
            }
          );
        }
      } catch (error) {
        console.error("Error initializing Clinical Tables:", error);
      }
    };
    
    initializeClinicalTables();
  }, []);

  // Update the parent component's value when selectedCodes changes
  useEffect(() => {
    const formattedValue = selectedCodes.map(entry => entry.fullEntry).join('\n');
    onChange(formattedValue);
  }, [selectedCodes, onChange]);

  const addCode = (entry: ICD10Entry) => {
    // Check if code already exists to avoid duplicates
    if (!selectedCodes.some(c => c.code === entry.code)) {
      setSelectedCodes(prev => [...prev, entry]);
    }
  };

  const removeCode = (codeToRemove: string) => {
    setSelectedCodes(prev => prev.filter(entry => entry.code !== codeToRemove));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md bg-white">
        {selectedCodes.map((entry) => (
          <Badge key={entry.code} className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 border border-blue-200">
            <span className="font-bold">{entry.code}</span>
            <span> - {entry.description}</span>
            <button 
              type="button" 
              onClick={() => removeCode(entry.code)}
              className="ml-1 h-4 w-4 rounded-full bg-blue-200 hover:bg-blue-300 inline-flex items-center justify-center"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      
      <div className="relative">
        <Input
          ref={inputRef}
          placeholder="Search ICD-10 codes or diagnoses..."
          className="w-full"
        />
      </div>
    </div>
  );
};

export default ICD10Selector;
