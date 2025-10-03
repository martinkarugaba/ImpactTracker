-- Ensure vocational skills columns are text[] with explicit casts

DO $$
BEGIN
  -- vocational_skills_participations -> text[]
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'participants'
      AND column_name = 'vocational_skills_participations'
      AND udt_name <> 'text[]'
  ) THEN
    EXECUTE $$
      ALTER TABLE public.participants
      ALTER COLUMN vocational_skills_participations
      TYPE text[] USING COALESCE(vocational_skills_participations::text[], ARRAY[]::text[]),
      ALTER COLUMN vocational_skills_participations SET DEFAULT '{}'
    $$;
  END IF;
END
$$;

DO $$
BEGIN
  -- vocational_skills_completions -> text[]
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'participants'
      AND column_name = 'vocational_skills_completions'
      AND udt_name <> 'text[]'
  ) THEN
    EXECUTE $$
      ALTER TABLE public.participants
      ALTER COLUMN vocational_skills_completions
      TYPE text[] USING COALESCE(vocational_skills_completions::text[], ARRAY[]::text[]),
      ALTER COLUMN vocational_skills_completions SET DEFAULT '{}'
    $$;
  END IF;
END
$$;

DO $$
BEGIN
  -- vocational_skills_certifications -> text[]
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'participants'
      AND column_name = 'vocational_skills_certifications'
      AND udt_name <> 'text[]'
  ) THEN
    EXECUTE $$
      ALTER TABLE public.participants
      ALTER COLUMN vocational_skills_certifications
      TYPE text[] USING COALESCE(vocational_skills_certifications::text[], ARRAY[]::text[]),
      ALTER COLUMN vocational_skills_certifications SET DEFAULT '{}'
    $$;
  END IF;
END
$$;


DO $$
BEGIN
  -- soft_skills_participations -> text[]
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'participants'
      AND column_name = 'soft_skills_participations'
      AND udt_name <> 'text[]'
  ) THEN
    EXECUTE $$
      ALTER TABLE public.participants
      ALTER COLUMN soft_skills_participations
      TYPE text[] USING COALESCE(soft_skills_participations::text[], ARRAY[]::text[]),
      ALTER COLUMN soft_skills_participations SET DEFAULT '{}'
    $$;
  END IF;
END
$$;

DO $$
BEGIN
  -- soft_skills_completions -> text[]
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'participants'
      AND column_name = 'soft_skills_completions'
      AND udt_name <> 'text[]'
  ) THEN
    EXECUTE $$
      ALTER TABLE public.participants
      ALTER COLUMN soft_skills_completions
      TYPE text[] USING COALESCE(soft_skills_completions::text[], ARRAY[]::text[]),
      ALTER COLUMN soft_skills_completions SET DEFAULT '{}'
    $$;
  END IF;
END
$$;

DO $$
BEGIN
  -- soft_skills_certifications -> text[]
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'participants'
      AND column_name = 'soft_skills_certifications'
      AND udt_name <> 'text[]'
  ) THEN
    EXECUTE $$
      ALTER TABLE public.participants
      ALTER COLUMN soft_skills_certifications
      TYPE text[] USING COALESCE(soft_skills_certifications::text[], ARRAY[]::text[]),
      ALTER COLUMN soft_skills_certifications SET DEFAULT '{}'
    $$;
  END IF;
END
$$;



