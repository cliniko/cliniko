-- Fix the ambiguous function definitions by completely replacing them

-- First, drop all versions of the problematic functions
DROP FUNCTION IF EXISTS get_patient_consults(UUID, BOOLEAN);
DROP FUNCTION IF EXISTS get_patient_appointments(UUID, BOOLEAN);
DROP FUNCTION IF EXISTS get_appointments_with_details(BOOLEAN);
DROP FUNCTION IF EXISTS get_patient_consults(UUID);
DROP FUNCTION IF EXISTS get_patient_appointments(UUID);
DROP FUNCTION IF EXISTS get_appointments_with_details();

-- Completely recreate the functions with archive support

-- Function to get patient consultations with archive support
CREATE FUNCTION get_patient_consults_archived(patient_id_param UUID, include_archived BOOLEAN DEFAULT FALSE)
RETURNS TABLE (
    id UUID,
    date TEXT,
    time TEXT,
    patient_id UUID,
    chief_complaint TEXT,
    attending_physician_name TEXT,
    attending_physician TEXT,
    created_at TIMESTAMPTZ,
    status TEXT,
    is_archived BOOLEAN
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
        END as status,
        c.is_archived
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

-- Function to get patient appointments with archive support
CREATE FUNCTION get_patient_appointments_archived(patient_id_param UUID, include_archived BOOLEAN DEFAULT FALSE)
RETURNS TABLE (
    id UUID,
    appointment_date TEXT,
    appointment_time TEXT,
    chief_complaint TEXT,
    attending_nurse TEXT,
    nurse_name TEXT,
    status TEXT,
    consultation_id UUID,
    is_archived BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.appointment_date::TEXT,
        a.appointment_time::TEXT,
        a.chief_complaint,
        a.attending_nurse::TEXT,
        p.name as nurse_name,
        a.status,
        a.consultation_id,
        a.is_archived
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

-- Function to get all appointments with archive support
CREATE FUNCTION get_appointments_with_details_archived(include_archived BOOLEAN DEFAULT FALSE)
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
        a.appointment_date::TEXT,
        a.appointment_time::TEXT,
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

-- Recreate the original function names as aliases to avoid breaking existing code
CREATE FUNCTION get_patient_consults(patient_id_param UUID)
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
        id, date, time, patient_id, chief_complaint, 
        attending_physician_name, attending_physician, created_at, status
    FROM get_patient_consults_archived(patient_id_param, FALSE);
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION get_patient_appointments(patient_id_param UUID)
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
        id, appointment_date, appointment_time, chief_complaint,
        attending_nurse, nurse_name, status, consultation_id
    FROM get_patient_appointments_archived(patient_id_param, FALSE);
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION get_appointments_with_details()
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
    RETURN QUERY SELECT * FROM get_appointments_with_details_archived(FALSE);
END;
$$ LANGUAGE plpgsql; 