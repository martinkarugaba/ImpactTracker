-- Add comprehensive schema to vslas table
-- This migration adds all missing columns to match the application schema

-- Basic Information
ALTER TABLE vslas ADD COLUMN IF NOT EXISTS code text NOT NULL DEFAULT '';
ALTER TABLE vslas ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE vslas ADD COLUMN IF NOT EXISTS primary_business text NOT NULL DEFAULT 'Others';
ALTER TABLE vslas ADD COLUMN IF NOT EXISTS primary_business_other text;

-- Project References
ALTER TABLE vslas ADD COLUMN IF NOT EXISTS cluster_id uuid;
ALTER TABLE vslas ADD COLUMN IF NOT EXISTS project_id uuid;

-- Location Information
ALTER TABLE vslas ADD COLUMN IF NOT EXISTS country text NOT NULL DEFAULT 'Uganda';
ALTER TABLE vslas ADD COLUMN IF NOT EXISTS region text;
ALTER TABLE vslas ADD COLUMN IF NOT EXISTS district text NOT NULL DEFAULT '';
ALTER TABLE vslas ADD COLUMN IF NOT EXISTS county text;
ALTER TABLE vslas ADD COLUMN IF NOT EXISTS sub_county text NOT NULL DEFAULT '';
ALTER TABLE vslas ADD COLUMN IF NOT EXISTS parish text NOT NULL DEFAULT '';
ALTER TABLE vslas ADD COLUMN IF NOT EXISTS village text NOT NULL DEFAULT '';
ALTER TABLE vslas ADD COLUMN IF NOT EXISTS address text;

-- Financial Information
ALTER TABLE vslas ADD COLUMN IF NOT EXISTS total_savings integer NOT NULL DEFAULT 0;
ALTER TABLE vslas ADD COLUMN IF NOT EXISTS total_loans integer NOT NULL DEFAULT 0;

-- Meeting Information
ALTER TABLE vslas ADD COLUMN IF NOT EXISTS meeting_frequency text NOT NULL DEFAULT 'weekly';
ALTER TABLE vslas ADD COLUMN IF NOT EXISTS meeting_time text;
ALTER TABLE vslas ADD COLUMN IF NOT EXISTS meeting_location text;

-- Dates
ALTER TABLE vslas ADD COLUMN IF NOT EXISTS formation_date timestamp NOT NULL DEFAULT now();
ALTER TABLE vslas ADD COLUMN IF NOT EXISTS closing_date timestamp;

-- Local Leadership
ALTER TABLE vslas ADD COLUMN IF NOT EXISTS lc1_chairperson_name text;
ALTER TABLE vslas ADD COLUMN IF NOT EXISTS lc1_chairperson_contact text;

-- Governance
ALTER TABLE vslas ADD COLUMN IF NOT EXISTS has_constitution text NOT NULL DEFAULT 'no';
ALTER TABLE vslas ADD COLUMN IF NOT EXISTS has_signed_constitution text NOT NULL DEFAULT 'no';

-- Banking Information
ALTER TABLE vslas ADD COLUMN IF NOT EXISTS bank_name text;
ALTER TABLE vslas ADD COLUMN IF NOT EXISTS bank_branch text;
ALTER TABLE vslas ADD COLUMN IF NOT EXISTS bank_account_number text;
ALTER TABLE vslas ADD COLUMN IF NOT EXISTS registration_certificate_number text;

-- SACCO Information
ALTER TABLE vslas ADD COLUMN IF NOT EXISTS sacco_member text NOT NULL DEFAULT 'no';

-- Additional Information
ALTER TABLE vslas ADD COLUMN IF NOT EXISTS notes text;

-- System fields
ALTER TABLE vslas ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

-- Add foreign key constraints
ALTER TABLE vslas ADD CONSTRAINT vslas_cluster_id_fkey 
  FOREIGN KEY (cluster_id) REFERENCES clusters(id);

ALTER TABLE vslas ADD CONSTRAINT vslas_project_id_fkey 
  FOREIGN KEY (project_id) REFERENCES projects(id);

-- Add unique constraint on code
ALTER TABLE vslas ADD CONSTRAINT vslas_code_unique UNIQUE (code);

-- Update existing rows to have unique codes
UPDATE vslas SET code = 'VSLA-' || id::text WHERE code = '';
