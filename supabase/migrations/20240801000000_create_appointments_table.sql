-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  chief_complaint TEXT NOT NULL,
  subjective TEXT,
  objective JSONB,
  attending_nurse UUID REFERENCES profiles(id),
  vital_signs JSONB,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  consultation_id UUID REFERENCES consultations(id),
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_consultation_id ON appointments(consultation_id);

-- Add function to get all appointments with patient and nurse names
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
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.patient_id,
    p.name AS patient_name,
    a.appointment_date,
    a.appointment_time,
    a.chief_complaint,
    a.subjective,
    a.objective,
    a.attending_nurse,
    n.name AS nurse_name,
    a.status,
    a.consultation_id,
    a.vital_signs,
    a.created_by,
    a.created_at
  FROM 
    appointments a
  JOIN 
    patients p ON a.patient_id = p.id
  LEFT JOIN 
    profiles n ON a.attending_nurse = n.id
  ORDER BY 
    a.appointment_date ASC, a.appointment_time ASC;
END;
$$ LANGUAGE plpgsql;

-- Add function to get appointments for a specific patient
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
  RETURN QUERY
  SELECT 
    a.id,
    a.appointment_date,
    a.appointment_time,
    a.chief_complaint,
    a.attending_nurse,
    n.name AS nurse_name,
    a.status,
    a.consultation_id
  FROM 
    appointments a
  LEFT JOIN 
    profiles n ON a.attending_nurse = n.id
  WHERE 
    a.patient_id = patient_id_param
  ORDER BY 
    a.appointment_date DESC, a.appointment_time DESC;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to update updated_at automatically
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER appointments_update_timestamp
BEFORE UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Add function to convert appointment to consultation
CREATE OR REPLACE FUNCTION convert_appointment_to_consultation(appointment_id_param UUID, physician_id_param UUID)
RETURNS UUID AS $$
DECLARE
  new_consultation_id UUID;
  appt RECORD;
BEGIN
  -- Get the appointment details
  SELECT * INTO appt FROM appointments WHERE id = appointment_id_param;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Appointment with ID % not found', appointment_id_param;
  END IF;
  
  -- Insert a new consultation based on the appointment
  INSERT INTO consultations (
    patient_id,
    patient_type,
    date,
    time,
    chief_complaint,
    subjective,
    objective,
    attending_physician,
    attending_nurse,
    vital_signs,
    created_by
  ) VALUES (
    appt.patient_id,
    'follow_up',
    appt.appointment_date,
    appt.appointment_time,
    appt.chief_complaint,
    appt.subjective,
    appt.objective,
    physician_id_param,
    appt.attending_nurse,
    appt.vital_signs,
    appt.created_by
  )
  RETURNING id INTO new_consultation_id;
  
  -- Update the appointment to link it to the consultation and mark as completed
  UPDATE appointments
  SET 
    consultation_id = new_consultation_id,
    status = 'completed',
    updated_at = NOW()
  WHERE id = appointment_id_param;
  
  RETURN new_consultation_id;
END;
$$ LANGUAGE plpgsql; 