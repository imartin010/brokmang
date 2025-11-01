-- Check what tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check sales_agents structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'sales_agents'
ORDER BY ordinal_position;

-- Check if user_id and user_type columns exist
SELECT 
  EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales_agents' AND column_name = 'user_id') as has_user_id,
  EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales_agents' AND column_name = 'user_type') as has_user_type;

