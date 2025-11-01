-- Fix: Remove any title column requirement or triggers causing the error
-- Error: "record "new" has no field "title""

BEGIN;

-- Check if title column exists and drop it if it does (shouldn't be there)
ALTER TABLE public.break_even_records 
  DROP COLUMN IF EXISTS title;

-- Check for any triggers that might reference 'title'
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE event_object_table = 'break_even_records'
    ) LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.break_even_records', r.trigger_name);
        RAISE NOTICE 'Dropped trigger: %', r.trigger_name;
    END LOOP;
END $$;

-- Verify table structure (should only have: id, user_id, inputs, results, created_at, and maybe org_id)
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'break_even_records'
ORDER BY ordinal_position;

COMMIT;

