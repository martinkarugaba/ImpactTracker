-- Convert skills fields from text to text[] 
-- Since the table is empty, we can do a simple type conversion

ALTER TABLE participants 
ALTER COLUMN vocational_skills_participations TYPE text[] USING '{}'::text[];

ALTER TABLE participants 
ALTER COLUMN vocational_skills_completions TYPE text[] USING '{}'::text[];

ALTER TABLE participants 
ALTER COLUMN vocational_skills_certifications TYPE text[] USING '{}'::text[];

ALTER TABLE participants 
ALTER COLUMN soft_skills_participations TYPE text[] USING '{}'::text[];

ALTER TABLE participants 
ALTER COLUMN soft_skills_completions TYPE text[] USING '{}'::text[];

ALTER TABLE participants 
ALTER COLUMN soft_skills_certifications TYPE text[] USING '{}'::text[];

-- Set default values for the array columns
ALTER TABLE participants 
ALTER COLUMN vocational_skills_participations SET DEFAULT '{}',
ALTER COLUMN vocational_skills_completions SET DEFAULT '{}',
ALTER COLUMN vocational_skills_certifications SET DEFAULT '{}',
ALTER COLUMN soft_skills_participations SET DEFAULT '{}',
ALTER COLUMN soft_skills_completions SET DEFAULT '{}',
ALTER COLUMN soft_skills_certifications SET DEFAULT '{}';