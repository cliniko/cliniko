import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ICD10Code } from '@/types';

export function useICD10Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<ICD10Code[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function performSearch() {
      if (searchTerm === '') {
        setResults([]);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase.rpc('search_icd10_codes', {
          search_term: searchTerm
        });
        
        if (error) throw new Error(error.message);
        
        if (data) {
          const formattedResults: ICD10Code[] = data.map((item: any) => ({
            code: item.code,
            name: item.name,
            description: item.description || undefined
          }));
          
          setResults(formattedResults);
        }
      } catch (e: any) {
        console.error('Error searching for ICD-10 codes:', e);
        setError(e.message);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }
    
    // Debounce search to prevent too many queries
    const timeoutId = setTimeout(() => {
      performSearch();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    results,
    loading,
    error
  };
} 