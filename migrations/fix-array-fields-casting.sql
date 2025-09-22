-- Fix array fields casting issues
-- This migration handles the conversion of array fields to proper text[] types

-- First, let's handle the participants table array fields
-- We need to convert the existing data to proper text[] format

-- Update vocational_skills_participations
ALTER TABLE "participants" 
ALTER COLUMN "vocational_skills_participations" 
TYPE text[] USING vocational_skills_participations::text[];

-- Update vocational_skills_completions
ALTER TABLE "participants" 
ALTER COLUMN "vocational_skills_completions" 
TYPE text[] USING vocational_skills_completions::text[];

-- Update vocational_skills_certifications
ALTER TABLE "participants" 
ALTER COLUMN "vocational_skills_certifications" 
TYPE text[] USING vocational_skills_certifications::text[];

-- Update soft_skills_participations
ALTER TABLE "participants" 
ALTER COLUMN "soft_skills_participations" 
TYPE text[] USING soft_skills_participations::text[];

-- Update soft_skills_completions
ALTER TABLE "participants" 
ALTER COLUMN "soft_skills_completions" 
TYPE text[] USING soft_skills_completions::text[];

-- Update soft_skills_certifications
ALTER TABLE "participants" 
ALTER COLUMN "soft_skills_certifications" 
TYPE text[] USING soft_skills_certifications::text[];

-- Set default values for all array fields
ALTER TABLE "participants" ALTER COLUMN "vocational_skills_participations" SET DEFAULT '{}';
ALTER TABLE "participants" ALTER COLUMN "vocational_skills_completions" SET DEFAULT '{}';
ALTER TABLE "participants" ALTER COLUMN "vocational_skills_certifications" SET DEFAULT '{}';
ALTER TABLE "participants" ALTER COLUMN "soft_skills_participations" SET DEFAULT '{}';
ALTER TABLE "participants" ALTER COLUMN "soft_skills_completions" SET DEFAULT '{}';
ALTER TABLE "participants" ALTER COLUMN "soft_skills_certifications" SET DEFAULT '{}';

-- Fix other array fields mentioned in the error
ALTER TABLE "organizations" ALTER COLUMN "operation_sub_counties" SET DEFAULT '{}';
ALTER TABLE "clusters" ALTER COLUMN "districts" SET DEFAULT '{}';
ALTER TABLE "activities" ALTER COLUMN "objectives" SET DEFAULT '{}';
ALTER TABLE "activities" ALTER COLUMN "attachments" SET DEFAULT '{}';
ALTER TABLE "concept_notes" ALTER COLUMN "budget_items" SET DEFAULT '{}';
ALTER TABLE "activity_reports" ALTER COLUMN "follow_up_actions" SET DEFAULT '{}';