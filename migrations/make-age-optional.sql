/**
 * Migration: Make participant age field optional
 * 
 * This migration updates the participants table to allow null values for the age field.
 * This enables the system to handle cases where only date of birth is provided,
 * or where neither age nor date of birth is available.
 */

-- Make age field nullable
ALTER TABLE participants ALTER COLUMN age DROP NOT NULL;

-- Add a check constraint to ensure at least one of age or date_of_birth is provided
-- (Optional - remove this constraint if you want to allow both to be null)
ALTER TABLE participants ADD CONSTRAINT check_age_or_dob 
  CHECK (age IS NOT NULL OR date_of_birth IS NOT NULL);