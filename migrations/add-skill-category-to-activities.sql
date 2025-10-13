-- Add skill_category column to activities table
-- This field is required for training activities to track the type of skills being trained

ALTER TABLE activities 
ADD COLUMN skill_category TEXT;

-- Add a comment to explain the column
COMMENT ON COLUMN activities.skill_category IS 'Type of skill for training activities: business, vocational, or soft_skills';
