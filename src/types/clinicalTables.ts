
// Types for drug selector
export interface Drug {
  drug_id: string;
  name: string;
  form: string;
  atcCode: string;
}

export interface DrugSelectorProps {
  onDrugSelect: (drug: Drug) => void;
}

// Types for ICD10 selector
export interface ICD10Entry {
  code: string;
  description: string;
  fullEntry: string;
}

export interface ICD10SelectorProps {
  value: string;
  onChange: (value: string) => void;
}

// For prescription form
export interface Prescription {
  drug: Drug;
  brand?: string;
  form: string;
  strength: string;
  quantity: string;
  instructions: string;
  indication: string;
}

// Global Window interface extension for Clinical Tables
declare global {
  interface Window {
    Def: {
      Autocompleter: {
        Search: new (element: HTMLElement, apiUrl: string, options: any) => void;
      }
    }
  }
}
