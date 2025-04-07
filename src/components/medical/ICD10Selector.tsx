
import React, { useState, useEffect, useRef } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { ICD10Code } from '@/types/clinicalTables';
import { cn } from '@/lib/utils';

interface ICD10SelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const ICD10Selector: React.FC<ICD10SelectorProps> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<ICD10Code[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch ICD-10 codes from the API
  useEffect(() => {
    const fetchICD10Codes = async () => {
      if (!searchTerm || searchTerm.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const apiUrl = `https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search?sf=code,name&terms=${encodeURIComponent(searchTerm)}&maxList=10`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        // API returns [total, [codes], null, [[code, description], ...]]
        if (Array.isArray(data) && data.length >= 4) {
          const codes = data[1];
          const descriptions = data[3];
          
          const formattedResults: ICD10Code[] = codes.map((code: string, index: number) => ({
            code,
            description: descriptions[index][1]
          }));
          
          setResults(formattedResults);
        }
      } catch (error) {
        console.error('Error fetching ICD-10 codes:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchICD10Codes, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSelectCode = (code: ICD10Code) => {
    const formattedCode = `${code.code} - ${code.description}`;
    
    // If there's already some text, add a new line before the new code
    const newValue = value ? `${value}\n${formattedCode}` : formattedCode;
    onChange(newValue);
    setOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="space-y-2 w-full">
      <Textarea
        placeholder="Enter assessment or select ICD-10 codes..."
        className="min-h-[120px] w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            role="combobox" 
            aria-expanded={open}
            className="w-full justify-between"
          >
            {searchTerm || "Search ICD-10 Codes"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Search by code or description..." 
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList>
              <CommandEmpty>
                {isLoading ? (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Searching...</span>
                  </div>
                ) : (
                  <span>No results found.</span>
                )}
              </CommandEmpty>
              <CommandGroup>
                {results.map((item) => (
                  <CommandItem
                    key={item.code}
                    value={`${item.code}-${item.description}`}
                    onSelect={() => handleSelectCode(item)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value.includes(item.code) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="font-medium mr-2">{item.code}</span>
                    <span className="text-sm text-muted-foreground">{item.description}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      <p className="text-xs text-muted-foreground">
        Enter directly or search ICD-10 codes by code or description (e.g., "E11" or "diabetes")
      </p>
    </div>
  );
};

export default ICD10Selector;
