import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Check, Loader2 } from 'lucide-react';
import { ICD10Code } from '@/types';
import { useICD10Search } from '@/hooks/use-icd10-search';

interface ICD10SearchProps {
  onSelect: (code: ICD10Code) => void;
  selectedCodes?: ICD10Code[];
}

export function ICD10Search({ onSelect, selectedCodes = [] }: ICD10SearchProps) {
  const { searchTerm, setSearchTerm, results, loading } = useICD10Search();
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Check if a code is already selected
  const isCodeSelected = (code: string) => {
    return selectedCodes.some(selectedCode => selectedCode.code === code);
  };
  
  // Handle click outside to close results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchRef]);

  return (
    <div className="relative w-full" ref={searchRef}>
      <div className="relative">
        <Input
          placeholder="Search ICD-10 codes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowResults(true)}
          className="w-full pr-10"
          aria-label="Search ICD-10 codes"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <Search className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>
      
      {showResults && (
        <div className="absolute z-50 w-full bg-white mt-1 rounded-md border shadow-md max-h-60 overflow-auto">
          {results.length === 0 ? (
            <div className="p-2 text-center text-sm text-muted-foreground">
              {loading ? "Searching..." : searchTerm ? "No matching codes found" : "Type to search for codes"}
            </div>
          ) : (
            <div className="py-1">
              {results.map((code) => (
                <button
                  key={code.code}
                  type="button"
                  className={`w-full text-left px-3 py-2 hover:bg-slate-100 flex items-start justify-between ${
                    isCodeSelected(code.code) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={() => {
                    if (!isCodeSelected(code.code)) {
                      onSelect(code);
                      setSearchTerm('');
                      setShowResults(false);
                    }
                  }}
                  disabled={isCodeSelected(code.code)}
                >
                  <div>
                    <div className="font-medium flex items-center">
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md text-xs mr-2">
                        {code.code}
                      </span>
                      {code.name}
                    </div>
                    {code.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{code.description}</p>
                    )}
                  </div>
                  {isCodeSelected(code.code) && <Check className="h-4 w-4 ml-2 flex-shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 