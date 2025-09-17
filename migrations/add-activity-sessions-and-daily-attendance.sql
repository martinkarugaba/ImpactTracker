-- Migration: Add Activity Sessions and Daily Attendance Support
-- This migration adds support for multi-day activities with daily attendance tracking

-- 1. Create activity_sessions table
CREATE TABLE IF NOT EXISTS activity_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  session_number INTEGER NOT NULL,
  start_time TIME,
  end_time TIME,
  venue TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, completed, cancelled, postponed
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_activity_session_date UNIQUE(activity_id, session_date),
  CONSTRAINT unique_activity_session_number UNIQUE(activity_id, session_number)
);

-- 2. Create daily_attendance table
CREATE TABLE IF NOT EXISTS daily_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES activity_sessions(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  attendance_status TEXT NOT NULL DEFAULT 'invited', -- invited, attended, absent, late, excused
  check_in_time TIMESTAMP,
  check_out_time TIMESTAMP,
  notes TEXT,
  recorded_by TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_session_participant UNIQUE(session_id, participant_id)
);

-- 3. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_activity_sessions_activity_id ON activity_sessions(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_sessions_date ON activity_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_daily_attendance_session_id ON daily_attendance(session_id);
CREATE INDEX IF NOT EXISTS idx_daily_attendance_participant_id ON daily_attendance(participant_id);
CREATE INDEX IF NOT EXISTS idx_daily_attendance_status ON daily_attendance(attendance_status);

-- 4. Add comments for documentation
COMMENT ON TABLE activity_sessions IS 'Individual sessions/days within a multi-day activity';
COMMENT ON TABLE daily_attendance IS 'Daily attendance records for participants in activity sessions';
COMMENT ON COLUMN activity_sessions.session_number IS 'Sequential number of the session within the activity (1, 2, 3, etc.)';
COMMENT ON COLUMN daily_attendance.attendance_status IS 'Status: invited, attended, absent, late, excused';