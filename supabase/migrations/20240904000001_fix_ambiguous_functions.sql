-- Drop all versions of the functions to avoid conflicts
DROP FUNCTION IF EXISTS get_patient_consults(UUID, BOOLEAN);
DROP FUNCTION IF EXISTS get_patient_appointments(UUID, BOOLEAN);
DROP FUNCTION IF EXISTS get_appointments_with_details(BOOLEAN);
DROP FUNCTION IF EXISTS get_patient_consults(UUID);
DROP FUNCTION IF EXISTS get_patient_appointments(UUID);
DROP FUNCTION IF EXISTS get_appointments_with_details();

-- Also drop our attempted fixes from previous migrations
DROP FUNCTION IF EXISTS get_patient_consults_archived(UUID, BOOLEAN);
DROP FUNCTION IF EXISTS get_patient_appointments_archived(UUID, BOOLEAN);
DROP FUNCTION IF EXISTS get_appointments_with_details_archived(BOOLEAN);

-- Create functions with completely distinct names

-- Function for getting all appointments (non-archived only)
CREATE FUNCTION fetch_all_appointments()
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
        NOT a.is_archived
    ORDER BY 
        a.appointment_date DESC, a.appointment_time DESC;
END;
$$ LANGUAGE plpgsql;

-- Function for getting all appointments including archived ones
CREATE FUNCTION fetch_all_appointments_with_archived()
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
    ORDER BY 
        a.appointment_date DESC, a.appointment_time DESC;
END;
$$ LANGUAGE plpgsql;

-- Function for getting patient's appointments (non-archived only)
CREATE FUNCTION fetch_patient_appointments(patient_id_param UUID)
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
        AND NOT a.is_archived
    ORDER BY 
        a.appointment_date DESC, a.appointment_time DESC;
END;
$$ LANGUAGE plpgsql;

-- Function for getting patient's appointments including archived ones
CREATE FUNCTION fetch_patient_appointments_with_archived(patient_id_param UUID)
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
    ORDER BY 
        a.appointment_date DESC, a.appointment_time DESC;
END;
$$ LANGUAGE plpgsql;

-- Function for getting patient's consults (non-archived only)
CREATE FUNCTION fetch_patient_consults(patient_id_param UUID)
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
        AND NOT c.is_archived
    ORDER BY 
        c.date DESC, c.time DESC;
END;
$$ LANGUAGE plpgsql;

-- Function for getting patient's consults including archived ones
CREATE FUNCTION fetch_patient_consults_with_archived(patient_id_param UUID)
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
    ORDER BY 
        c.date DESC, c.time DESC;
END;
$$ LANGUAGE plpgsql; 