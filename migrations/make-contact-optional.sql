-- Migration: Make contact field optional in participants table
-- Date: 2025-10-08
-- Description: Remove NOT NULL constraint from contact field to allow optional contact information

-- Remove NOT NULL constraint from contact field
ALTER TABLE participants ALTER COLUMN contact DROP NOT NULL;

-- Optional: Set empty contact fields to NULL for consistency
-- UPDATE participants SET contact = NULL WHERE contact = '';