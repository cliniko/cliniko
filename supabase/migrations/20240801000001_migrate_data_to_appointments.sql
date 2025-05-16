-- Migrate existing consultations data with dates in the future to appointments
-- This preserves scheduled appointments in the new schema
INSERT INTO appointments (
  patient_id,
  appointment_date,
  appointment_time,
  chief_complaint,
  subjective,
  objective,
  attending_nurse,
  vital_signs,
  status,
  consultation_id,
  created_by,
  created_at,
  updated_at
)
SELECT
  patient_id,
  date AS appointment_date,
  time AS appointment_time,
  chief_complaint,
  subjective,
  objective,
  attending_nurse,
  vital_signs,
  'scheduled' AS status,
  id AS consultation_id,
  created_by,
  created_at,
  created_at AS updated_at
FROM
  consultations
WHERE
  date > CURRENT_DATE
  OR (date = CURRENT_DATE AND (
    -- Convert time string to time type for comparison
    CAST(time AS TIME) > CURRENT_TIME
  ));

-- Update the status for appointments that are already linked to consultations
UPDATE appointments
SET status = 'completed'
WHERE consultation_id IS NOT NULL; 