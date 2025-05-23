
import React, { useState, useEffect } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Drug } from '@/types';

interface DrugSelectorProps {
  onSelect: (drug: Drug) => void;
  placeholder?: string;
}

export function EnhancedDrugSelector({ onSelect, placeholder = "Search drugs..." }: DrugSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: drugs, isLoading, error } = useQuery({
    queryKey: ['drugs', searchTerm],
    queryFn: async () => {
      let query = supabase.from('drugs').select('*');
      
      if (searchTerm) {
        query = query.ilike('drug_name', `%${searchTerm}%`);
      }
      
      const { data, error } = await query.limit(30);
      
      if (error) throw error;
      return data as Drug[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleSelect = (drug: Drug) => {
    onSelect(drug);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start" sideOffset={5}>
        <Command>
          <CommandInput 
            placeholder="Search drugs..." 
            onValueChange={setSearchTerm}
            value={searchTerm}
            className="h-9"
          />
          <CommandList className="max-h-[300px] overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">Error loading drugs</div>
            ) : (
              <>
                <CommandEmpty>No drugs found.</CommandEmpty>
                <CommandGroup>
                  {drugs && drugs.length > 0 ? (
                    drugs.map((drug) => (
                      <CommandItem
                        key={drug.id}
                        value={`${drug.drug_name}-${drug.drug_form}`}
                        onSelect={() => handleSelect(drug)}
                        className="cursor-pointer"
                      >
                        <div className="flex flex-col">
                          <div className="font-medium">{drug.drug_name}</div>
                          <div className="text-xs text-muted-foreground">{drug.drug_form}</div>
                          {drug.atc_code && <div className="text-xs text-gray-400">ATC: {drug.atc_code}</div>}
                        </div>
                      </CommandItem>
                    ))
                  ) : (
                    <div className="p-2 text-center text-sm text-gray-500">
                      {searchTerm ? "No matching drugs found" : "Start typing to search drugs"}
                    </div>
                  )}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default EnhancedDrugSelector;
