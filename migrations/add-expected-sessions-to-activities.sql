-- Add expected_sessions field to activities table
-- This field stores the user's expected number of sessions when creating an activity

ALTER TABLE activities ADD COLUMN expected_sessions INTEGER;

-- Add comment to describe the field
COMMENT ON COLUMN activities.expected_sessions IS 'Expected number of sessions when the activity was planned';