-- Add participant_id column to vsla_members table to link VSLA members with participants
-- This establishes a proper relationship between VSLA membership and participant records

-- Step 1: Add the participant_id column (nullable initially to handle existing data)
ALTER TABLE vsla_members 
ADD COLUMN IF NOT EXISTS participant_id UUID REFERENCES participants(id) ON DELETE CASCADE;

-- Step 2: Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_vsla_members_participant_id ON vsla_members(participant_id);

-- Step 3: Add a composite unique constraint to prevent duplicate memberships
-- A participant can only be a member of a VSLA once
CREATE UNIQUE INDEX IF NOT EXISTS idx_vsla_members_unique_participant_vsla 
ON vsla_members(participant_id, vsla_id) 
WHERE participant_id IS NOT NULL;

-- Note: Existing vsla_members records will have NULL participant_id
-- These can be migrated manually or through an import process
-- New members should always have a participant_id

-- Optional: Add a check to ensure either participant_id is set OR legacy fields are set
-- Uncomment if you want to enforce this at database level:
-- ALTER TABLE vsla_members 
-- ADD CONSTRAINT check_participant_or_legacy 
-- CHECK (participant_id IS NOT NULL OR (first_name IS NOT NULL AND last_name IS NOT NULL AND phone IS NOT NULL));
