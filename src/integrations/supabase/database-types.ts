// This file defines the RPC function signatures for TypeScript
// Use this file to extend the existing Database type with the RPC functions

import { Database } from './types';

// Extend Database interface to include our RPC functions
interface SupabaseRPCFunctions {
  // New function names for appointments
  fetch_all_appointments: () => Promise<{
    id: string;
    appointment_date: string;
    appointment_time: string;
    chief_complaint: string;
    status: string;
    patient_id: string;
    patient_name: string;
    nurse_id: string;
    nurse_name: string;
    is_archived: boolean;
  }[]>;
  
  fetch_all_appointments_with_archived: () => Promise<{
    id: string;
    appointment_date: string;
    appointment_time: string;
    chief_complaint: string;
    status: string;
    patient_id: string;
    patient_name: string;
    nurse_id: string;
    nurse_name: string;
    is_archived: boolean;
  }[]>;
  
  // New function names for patient appointments
  fetch_patient_appointments: (args: { patient_id_param: string }) => Promise<{
    id: string;
    appointment_date: string;
    appointment_time: string;
    chief_complaint: string;
    attending_nurse: string;
    nurse_name: string;
    status: string;
    consultation_id: string;
    is_archived: boolean;
  }[]>;
  
  fetch_patient_appointments_with_archived: (args: { patient_id_param: string }) => Promise<{
    id: string;
    appointment_date: string;
    appointment_time: string;
    chief_complaint: string;
    attending_nurse: string;
    nurse_name: string;
    status: string;
    consultation_id: string;
    is_archived: boolean;
  }[]>;
  
  // New function names for patient consults
  fetch_patient_consults: (args: { patient_id_param: string }) => Promise<{
    id: string;
    date: string;
    time: string;
    patient_id: string;
    chief_complaint: string;
    attending_physician_name: string;
    attending_physician: string;
    created_at: string;
    status: string;
    is_archived: boolean;
  }[]>;
  
  fetch_patient_consults_with_archived: (args: { patient_id_param: string }) => Promise<{
    id: string;
    date: string;
    time: string;
    patient_id: string;
    chief_complaint: string;
    attending_physician_name: string;
    attending_physician: string;
    created_at: string;
    status: string;
    is_archived: boolean;
  }[]>;
  
  // Keep this legacy function for compatibility
  convert_appointment_to_consultation: (args: { appointment_id_param: string, physician_id_param: string }) => Promise<string>;
}

// Extend the Database interface
export interface ExtendedDatabase extends Database {
  rpc: SupabaseRPCFunctions;
} 