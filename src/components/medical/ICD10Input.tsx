
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { ICD10Code } from '@/types/clinicalTables';

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
  const [inputValue, setInputValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<ICD10Code[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const debouncedSearch = useDebounce(inputValue, 300);

  // Update local input when external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch ICD-10 codes from the API
  useEffect(() => {
    const fetchICD10Codes = async () => {
      if (!debouncedSearch || debouncedSearch.length < 2) {
        setResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const apiUrl = `https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search?sf=code,name&terms=${encodeURIComponent(debouncedSearch)}&maxList=10`;
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
        setIsSearching(false);
      }
    };

    fetchICD10Codes();
  }, [debouncedSearch]);

  const handleSelectCode = (item: ICD10Code) => {
    const formattedValue = `${item.code} - ${item.description}`;
    setInputValue(formattedValue);
    onChange(formattedValue);
    setIsFocused(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        placeholder={placeholder}
        className={className}
      />
      
      {isFocused && (inputValue.length > 1 || results.length > 0) && (
        <Card className="absolute z-50 mt-1 max-h-60 w-full overflow-auto border shadow-lg">
          {isSearching ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Searching...</span>
            </div>
          ) : results.length > 0 ? (
            <ul className="py-1">
              {results.map((item) => (
                <li 
                  key={item.code}
                  className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                  onClick={() => handleSelectCode(item)}
                >
                  <span className="font-medium">{item.code}</span>
                  <span> - {item.description}</span>
                </li>
              ))}
            </ul>
          ) : inputValue.length > 1 ? (
            <div className="p-4 text-center text-gray-500">
              No results found
            </div>
          ) : null}
        </Card>
      )}
    </div>
  );
};

export default ICD10Input;
