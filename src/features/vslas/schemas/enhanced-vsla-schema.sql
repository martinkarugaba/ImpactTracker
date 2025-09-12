-- VSLA Enhanced Tracking Schema
-- This file contains additional tables for comprehensive VSLA management

-- Loans table for tracking individual loans
CREATE TABLE vsla_loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vsla_id UUID NOT NULL REFERENCES vslas(id),
  member_id UUID NOT NULL REFERENCES vsla_members(id),
  loan_amount INTEGER NOT NULL, -- Amount in cents/smallest currency unit
  interest_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00, -- Percentage
  loan_purpose TEXT,
  loan_date TIMESTAMP NOT NULL DEFAULT NOW(),
  due_date TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'active', -- active, fully_paid, overdue, defaulted
  total_paid INTEGER NOT NULL DEFAULT 0, -- Amount paid so far
  balance_remaining INTEGER NOT NULL, -- Calculated field
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Loan payments/installments tracking
CREATE TABLE vsla_loan_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES vsla_loans(id),
  payment_amount INTEGER NOT NULL, -- Amount in cents
  payment_date TIMESTAMP NOT NULL DEFAULT NOW(),
  payment_method TEXT DEFAULT 'cash', -- cash, mobile_money, bank_transfer
  notes TEXT,
  recorded_by UUID REFERENCES vsla_members(id), -- Who recorded this payment
  created_at TIMESTAMP DEFAULT NOW()
);

-- Savings contributions tracking
CREATE TABLE vsla_savings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vsla_id UUID NOT NULL REFERENCES vslas(id),
  member_id UUID NOT NULL REFERENCES vsla_members(id),
  amount INTEGER NOT NULL, -- Amount in cents
  savings_type TEXT NOT NULL DEFAULT 'regular', -- regular, voluntary, special
  contribution_date TIMESTAMP NOT NULL DEFAULT NOW(),
  notes TEXT,
  recorded_by UUID REFERENCES vsla_members(id), -- Who recorded this contribution
  created_at TIMESTAMP DEFAULT NOW()
);

-- VSLA meetings tracking
CREATE TABLE vsla_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vsla_id UUID NOT NULL REFERENCES vslas(id),
  meeting_date TIMESTAMP NOT NULL,
  meeting_type TEXT NOT NULL DEFAULT 'regular', -- regular, special, annual
  location TEXT,
  agenda TEXT,
  total_savings_collected INTEGER DEFAULT 0,
  total_loan_payments_collected INTEGER DEFAULT 0,
  new_loans_issued INTEGER DEFAULT 0,
  notes TEXT,
  conducted_by UUID REFERENCES vsla_members(id), -- Meeting facilitator
  status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, completed, cancelled
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Meeting attendance tracking
CREATE TABLE vsla_meeting_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES vsla_meetings(id),
  member_id UUID NOT NULL REFERENCES vsla_members(id),
  attendance_status TEXT NOT NULL DEFAULT 'present', -- present, absent, excused
  arrival_time TIMESTAMP,
  departure_time TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure unique attendance record per member per meeting
  UNIQUE(meeting_id, member_id)
);

-- Meeting financial transactions (what happened during the meeting)
CREATE TABLE vsla_meeting_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES vsla_meetings(id),
  member_id UUID NOT NULL REFERENCES vsla_members(id),
  transaction_type TEXT NOT NULL, -- savings_contribution, loan_payment, loan_disbursement
  amount INTEGER NOT NULL,
  reference_id UUID, -- Could reference vsla_savings, vsla_loan_payments, or vsla_loans
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_vsla_loans_member_id ON vsla_loans(member_id);
CREATE INDEX idx_vsla_loans_vsla_id ON vsla_loans(vsla_id);
CREATE INDEX idx_vsla_loans_status ON vsla_loans(status);

CREATE INDEX idx_vsla_loan_payments_loan_id ON vsla_loan_payments(loan_id);
CREATE INDEX idx_vsla_loan_payments_date ON vsla_loan_payments(payment_date);

CREATE INDEX idx_vsla_savings_member_id ON vsla_savings(member_id);
CREATE INDEX idx_vsla_savings_vsla_id ON vsla_savings(vsla_id);
CREATE INDEX idx_vsla_savings_date ON vsla_savings(contribution_date);

CREATE INDEX idx_vsla_meetings_vsla_id ON vsla_meetings(vsla_id);
CREATE INDEX idx_vsla_meetings_date ON vsla_meetings(meeting_date);

CREATE INDEX idx_vsla_meeting_attendance_meeting_id ON vsla_meeting_attendance(meeting_id);
CREATE INDEX idx_vsla_meeting_attendance_member_id ON vsla_meeting_attendance(member_id);

CREATE INDEX idx_vsla_meeting_transactions_meeting_id ON vsla_meeting_transactions(meeting_id);
CREATE INDEX idx_vsla_meeting_transactions_member_id ON vsla_meeting_transactions(member_id);