-- Fix break_even_records table - Remove org_id references
-- This error occurs because triggers or constraints expect org_id which we removed

-- Drop any triggers that might reference org_id
DO $$ 
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN 
        SELECT tgname 
        FROM pg_trigger 
        WHERE tgrelid = 'public.break_even_records'::regclass
        AND tgname NOT LIKE 'RI_%'  -- Don't drop foreign key triggers
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.break_even_records CASCADE', trigger_record.tgname);
        RAISE NOTICE 'Dropped trigger: %', trigger_record.tgname;
    END LOOP;
END $$;

-- Make sure org_id column is removed if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'break_even_records' 
        AND column_name = 'org_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.break_even_records DROP COLUMN org_id;
        RAISE NOTICE 'Dropped org_id column from break_even_records';
    ELSE
        RAISE NOTICE 'org_id column does not exist in break_even_records';
    END IF;
END $$;

-- Recreate the table structure without org_id if needed
DO $$
BEGIN
    -- Ensure the table has the correct structure
    -- Only user_id should be present, not org_id
    
    -- Add user_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'break_even_records' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.break_even_records 
        ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added user_id column';
    END IF;
    
    -- Ensure other required columns exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'break_even_records' 
        AND column_name = 'inputs'
    ) THEN
        ALTER TABLE public.break_even_records 
        ADD COLUMN inputs JSONB NOT NULL;
        RAISE NOTICE 'Added inputs column';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'break_even_records' 
        AND column_name = 'results'
    ) THEN
        ALTER TABLE public.break_even_records 
        ADD COLUMN results JSONB NOT NULL;
        RAISE NOTICE 'Added results column';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'break_even_records' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.break_even_records 
        ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE 'Added created_at column';
    END IF;
END $$;

-- Show final table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'break_even_records' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show any remaining triggers
SELECT 
    tgname as trigger_name,
    pg_get_triggerdef(oid) as trigger_definition
FROM pg_trigger 
WHERE tgrelid = 'public.break_even_records'::regclass
AND tgname NOT LIKE 'RI_%';

