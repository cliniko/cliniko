
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
  gender: 'male' | 'female' | 'other';
  contact: string;
  email: string;
  address: string;
  medicalHistory?: string;
  createdAt: string;
}

export interface VitalSigns {
  id: string;
  patientId: string;
  date: string;
  systolicBP: number;
  diastolicBP: number;
  heartRate: number;
  respiratoryRate: number;
  temperature: number;
  oxygenSaturation: number;
  height?: number;
  weight?: number;
  createdBy: string;
}

export interface Consultation {
  id: string;
  patientId: string;
  date: string;
  time: string;
  patientType: string;
  chiefComplaint: string;
  objective: string[];
  assessment: string[];
  plan: string[];
  vitalSigns?: {
    systolicBP?: number;
    diastolicBP?: number;
    temperature?: number;
    heartRate?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
    height?: number;
    weight?: number;
  };
  subjective?: string;
  prescription?: string[];
  attendingPhysician: string;
  attendingNurse?: string;
  bpMonitoring: boolean;
  hbA1cMonitoring: boolean;
  createdAt: string;
  createdBy: string;
}
