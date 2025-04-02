
import React, { useState, useEffect, useRef } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Loader2, Check, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Drug, DrugWithForm, DrugSelectorProps } from '@/types/clinicalTables';

const DrugSelector = ({ onDrugSelect }: DrugSelectorProps) => {
  const [drugs, setDrugs] = useState<DrugWithForm[]>([]);
  const [filteredDrugs, setFilteredDrugs] = useState<DrugWithForm[]>([]);
  const [selectedDrug, setSelectedDrug] = useState<DrugWithForm | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Fetch drugs from Supabase
  useEffect(() => {
    const fetchDrugs = async () => {
      try {
        setIsLoading(true);
        
        // Fetch drugs data from Supabase
        const { data, error } = await supabase
          .from('drugs')
          .select('*');
          
        if (error) {
          throw error;
        }
        
        if (!data || data.length === 0) {
          setDrugs([]);
          toast({
            title: "No drugs found",
            description: "The drug database appears to be empty.",
            variant: "destructive"
          });
        } else {
          // Transform the data to match our expected format
          const transformedData: DrugWithForm[] = data.map(drug => ({
            id: drug.id,
            drug_id: drug.drug_id,
            name: drug.drug_name,
            form: drug.drug_form,
            atcCode: drug.atc_code || undefined
          }));
          
          setDrugs(transformedData);
        }
      } catch (error: any) {
        console.error("Error fetching drugs:", error);
        setError("Failed to load drug database: " + error.message);
        toast({
          title: "Error",
          description: "Failed to fetch drugs from database",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDrugs();
  }, [toast]);

  // Update filtered drugs when search term changes
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredDrugs([]);
      return;
    }
    
    const filtered = drugs.filter(drug => 
      drug.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drug.form.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (drug.drug_id && drug.drug_id.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    // Limit results for better performance
    setFilteredDrugs(filtered.slice(0, 20));
  }, [searchTerm, drugs]);

  const handleDrugSelect = (drug: DrugWithForm) => {
    setSelectedDrug(drug);
    setSearchTerm(drug.name);
    
    if (onDrugSelect) {
      onDrugSelect(drug);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4 border rounded-md bg-background">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <p>Loading drug database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-destructive bg-destructive/10 rounded-md">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-md p-4 bg-white shadow-sm">
        <Label htmlFor="drug-search" className="text-base font-medium block mb-2">
          Search Medication
        </Label>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          
          <Input
            id="drug-search"
            placeholder="Start typing to search medications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {searchTerm.trim() !== "" && (
          <div className="mt-2 border rounded-md max-h-60 overflow-y-auto bg-white">
            {filteredDrugs.length === 0 ? (
              <div className="p-3 text-center text-sm text-muted-foreground">
                No matching medications found
              </div>
            ) : (
              <ul className="divide-y">
                {filteredDrugs.map((drug) => (
                  <li 
                    key={drug.id} 
                    className="p-3 hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => handleDrugSelect(drug)}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-primary">{drug.name}</span>
                      <span className="text-sm text-muted-foreground">{drug.form}</span>
                      {drug.atcCode && (
                        <span className="text-xs text-muted-foreground">ATC: {drug.atcCode}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        
        {selectedDrug && (
          <div className="mt-4 p-3 border rounded-md bg-primary/10 border-primary/20">
            <div className="font-medium flex items-center">
              <Check className="h-4 w-4 mr-1 text-green-600" />
              Selected medication:
            </div>
            <div className="text-sm mt-1">
              <p><span className="font-medium">Name:</span> {selectedDrug.name}</p>
              <p><span className="font-medium">Form:</span> {selectedDrug.form}</p>
              {selectedDrug.atcCode && (
                <p><span className="font-medium">ATC Code:</span> {selectedDrug.atcCode}</p>
              )}
            </div>
          </div>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground">
        Search from {drugs.length} medications in the Philippine Drug Formulary database
      </p>
    </div>
  );
};

export default DrugSelector;
