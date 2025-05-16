-- Backfill existing completed consultations as appointments
-- These represent consultations that have already happened and were completed
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
  'completed' AS status,
  id AS consultation_id,
  created_by,
  created_at,
  created_at AS updated_at
FROM
  consultations
WHERE
  date <= CURRENT_DATE
  AND (date < CURRENT_DATE OR (
    date = CURRENT_DATE AND CAST(time AS TIME) <= CURRENT_TIME
  ))
  AND NOT EXISTS (
    -- Avoid duplicates if already created by previous migration
    SELECT 1 FROM appointments a WHERE a.consultation_id = consultations.id
  ); 