// Clinical tables types

export interface Drug {
  id: string;
  drug_id: string;
  name: string;
  form: string;
  atcCode?: string;
}

export interface DrugWithForm extends Drug {
  // Extending Drug interface to keep compatibility
}

export interface Prescription {
  drug: Drug;
  brand?: string;
  form: string;
  strength: string;
  quantity: string;
  instructions: string;
  indication: string;
}

export interface DrugSelectorProps {
  onDrugSelect: (drug: Drug) => void;
}

export interface ICD10Code {
  code: string;
  description: string;
}
