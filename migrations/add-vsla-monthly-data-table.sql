-- Create VSLA Monthly Data table for tracking monthly aggregates
CREATE TABLE IF NOT EXISTS vsla_monthly_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vsla_id UUID NOT NULL REFERENCES vslas(id) ON DELETE CASCADE,
  
  -- Period Information
  month VARCHAR(20) NOT NULL, -- January, February, etc.
  year VARCHAR(4) NOT NULL, -- 2024, 2025, etc.
  
  -- Monthly Metrics
  total_loans INTEGER NOT NULL DEFAULT 0, -- Number of loans disbursed in the month
  total_savings INTEGER NOT NULL DEFAULT 0, -- Total savings amount for the month
  total_meetings INTEGER NOT NULL DEFAULT 0, -- Number of meetings held in the month
  
  -- Optional detailed information
  notes TEXT,
  
  -- System fields
  created_by TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure unique month/year per VSLA
  UNIQUE(vsla_id, month, year)
);

-- Add index for faster queries
CREATE INDEX idx_vsla_monthly_data_vsla_id ON vsla_monthly_data(vsla_id);
CREATE INDEX idx_vsla_monthly_data_period ON vsla_monthly_data(year, month);

-- Add comment
COMMENT ON TABLE vsla_monthly_data IS 'Stores monthly aggregated data for VSLAs including loans, savings, and meetings';
