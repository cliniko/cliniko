import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Patient, Consultation, Appointment } from '@/types';

interface PatientDetailsOptions {
  patientId: string;
  includeArchived?: boolean;
  startDate?: string | Date;
  endDate?: string | Date;
  limit?: number;
  offset?: number;
  enabled?: boolean;
}

interface PatientDetailsResponse {
  patient: Patient;
  consultations: Consultation[];
  appointments: Appointment[];
}

export function usePatientDetails({
  patientId,
  includeArchived = false,
  startDate,
  endDate,
  limit = 10,
  offset = 0,
  enabled = true
}: PatientDetailsOptions) {
  // Format dates for the API
  const formattedStartDate = startDate 
    ? (startDate instanceof Date ? startDate.toISOString().split('T')[0] : startDate)
    : undefined;
    
  const formattedEndDate = endDate
    ? (endDate instanceof Date ? endDate.toISOString().split('T')[0] : endDate)
    : undefined;
  
  return useQuery({
    queryKey: [
      'patient', 
      patientId, 
      includeArchived, 
      formattedStartDate, 
      formattedEndDate, 
      limit, 
      offset
    ],
    queryFn: async () => {
      try {
        // Try to use the optimized function
        const { data: optimizedData, error: optimizedError } = await supabase
          .rpc('get_patient_with_related_data', {
            patient_id_param: patientId,
            include_archived: includeArchived,
            start_date: formattedStartDate,
            end_date: formattedEndDate,
            limit_param: limit,
            offset_param: offset
          });
        
        if (optimizedError) {
          console.warn('Optimized patient data fetch failed, falling back to standard API', optimizedError);
          
          // Fallback to separate queries
          return await fetchPatientDataSeparately(
            patientId, 
            includeArchived, 
            formattedStartDate, 
            formattedEndDate,
            limit,
            offset
          );
        }
        
        // Parse the JSON response
        return optimizedData as PatientDetailsResponse;
      } catch (error) {
        console.error('Error fetching patient details:', error);
        throw error;
      }
    },
    enabled: enabled && !!patientId,
    staleTime: 1 * 60 * 1000, // 1 minute 
  });
}

async function fetchPatientDataSeparately(
  patientId: string,
  includeArchived: boolean,
  startDate?: string,
  endDate?: string,
  limit = 10,
  offset = 0
): Promise<PatientDetailsResponse> {
  // Fetch patient data
  const { data: patientData, error: patientError } = await supabase
    .from('patients')
    .select('*')
    .eq('id', patientId)
    .single();
    
  if (patientError) throw patientError;
  
  // Format patient data
  const patient: Patient = {
    id: patientData.id,
    name: patientData.name,
    dateOfBirth: patientData.date_of_birth,
    gender: patientData.gender,
    contact: patientData.contact || undefined,
    email: patientData.email || undefined,
    address: patientData.address || undefined,
    position: patientData.position || undefined,
    designation: patientData.designation || undefined,
    medicalHistory: patientData.medical_history || undefined,
    createdAt: patientData.created_at,
    isArchived: patientData.is_archived,
  };
  
  // Build date filters for consultations
  let consultQuery = supabase
    .from('consultations')
    .select(`
      *,
      profiles:attending_physician (name)
    `)
    .eq('patient_id', patientId)
    .order('date', { ascending: false })
    .limit(limit)
    .range(offset, offset + limit - 1);
    
  if (!includeArchived) {
    consultQuery = consultQuery.eq('is_archived', false);
  }
  
  if (startDate) {
    consultQuery = consultQuery.gte('date', startDate);
  }
  
  if (endDate) {
    consultQuery = consultQuery.lte('date', endDate);
  }
  
  const { data: consultationsData, error: consultationsError } = await consultQuery;
  
  if (consultationsError) throw consultationsError;
  
  // Format consultations
  const consultations = (consultationsData || []).map((consult: any) => ({
    id: consult.id,
    patientId: consult.patient_id,
    date: consult.date,
    time: consult.time,
    chiefComplaint: consult.chief_complaint,
    encounterType: consult.encounter_type,
    attendingPhysician: consult.attending_physician,
    attendingPhysicianName: consult.profiles?.name,
    createdAt: consult.created_at,
    isArchived: consult.is_archived,
  })) as Consultation[];
  
  // Build date filters for appointments
  let appointmentQuery = supabase
    .from('appointments')
    .select(`
      *,
      profiles:attending_nurse (name)
    `)
    .eq('patient_id', patientId)
    .order('appointment_date', { ascending: false })
    .limit(limit)
    .range(offset, offset + limit - 1);
    
  if (!includeArchived) {
    appointmentQuery = appointmentQuery.eq('is_archived', false);
  }
  
  if (startDate) {
    appointmentQuery = appointmentQuery.gte('appointment_date', startDate);
  }
  
  if (endDate) {
    appointmentQuery = appointmentQuery.lte('appointment_date', endDate);
  }
  
  const { data: appointmentsData, error: appointmentsError } = await appointmentQuery;
  
  if (appointmentsError) throw appointmentsError;
  
  // Format appointments
  const appointments = (appointmentsData || []).map((appt: any) => ({
    id: appt.id,
    patientId: appt.patient_id,
    appointmentDate: appt.appointment_date,
    appointmentTime: appt.appointment_time,
    chiefComplaint: appt.chief_complaint,
    attendingNurse: appt.attending_nurse,
    nurseName: appt.profiles?.name,
    status: appt.status,
    consultationId: appt.consultation_id,
    createdAt: appt.created_at,
    isArchived: appt.is_archived,
  })) as Appointment[];
  
  return {
    patient,
    consultations,
    appointments
  };
} 