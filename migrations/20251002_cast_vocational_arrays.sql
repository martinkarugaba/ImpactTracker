-- Migration to handle casting array columns from existing format to text[]
-- This addresses the error: column "vocational_skills_participations" cannot be cast automatically to type text[]

-- First, let's check what columns exist and handle them safely
DO $$ 
DECLARE
    column_exists boolean;
BEGIN
    -- Check and update vocational_skills_participations
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'participants' AND column_name = 'vocational_skills_participations'
    ) INTO column_exists;
    
    IF column_exists THEN
        -- First, update any empty strings to NULL to avoid casting issues
        UPDATE participants SET vocational_skills_participations = NULL 
        WHERE vocational_skills_participations::text = '' OR vocational_skills_participations::text = '{}';
        
        -- Now safely cast to text array
        ALTER TABLE participants 
        ALTER COLUMN vocational_skills_participations 
        SET DATA TYPE text[] 
        USING CASE 
            WHEN vocational_skills_participations IS NULL THEN '{}'::text[]
            ELSE ARRAY[vocational_skills_participations::text]
        END;
        
        ALTER TABLE participants ALTER COLUMN vocational_skills_participations SET DEFAULT '{}';
    END IF;

    -- Check and update vocational_skills_completions
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'participants' AND column_name = 'vocational_skills_completions'
    ) INTO column_exists;
    
    IF column_exists THEN
        UPDATE participants SET vocational_skills_completions = NULL 
        WHERE vocational_skills_completions::text = '' OR vocational_skills_completions::text = '{}';
        
        ALTER TABLE participants 
        ALTER COLUMN vocational_skills_completions 
        SET DATA TYPE text[] 
        USING CASE 
            WHEN vocational_skills_completions IS NULL THEN '{}'::text[]
            ELSE ARRAY[vocational_skills_completions::text]
        END;
        
        ALTER TABLE participants ALTER COLUMN vocational_skills_completions SET DEFAULT '{}';
    END IF;

    -- Check and update vocational_skills_certifications
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'participants' AND column_name = 'vocational_skills_certifications'
    ) INTO column_exists;
    
    IF column_exists THEN
        UPDATE participants SET vocational_skills_certifications = NULL 
        WHERE vocational_skills_certifications::text = '' OR vocational_skills_certifications::text = '{}';
        
        ALTER TABLE participants 
        ALTER COLUMN vocational_skills_certifications 
        SET DATA TYPE text[] 
        USING CASE 
            WHEN vocational_skills_certifications IS NULL THEN '{}'::text[]
            ELSE ARRAY[vocational_skills_certifications::text]
        END;
        
        ALTER TABLE participants ALTER COLUMN vocational_skills_certifications SET DEFAULT '{}';
    END IF;

    -- Check and update soft_skills_participations
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'participants' AND column_name = 'soft_skills_participations'
    ) INTO column_exists;
    
    IF column_exists THEN
        UPDATE participants SET soft_skills_participations = NULL 
        WHERE soft_skills_participations::text = '' OR soft_skills_participations::text = '{}';
        
        ALTER TABLE participants 
        ALTER COLUMN soft_skills_participations 
        SET DATA TYPE text[] 
        USING CASE 
            WHEN soft_skills_participations IS NULL THEN '{}'::text[]
            ELSE ARRAY[soft_skills_participations::text]
        END;
        
        ALTER TABLE participants ALTER COLUMN soft_skills_participations SET DEFAULT '{}';
    END IF;

    -- Check and update soft_skills_completions
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'participants' AND column_name = 'soft_skills_completions'
    ) INTO column_exists;
    
    IF column_exists THEN
        UPDATE participants SET soft_skills_completions = NULL 
        WHERE soft_skills_completions::text = '' OR soft_skills_completions::text = '{}';
        
        ALTER TABLE participants 
        ALTER COLUMN soft_skills_completions 
        SET DATA TYPE text[] 
        USING CASE 
            WHEN soft_skills_completions IS NULL THEN '{}'::text[]
            ELSE ARRAY[soft_skills_completions::text]
        END;
        
        ALTER TABLE participants ALTER COLUMN soft_skills_completions SET DEFAULT '{}';
    END IF;

    -- Check and update soft_skills_certifications
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'participants' AND column_name = 'soft_skills_certifications'
    ) INTO column_exists;
    
    IF column_exists THEN
        UPDATE participants SET soft_skills_certifications = NULL 
        WHERE soft_skills_certifications::text = '' OR soft_skills_certifications::text = '{}';
        
        ALTER TABLE participants 
        ALTER COLUMN soft_skills_certifications 
        SET DATA TYPE text[] 
        USING CASE 
            WHEN soft_skills_certifications IS NULL THEN '{}'::text[]
            ELSE ARRAY[soft_skills_certifications::text]
        END;
        
        ALTER TABLE participants ALTER COLUMN soft_skills_certifications SET DEFAULT '{}';
    END IF;
END $$;