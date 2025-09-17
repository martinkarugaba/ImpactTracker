-- Add new demographic fields to participants table
-- This migration adds employment tracking, financial inclusion, and location classification fields

-- Add disability type field
ALTER TABLE participants ADD COLUMN disability_type TEXT;

-- Add employment tracking fields
ALTER TABLE participants ADD COLUMN wage_employment_status TEXT;
ALTER TABLE participants ADD COLUMN wage_employment_sector TEXT;
ALTER TABLE participants ADD COLUMN wage_employment_scale TEXT;

ALTER TABLE participants ADD COLUMN self_employment_status TEXT;
ALTER TABLE participants ADD COLUMN self_employment_sector TEXT;
ALTER TABLE participants ADD COLUMN business_scale TEXT;

ALTER TABLE participants ADD COLUMN secondary_employment_status TEXT;
ALTER TABLE participants ADD COLUMN secondary_employment_sector TEXT;
ALTER TABLE participants ADD COLUMN secondary_business_scale TEXT;

-- Add financial inclusion fields
ALTER TABLE participants ADD COLUMN accessed_loans TEXT NOT NULL DEFAULT 'no';
ALTER TABLE participants ADD COLUMN individual_saving TEXT NOT NULL DEFAULT 'no';
ALTER TABLE participants ADD COLUMN group_saving TEXT NOT NULL DEFAULT 'no';

-- Add location classification
ALTER TABLE participants ADD COLUMN location_setting TEXT;

-- Add comments for field documentation
COMMENT ON COLUMN participants.disability_type IS 'Type of disability (visual, hearing, physical, mental, etc.)';
COMMENT ON COLUMN participants.wage_employment_status IS 'Status: employed, new_job, sustained_job, improved_job';
COMMENT ON COLUMN participants.wage_employment_sector IS 'Sector: petty_trade, food_drinks, manufacturing, agribusiness, etc.';
COMMENT ON COLUMN participants.wage_employment_scale IS 'Scale: micro, small, medium, large';
COMMENT ON COLUMN participants.self_employment_status IS 'Status: self_employed, new_business, sustained_business, improved_business';
COMMENT ON COLUMN participants.self_employment_sector IS 'Sector: petty_trade, food_drinks, agriculture, crafts, etc.';
COMMENT ON COLUMN participants.business_scale IS 'Business scale: micro, small, medium, large';
COMMENT ON COLUMN participants.secondary_employment_status IS 'Status: secondary_employed, new_secondary_job, sustained_secondary_job, improved_secondary_job';
COMMENT ON COLUMN participants.secondary_employment_sector IS 'Sector: retail, services, transport, etc.';
COMMENT ON COLUMN participants.secondary_business_scale IS 'Secondary business scale: micro, small, medium, large';
COMMENT ON COLUMN participants.accessed_loans IS 'Whether participant has accessed loans (yes/no)';
COMMENT ON COLUMN participants.individual_saving IS 'Whether participant does individual saving (yes/no)';
COMMENT ON COLUMN participants.group_saving IS 'Whether participant participates in group/VSLA saving (yes/no)';
COMMENT ON COLUMN participants.location_setting IS 'Location type: urban, rural';