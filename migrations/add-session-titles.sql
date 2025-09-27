-- Add title field to activity_sessions table
ALTER TABLE activity_sessions 
ADD COLUMN title VARCHAR(255);

-- Update existing sessions with default titles based on session number
UPDATE activity_sessions 
SET title = 'Session ' || session_number 
WHERE title IS NULL;

-- Optional: Add constraint to ensure title is not null for new records
-- ALTER TABLE activity_sessions ALTER COLUMN title SET NOT NULL;