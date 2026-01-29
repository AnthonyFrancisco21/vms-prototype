-- Alter employees table to match new schema
ALTER TABLE employees ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Update existing data
UPDATE employees SET is_active = true WHERE is_active IS NULL;

-- Make rfid NOT NULL and UNIQUE
ALTER TABLE employees ALTER COLUMN rfid SET NOT NULL;
ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_rfid_unique;
ALTER TABLE employees ADD CONSTRAINT employees_rfid_unique UNIQUE (rfid);

-- Update status default
ALTER TABLE employees ALTER COLUMN status SET DEFAULT 'active';

-- Remove old columns
ALTER TABLE employees DROP COLUMN IF EXISTS entry_time;
ALTER TABLE employees DROP COLUMN IF EXISTS exit_time;
ALTER TABLE employees DROP COLUMN IF EXISTS employee_id;
ALTER TABLE employees DROP COLUMN IF EXISTS department;
ALTER TABLE employees DROP COLUMN IF EXISTS position;
ALTER TABLE employees DROP COLUMN IF EXISTS hire_date;

-- Create attendance_logs table
CREATE TABLE IF NOT EXISTS attendance_logs (
    id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id varchar REFERENCES employees(id) NOT NULL,
    rfid text NOT NULL,
    time_in timestamp NOT NULL,
    time_out timestamp,
    date timestamp NOT NULL DEFAULT now(),
    status text NOT NULL DEFAULT 'active'
);
