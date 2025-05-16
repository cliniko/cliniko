-- Add isArchived field to patients table
ALTER TABLE patients
ADD COLUMN is_archived BOOLEAN DEFAULT FALSE;

-- Add isArchived field to consultations table
ALTER TABLE consultations
ADD COLUMN is_archived BOOLEAN DEFAULT FALSE;

-- Add isArchived field to appointments table
ALTER TABLE appointments
ADD COLUMN is_archived BOOLEAN DEFAULT FALSE;

-- Create indexes for better query performance when filtering by is_archived
CREATE INDEX idx_patients_is_archived ON patients (is_archived);
CREATE INDEX idx_consultations_is_archived ON consultations (is_archived);
CREATE INDEX idx_appointments_is_archived ON appointments (is_archived);

-- Update RPC functions to include is_archived filter

-- Update get_patient_consults function to filter by is_archived
CREATE OR REPLACE FUNCTION get_patient_consults(patient_id_param UUID, include_archived BOOLEAN DEFAULT FALSE)
RETURNS TABLE (
    id UUID,
    date TEXT,
    time TEXT,
    patient_id UUID,
    chief_complaint TEXT,
    attending_physician_name TEXT,
    attending_physician TEXT,
    created_at TIMESTAMPTZ,
    status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.date,
        c.time,
        c.patient_id,
        c.chief_complaint,
        p.name as attending_physician_name,
        c.attending_physician,
        c.created_at,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM appointments a 
                WHERE a.consultation_id = c.id AND a.status = 'completed'
            ) THEN 'completed'
            ELSE 'pending'
        END as status
    FROM 
        consultations c
    JOIN 
        profiles p ON c.attending_physician = p.id
    WHERE 
        c.patient_id = patient_id_param
        AND (NOT c.is_archived OR include_archived = TRUE)
    ORDER BY 
        c.date DESC, c.time DESC;
END;
$$ LANGUAGE plpgsql;

-- Update get_patient_appointments function to filter by is_archived
CREATE OR REPLACE FUNCTION get_patient_appointments(patient_id_param UUID, include_archived BOOLEAN DEFAULT FALSE)
RETURNS TABLE (
    id UUID,
    appointment_date TEXT,
    appointment_time TEXT,
    chief_complaint TEXT,
    attending_nurse TEXT,
    nurse_name TEXT,
    status TEXT,
    consultation_id UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.appointment_date,
        a.appointment_time,
        a.chief_complaint,
        a.attending_nurse,
        p.name as nurse_name,
        a.status,
        a.consultation_id
    FROM 
        appointments a
    LEFT JOIN 
        profiles p ON a.attending_nurse = p.id
    WHERE 
        a.patient_id = patient_id_param
        AND (NOT a.is_archived OR include_archived = TRUE)
    ORDER BY 
        a.appointment_date DESC, a.appointment_time DESC;
END;
$$ LANGUAGE plpgsql;

-- Update get_appointments_with_details function to filter by is_archived
CREATE OR REPLACE FUNCTION get_appointments_with_details(include_archived BOOLEAN DEFAULT FALSE)
RETURNS TABLE (
    id UUID,
    appointment_date TEXT,
    appointment_time TEXT,
    chief_complaint TEXT,
    status TEXT,
    patient_id UUID,
    patient_name TEXT,
    nurse_id UUID,
    nurse_name TEXT,
    is_archived BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.appointment_date,
        a.appointment_time,
        a.chief_complaint,
        a.status,
        a.patient_id,
        pt.name as patient_name,
        a.attending_nurse as nurse_id,
        p.name as nurse_name,
        a.is_archived
    FROM 
        appointments a
    JOIN 
        patients pt ON a.patient_id = pt.id
    LEFT JOIN 
        profiles p ON a.attending_nurse = p.id
    WHERE 
        (NOT a.is_archived OR include_archived = TRUE)
    ORDER BY 
        a.appointment_date DESC, a.appointment_time DESC;
END;
$$ LANGUAGE plpgsql; 