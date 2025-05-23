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
  position?: string;
  designation?: string;
  medicalHistory?: string;
  createdAt: string;
  isArchived?: boolean;
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
  position: string | null;
  designation: string | null;
  medical_history: string | null;
  created_at: string;
  created_by: string;
  is_archived: boolean;
}

export interface Drug {
  id: string;
  drug_id: string;
  drug_name: string;
  drug_form: string;
  atc_code?: string;
}

export interface Prescription {
  drug: DrugWithForm;
  brand?: string;
  form: string;
  strength: string;
  quantity: string;
  instructions: string;
  indication: string;
}

export interface DrugWithForm {
  id: string;
  drug_id: string;
  name: string;
  form: string;
  atcCode?: string;
}

// Add ICD-10 specific interfaces
export interface ICD10Code {
  code: string;
  name: string;
  description?: string;
}

// Consultation interface for the consultations table in Supabase
export interface Consultation {
  id: string;
  patient_id: string;
  patient_name?: string;
  patient_type: string;
  date: string; // YYYY-MM-DD format
  time: string; // HH:MM format
  chief_complaint: string;
  subjective: string;
  objective: { id: string; value: string }[];
  assessment: string;
  plan: { id: string; value: string }[];
  vital_signs?: {
    systolicBP?: number | null;
    diastolicBP?: number | null;
    temperature?: number | null;
    heartRate?: number | null;
    respiratoryRate?: number | null;
    oxygenSaturation?: number | null;
    height?: number | null;
    weight?: number | null;
  };
  prescriptions?: {
    name: string;
    dosage: string;
    route: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }[];
  attending_physician: string;
  attending_nurse?: string;
  bp_monitoring: boolean;
  hba1c_monitoring: boolean;
  created_by: string;
  created_at: string;
  isArchived?: boolean;
  encounterType: EncounterType;
  referenceConsultationId?: string | null;
  assessmentItems?: AssessmentItem[] | null;
  additionalRemarks?: string | null;
}

/**
 * Appointment interface for the appointments table in Supabase
 * Appointments are incomplete consultations that may be converted to full consultations later.
 * - If consultation_id is null: This is a scheduled appointment that hasn't happened yet
 * - If consultation_id is set: This appointment has been converted to a consultation
 */
export interface Appointment {
  id: string;
  patient_id: string;
  appointment_date: string;
  appointment_time: string;
  chief_complaint: string;
  subjective: string | null;
  objective: any[] | null;
  attending_nurse: string | null;
  vital_signs: any | null;
  status: 'scheduled' | 'completed' | 'cancelled';
  consultation_id: string | null; // Reference to consultation if this appointment has been converted
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined fields from RPC functions
  patient_name?: string;
  nurse_name?: string;
  isArchived?: boolean;
}

/**
 * Appointment form submission type
 * Used for creating new appointment records
 */
export interface AppointmentSubmission {
  patient_id: string;
  appointment_date: string | Date;
  appointment_time: string;
  chief_complaint: string;
  subjective: string | null;
  objective: any[] | null;
  attending_nurse: string | null;
  vital_signs: any | null;
  status: 'scheduled' | 'completed' | 'cancelled';
  consultation_id: string | null;
  created_by: string;
  isArchived?: boolean;
}

// Add these new interfaces

export interface AssessmentItem {
  id: string;
  icdCode: string | null;
  icdName: string | null;
  description: string;
}

export enum EncounterType {
  NEW_CONSULT = "NEW_CONSULT",
  FOLLOW_UP = "FOLLOW_UP",
  EMERGENCY = "EMERGENCY"
}

// Add a type for the consultation reference display
export interface ConsultationReference {
  id: string;
  date: string;
  chiefComplaint: string;
}
