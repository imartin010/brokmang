-- =====================================================
-- Quick Database Audit
-- =====================================================

-- 1. Check all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. Check key column names
SELECT table_name, column_name, data_type 
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name IN ('sales_agents', 'agent_daily_logs', 'break_even_records', 'subscriptions')
  AND column_name IN ('full_name', 'name', 'org_id', 'user_id')
ORDER BY table_name, column_name;

-- 3. Check for org_id columns (potential conflicts)
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'org_id'
ORDER BY table_name;

