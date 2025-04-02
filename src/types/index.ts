export type UserRole = 'admin' | 'doctor' | 'nurse' | 'staff';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface Patient {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  contact?: string;
  email?: string;
  address?: string;
  medicalHistory?: string;
  createdAt: string;
}

// Define the mapping interface between DB and frontend types
export interface PatientMapping {
  id: string;
  name: string;
  date_of_birth: string;
  gender: string;
  contact: string | null;
  email: string | null;
  address: string | null;
  medical_history: string | null;
  created_at: string;
  created_by: string;
}

export interface Drug {
  id: string;
  drug_id: string;
  drug_name: string;
  drug_form: string;
  atc_code?: string;
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
