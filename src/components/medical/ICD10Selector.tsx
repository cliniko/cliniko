
import React, { useState, useEffect, useRef } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Check, Loader2 } from 'lucide-react';
import { ICD10Code } from '@/types';

interface ICD10SelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const ICD10Selector: React.FC<ICD10SelectorProps> = ({ value, onChange }) => {
  const [inputValue, setInputValue] = useState(value);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<ICD10Code[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const cursorPosition = useRef<number | null>(null);

  // Update local input when external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Perform ICD-10 search
  useEffect(() => {
    const performSearch = async () => {
      if (!searchTerm || searchTerm.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        // This would typically be an API call, but we're simulating it here
        // In a real app, you might use a proper ICD-10 API or database
        const sampleResults = [
          { id: '1', code: 'E11', description: 'Type 2 diabetes mellitus' },
          { id: '2', code: 'E11.9', description: 'Type 2 diabetes mellitus without complications' },
          { id: '3', code: 'I10', description: 'Essential (primary) hypertension' },
          { id: '4', code: 'J45.909', description: 'Unspecified asthma, uncomplicated' },
          { id: '5', code: 'M54.5', description: 'Low back pain' }
        ];

        // Filter based on search term
        const filtered = sampleResults.filter(
          item => 
            item.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
            item.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        setResults(filtered);
      } catch (error) {
        console.error("Error searching ICD-10 codes:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(performSearch, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle text change in textarea
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    
    // Store cursor position for later insertion
    cursorPosition.current = e.target.selectionStart;
  };

  // Handle selecting an ICD-10 code
  const handleSelectCode = (code: ICD10Code) => {
    // Format the code nicely
    const codeText = `${code.code} - ${code.description}`;
    
    // If we have a cursor position, insert at that position
    if (cursorPosition.current !== null && textAreaRef.current) {
      const start = inputValue.substring(0, cursorPosition.current);
      const end = inputValue.substring(cursorPosition.current);
      
      const newValue = `${start}${codeText}\n${end}`;
      setInputValue(newValue);
      onChange(newValue);
      
      // Close the popover
      setOpen(false);
      setSearchTerm('');
      
      // Focus back on textarea and set cursor position after insertion
      setTimeout(() => {
        if (textAreaRef.current) {
          textAreaRef.current.focus();
          const newPosition = cursorPosition.current! + codeText.length + 1;
          textAreaRef.current.setSelectionRange(newPosition, newPosition);
        }
      }, 100);
    } else {
      // Fallback: just append to the end with a newline
      const newValue = inputValue ? `${inputValue}\n${codeText}` : codeText;
      setInputValue(newValue);
      onChange(newValue);
      setOpen(false);
      setSearchTerm('');
    }
  };

  return (
    <div className="relative w-full">
      <div className="flex items-center justify-between mb-2">
        <Label htmlFor="icd10-search">Search ICD-10</Label>
      </div>
      
      <div className="flex items-start gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button 
              type="button"
              className="px-3 py-2 h-10 bg-muted hover:bg-muted/80 rounded-md text-sm font-medium flex-shrink-0"
              onClick={() => setOpen(true)}
            >
              Search ICD-10
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="start">
            <Command>
              <CommandInput 
                placeholder="Search codes or descriptions..." 
                value={searchTerm}
                onValueChange={setSearchTerm}
              />
              <CommandList className="max-h-[200px]">
                <CommandEmpty>
                  {isLoading ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>Searching...</span>
                    </div>
                  ) : (
                    <span className="block p-2 text-center text-sm">No results found.</span>
                  )}
                </CommandEmpty>
                <CommandGroup>
                  {results.map((code) => (
                    <CommandItem 
                      key={code.id} 
                      value={`${code.code}-${code.description}`}
                      onSelect={() => handleSelectCode(code)}
                      className="cursor-pointer"
                    >
                      <span className="font-medium">{code.code}</span>
                      <span className="ml-2 text-sm text-muted-foreground">- {code.description}</span>
                      <Check className="ml-auto h-4 w-4 text-green-600 opacity-0 group-data-[selected]:opacity-100" />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        
        <Textarea
          ref={textAreaRef}
          placeholder="Enter assessment or search ICD-10 codes to add them here..."
          rows={5}
          className="flex-1"
          value={inputValue}
          onChange={handleTextChange}
          onFocus={() => {
            cursorPosition.current = textAreaRef.current?.selectionStart || null;
          }}
          onKeyUp={(e) => {
            cursorPosition.current = e.currentTarget.selectionStart;
          }}
          onClick={(e) => {
            cursorPosition.current = e.currentTarget.selectionStart;
          }}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Type directly or search and select ICD-10 codes to add to your assessment.
      </p>
    </div>
  );
};

export default ICD10Selector;
