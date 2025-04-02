
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

interface ICD10Code {
  code: string;
  description: string;
}

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

  // Mock ICD-10 data - in a real app, this would come from an API
  const mockICDData: ICD10Code[] = [
    { code: 'A00', description: 'Cholera' },
    { code: 'A01', description: 'Typhoid and paratyphoid fevers' },
    { code: 'E11', description: 'Type 2 diabetes mellitus' },
    { code: 'I10', description: 'Essential (primary) hypertension' },
    { code: 'J45', description: 'Asthma' },
    { code: 'K29', description: 'Gastritis and duodenitis' },
    { code: 'M54', description: 'Dorsalgia' },
    { code: 'R50', description: 'Fever of other and unknown origin' },
    { code: 'R51', description: 'Headache' },
    { code: 'Z71', description: 'Persons encountering health services for counseling' },
  ];

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

  useEffect(() => {
    if (!debouncedSearch || debouncedSearch.length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    // Simulate API call - replace with real API call in production
    setTimeout(() => {
      const filtered = mockICDData.filter(
        item => item.code.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
               item.description.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
      setResults(filtered);
      setIsSearching(false);
    }, 300);
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
