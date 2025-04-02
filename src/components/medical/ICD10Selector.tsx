
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Search, Loader2 } from "lucide-react";
import { ICD10Entry } from "@/types/clinicalTables";
import { useDebounce } from "@/hooks/use-debounce";

interface ICD10SelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const ICD10Selector = ({ value, onChange }: ICD10SelectorProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectedCodes, setSelectedCodes] = useState<ICD10Entry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<ICD10Entry[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

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

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);
  };

  // Effect for debounced search
  useEffect(() => {
    if (debouncedSearchTerm.trim().length > 1) {
      searchICD10(debouncedSearchTerm);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  }, [debouncedSearchTerm]);

  // Search ICD-10 API
  const searchICD10 = async (query: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search?terms=${query}&df=code,name&maxList=15`
      );
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      
      if (Array.isArray(data) && data.length >= 3) {
        // The API returns data in a specific format
        const codeIndex = data[0].indexOf('code');
        const nameIndex = data[0].indexOf('name');
        
        if (codeIndex >= 0 && nameIndex >= 0 && Array.isArray(data[3])) {
          const results: ICD10Entry[] = [];
          const numResults = data[1]; // Total number of results
          
          // Process each result pair (code and name)
          for (let i = 0; i < numResults; i++) {
            const code = data[3][i * 2]; // Code is at even indices
            const description = data[3][i * 2 + 1]; // Name is at odd indices
            
            results.push({
              code,
              description,
              fullEntry: `${code} - ${description}`
            });
          }
          
          setSearchResults(results);
          setShowDropdown(true);
        } else {
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching ICD-10 codes:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Update the parent component's value when selectedCodes changes
  useEffect(() => {
    const formattedValue = selectedCodes.map(entry => entry.fullEntry).join('\n');
    onChange(formattedValue);
  }, [selectedCodes, onChange]);

  // Add an ICD-10 code
  const addCode = (entry: ICD10Entry) => {
    // Check if code already exists to avoid duplicates
    if (!selectedCodes.some(c => c.code === entry.code)) {
      setSelectedCodes(prev => [...prev, entry]);
    }
    
    // Clear search
    setSearchTerm("");
    setSearchResults([]);
    setShowDropdown(false);
  };

  // Remove an ICD-10 code
  const removeCode = (codeToRemove: string) => {
    setSelectedCodes(prev => prev.filter(entry => entry.code !== codeToRemove));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current && 
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            ref={inputRef}
            placeholder="Search ICD-10 codes or diagnoses..."
            className="w-full pl-10"
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => {
              if (searchTerm.trim().length > 1 && searchResults.length > 0) {
                setShowDropdown(true);
              }
            }}
          />
        </div>
        
        {showDropdown && (
          <div 
            ref={dropdownRef}
            className="absolute z-50 mt-1 w-full bg-white rounded-md border border-gray-200 shadow-lg max-h-60 overflow-y-auto"
          >
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span>Searching...</span>
                </div>
              </div>
            ) : searchResults.length > 0 ? (
              <ul className="py-1">
                {searchResults.map((result) => (
                  <li 
                    key={result.code}
                    className="px-3 py-2 hover:bg-blue-50 cursor-pointer"
                    onClick={() => addCode(result)}
                  >
                    <div className="font-medium">{result.code} - {result.description}</div>
                  </li>
                ))}
              </ul>
            ) : debouncedSearchTerm.trim().length > 1 ? (
              <div className="p-4 text-center text-gray-500">No results found</div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default ICD10Selector;
