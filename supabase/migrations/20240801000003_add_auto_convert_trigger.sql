-- Create function to handle automatic conversion
CREATE OR REPLACE FUNCTION auto_convert_appointment_on_completion()
RETURNS TRIGGER AS $$
DECLARE
  new_consultation_id UUID;
BEGIN
  -- Check if this is a status update to 'completed' 
  -- and if consultation_id is null (hasn't been converted)
  IF NEW.status = 'completed' AND NEW.consultation_id IS NULL THEN
    -- Get the appointment with physician
    IF TG_ARGV[0]::TEXT = 'physician_required' AND TG_ARGV[1] IS NULL THEN
      RAISE EXCEPTION 'Physician ID is required to convert appointment to consultation';
    END IF;
    
    -- Use the passed physician_id if available, otherwise use the triggering user
    DECLARE physician_id UUID;
    BEGIN
      IF TG_ARGV[1] IS NOT NULL THEN
        physician_id := TG_ARGV[1]::UUID;
      ELSE
        -- Default to current user if no physician specified
        physician_id := auth.uid();
      END IF;
      
      -- Insert a new consultation using appointment data
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
        NEW.patient_id,
        'follow_up',
        NEW.appointment_date,
        NEW.appointment_time,
        NEW.chief_complaint,
        NEW.subjective,
        NEW.objective,
        physician_id,
        NEW.attending_nurse,
        NEW.vital_signs,
        NEW.created_by
      )
      RETURNING id INTO new_consultation_id;
      
      -- Update the appointment to link it to the consultation
      NEW.consultation_id := new_consultation_id;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that will fire on appointment update
CREATE TRIGGER appointment_auto_convert_trigger
BEFORE UPDATE ON appointments
FOR EACH ROW
WHEN (OLD.status <> 'completed' AND NEW.status = 'completed' AND NEW.consultation_id IS NULL)
EXECUTE FUNCTION auto_convert_appointment_on_completion('physician_required'); 