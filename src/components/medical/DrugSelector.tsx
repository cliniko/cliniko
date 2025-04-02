
import React, { useState, useEffect, useRef } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Check, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Drug, DrugSelectorProps } from '@/types/clinicalTables';

const DrugSelector = ({ onDrugSelect }: DrugSelectorProps) => {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [filteredDrugs, setFilteredDrugs] = useState<string[]>([]);
  const [selectedDrug, setSelectedDrug] = useState<string | null>(null);
  const [selectedForm, setSelectedForm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch drugs from Supabase
  useEffect(() => {
    const fetchDrugs = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all drugs data from the table
        const { data, error } = await supabase
          .from('drugs')
          .select('*');
          
        if (error) {
          throw error;
        }
        
        console.log(`Fetched ${data?.length || 0} drugs from Supabase`);
        
        if (!data || data.length === 0) {
          toast.warning("No drugs found in the database.");
          setDrugs([]);
        } else {
          // Transform the data to match our expected format
          const transformedData = data.map(drug => ({
            drug_id: drug.drug_id,
            name: drug.drug_name,
            form: drug.drug_form,
            atcCode: drug.atc_code || ''
          }));
          
          setDrugs(transformedData);
        }
      } catch (error: any) {
        console.error("Error fetching drugs:", error);
        setError("Failed to load drug database: " + error.message);
        setDrugs([]);
        toast.error("Failed to fetch drugs from database");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDrugs();
  }, []);

  // Update filtered drugs when search term changes
  useEffect(() => {
    // Get unique drug names 
    const uniqueDrugNames = Array.from(new Set(drugs.map(drug => drug.name)));
    
    // Filter by prefix
    const filtered = searchTerm.trim() === "" 
      ? uniqueDrugNames 
      : uniqueDrugNames.filter(name => {
          return name.toLowerCase().includes(searchTerm.toLowerCase());
        });
        
    setFilteredDrugs(filtered);
    
    // If there's a search term, show the dropdown
    if (searchTerm.trim() !== "") {
      setShowDropdown(true);
    }
  }, [searchTerm, drugs]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        searchInputRef.current && 
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get forms for the selected drug
  const formsForSelectedDrug = selectedDrug 
    ? drugs.filter(drug => drug.name === selectedDrug).map(drug => drug.form)
    : [];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowDropdown(true);
  };
  
  const handleSelectDrug = (drugName: string) => {
    setSelectedDrug(drugName);
    setSearchTerm(drugName);
    setShowDropdown(false);
    setSelectedForm("");
    
    // If there's only one form available, auto-select it
    const forms = drugs.filter(drug => drug.name === drugName).map(drug => drug.form);
    if (forms.length === 1) {
      handleSelectForm(forms[0]);
    }
  };

  const handleSelectForm = (form: string) => {
    setSelectedForm(form);
    
    if (onDrugSelect && selectedDrug) {
      const selectedDrugWithForm = drugs.find(
        drug => drug.name === selectedDrug && drug.form === form
      );
      if (selectedDrugWithForm) {
        onDrugSelect(selectedDrugWithForm);
      }
    }
  };

  // Display search stats
  const searchStats = searchTerm.trim() !== "" ? 
    `Found ${filteredDrugs.length} drugs matching "${searchTerm}" from a total of ${Array.from(new Set(drugs.map(drug => drug.name))).length} drugs` :
    `${Array.from(new Set(drugs.map(drug => drug.name))).length} drugs available`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <p>Loading drug database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
          <p>{error}</p>
        </div>
      )}
      
      <div className="relative w-full">
        <Label htmlFor="drugSearch" className="sr-only">Search Drug</Label>
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input 
            id="drugSearch"
            ref={searchInputRef}
            placeholder="Search medications..."
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => setShowDropdown(true)}
            className="w-full pl-10"
          />
          <p className="text-xs text-gray-500 mt-1">{searchStats}</p>
          
          {/* Auto-showing dropdown */}
          {showDropdown && (
            <div
              ref={dropdownRef}
              className="absolute z-50 w-full mt-1 bg-white rounded-md border border-gray-200 shadow-lg max-h-60 overflow-auto"
            >
              {filteredDrugs.length > 0 ? (
                <ul className="py-1">
                  {filteredDrugs.map((drugName) => (
                    <li 
                      key={drugName}
                      className={`px-3 py-2 cursor-pointer hover:bg-blue-50 ${selectedDrug === drugName ? 'bg-blue-50' : ''}`}
                      onClick={() => handleSelectDrug(drugName)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{drugName}</span>
                        {selectedDrug === drugName && <Check className="h-4 w-4 text-blue-600" />}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-3 py-2 text-gray-500 text-center text-sm">
                  {searchTerm ? `No drugs matching "${searchTerm}"` : "No drugs available"}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {selectedDrug && formsForSelectedDrug.length > 0 && (
        <div className="w-full">
          <Label htmlFor="drugForm" className="sr-only">Dosage Form</Label>
          <Select onValueChange={handleSelectForm} value={selectedForm}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select dosage form" />
            </SelectTrigger>
            <SelectContent>
              {formsForSelectedDrug.map(form => (
                <SelectItem key={form} value={form}>
                  {form}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {selectedDrug && selectedForm && (
        <div className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-100">
          <p className="font-medium text-blue-800 text-sm">Selected medication:</p>
          <p className="text-xs">{selectedDrug} - {selectedForm}</p>
        </div>
      )}
    </div>
  );
};

export default DrugSelector;
