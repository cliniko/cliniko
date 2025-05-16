-- Fix the function signatures issue for the archive system

-- First, drop all versions of the functions to avoid ambiguity
DROP FUNCTION IF EXISTS get_patient_consults(UUID);
DROP FUNCTION IF EXISTS get_patient_consults(UUID, BOOLEAN);
DROP FUNCTION IF EXISTS get_patient_appointments(UUID);
DROP FUNCTION IF EXISTS get_patient_appointments(UUID, BOOLEAN);
DROP FUNCTION IF EXISTS get_appointments_with_details();
DROP FUNCTION IF EXISTS get_appointments_with_details(BOOLEAN);

-- Create the main functions with archive parameter
CREATE OR REPLACE FUNCTION get_patient_consults_with_archive(patient_id_param UUID, include_archived BOOLEAN)
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

CREATE OR REPLACE FUNCTION get_patient_appointments_with_archive(patient_id_param UUID, include_archived BOOLEAN)
RETURNS TABLE (
    id UUID,
    appointment_date DATE,
    appointment_time TIME,
    chief_complaint TEXT,
    attending_nurse UUID,
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

CREATE OR REPLACE FUNCTION get_appointments_with_details_with_archive(include_archived BOOLEAN)
RETURNS TABLE (
    id UUID,
    patient_id UUID, 
    patient_name TEXT,
    appointment_date DATE,
    appointment_time TIME,
    chief_complaint TEXT,
    subjective TEXT,
    objective JSONB,
    attending_nurse UUID,
    nurse_name TEXT,
    status TEXT,
    consultation_id UUID,
    vital_signs JSONB,
    created_by UUID,
    created_at TIMESTAMPTZ,
    is_archived BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.patient_id,
        pt.name as patient_name,
        a.appointment_date,
        a.appointment_time,
        a.chief_complaint,
        a.subjective,
        a.objective,
        a.attending_nurse,
        p.name as nurse_name,
        a.status,
        a.consultation_id,
        a.vital_signs,
        a.created_by,
        a.created_at,
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
        a.appointment_date ASC, a.appointment_time ASC;
END;
$$ LANGUAGE plpgsql;

-- Create the simplified functions that call the archive versions
CREATE OR REPLACE FUNCTION get_patient_consults(patient_id_param UUID)
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
    RETURN QUERY SELECT * FROM get_patient_consults_with_archive(patient_id_param, FALSE);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_patient_appointments(patient_id_param UUID)
RETURNS TABLE (
    id UUID,
    appointment_date DATE,
    appointment_time TIME,
    chief_complaint TEXT,
    attending_nurse UUID,
    nurse_name TEXT,
    status TEXT,
    consultation_id UUID
) AS $$
BEGIN
    RETURN QUERY SELECT * FROM get_patient_appointments_with_archive(patient_id_param, FALSE);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_appointments_with_details()
RETURNS TABLE (
    id UUID,
    patient_id UUID, 
    patient_name TEXT,
    appointment_date DATE,
    appointment_time TIME,
    chief_complaint TEXT,
    subjective TEXT,
    objective JSONB,
    attending_nurse UUID,
    nurse_name TEXT,
    status TEXT,
    consultation_id UUID,
    vital_signs JSONB,
    created_by UUID,
    created_at TIMESTAMPTZ,
    is_archived BOOLEAN
) AS $$
BEGIN
    RETURN QUERY SELECT * FROM get_appointments_with_details_with_archive(FALSE);
END;
$$ LANGUAGE plpgsql; 