-- Migration: Update VSLAs table with comprehensive fields
-- Date: 2025-09-12
-- Purpose: Add all required VSLA fields as specified by user requirements

-- Add new columns to vslas table
ALTER TABLE vslas 
ADD COLUMN IF NOT EXISTS primary_business TEXT NOT NULL DEFAULT 'Agriculture',
ADD COLUMN IF NOT EXISTS primary_business_other TEXT,
ADD COLUMN IF NOT EXISTS region TEXT,
ADD COLUMN IF NOT EXISTS county TEXT,
ADD COLUMN IF NOT EXISTS meeting_location TEXT,
ADD COLUMN IF NOT EXISTS closing_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS lc1_chairperson_name TEXT,
ADD COLUMN IF NOT EXISTS lc1_chairperson_contact TEXT,
ADD COLUMN IF NOT EXISTS has_constitution TEXT NOT NULL DEFAULT 'no',
ADD COLUMN IF NOT EXISTS has_signed_constitution TEXT NOT NULL DEFAULT 'no',
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS bank_branch TEXT,
ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
ADD COLUMN IF NOT EXISTS registration_certificate_number TEXT,
ADD COLUMN IF NOT EXISTS sacco_member TEXT NOT NULL DEFAULT 'no',
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Rename formed_date to formation_date for consistency
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vslas' AND column_name = 'formed_date') THEN
        ALTER TABLE vslas RENAME COLUMN formed_date TO formation_date;
    END IF;
END $$;

-- Add check constraints for enum-like fields
ALTER TABLE vslas 
ADD CONSTRAINT check_primary_business 
CHECK (primary_business IN ('Agriculture', 'Bakery', 'Basket weaving', 'Boda-boda', 'Catering and cookery', 'Hairdressing and cosmetology', 'Leather and craft making', 'Others'));

ALTER TABLE vslas 
ADD CONSTRAINT check_has_constitution 
CHECK (has_constitution IN ('yes', 'no'));

ALTER TABLE vslas 
ADD CONSTRAINT check_has_signed_constitution 
CHECK (has_signed_constitution IN ('yes', 'no'));

ALTER TABLE vslas 
ADD CONSTRAINT check_sacco_member 
CHECK (sacco_member IN ('yes', 'no'));

-- Add conditional constraint for primary_business_other
-- This ensures that if primary_business is 'Others', then primary_business_other must be specified
-- Note: PostgreSQL doesn't support conditional CHECK constraints directly, so this would need to be handled in application logic

-- Update existing records if any exist (set defaults)
UPDATE vslas 
SET 
    primary_business = 'Agriculture',
    has_constitution = 'no',
    has_signed_constitution = 'no',
    sacco_member = 'no'
WHERE primary_business IS NULL 
   OR has_constitution IS NULL 
   OR has_signed_constitution IS NULL 
   OR sacco_member IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN vslas.primary_business IS 'Primary business activity: Agriculture, Bakery, Basket weaving, Boda-boda, Catering and cookery, Hairdressing and cosmetology, Leather and craft making, Others';
COMMENT ON COLUMN vslas.primary_business_other IS 'Specify other business if primary_business is Others';
COMMENT ON COLUMN vslas.region IS 'Administrative region';
COMMENT ON COLUMN vslas.county IS 'Administrative county';
COMMENT ON COLUMN vslas.meeting_location IS 'Location where VSLA meetings are held';
COMMENT ON COLUMN vslas.formation_date IS 'Date when the VSLA was formed';
COMMENT ON COLUMN vslas.closing_date IS 'Date when the VSLA was closed (if applicable)';
COMMENT ON COLUMN vslas.lc1_chairperson_name IS 'Name of the LC1 Chairperson';
COMMENT ON COLUMN vslas.lc1_chairperson_contact IS 'Contact information for LC1 Chairperson';
COMMENT ON COLUMN vslas.has_constitution IS 'Whether VSLA has a constitution (yes/no)';
COMMENT ON COLUMN vslas.has_signed_constitution IS 'Whether VSLA has a signed constitution (yes/no)';
COMMENT ON COLUMN vslas.bank_name IS 'Name of the bank where VSLA has account';
COMMENT ON COLUMN vslas.bank_branch IS 'Bank branch name';
COMMENT ON COLUMN vslas.bank_account_number IS 'Bank account number';
COMMENT ON COLUMN vslas.registration_certificate_number IS 'Registration certificate number';
COMMENT ON COLUMN vslas.sacco_member IS 'Whether VSLA is a SACCO member (yes/no)';
COMMENT ON COLUMN vslas.notes IS 'Additional notes and comments';