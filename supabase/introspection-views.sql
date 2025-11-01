-- Optional SQL helper views for database introspection
-- Run this once via Supabase SQL Editor to create helper views

CREATE SCHEMA IF NOT EXISTS introspection;

CREATE OR REPLACE VIEW introspection.table_overview AS
SELECT n.nspname AS schema, c.relname AS table, c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind='r' AND n.nspname NOT IN ('pg_catalog','information_schema')
ORDER BY 1,2;

CREATE OR REPLACE VIEW introspection.policy_smells AS
SELECT p.*
FROM pg_policies p
WHERE (qual::text ILIKE '%' || tablename || '%')
   OR (with_check::text ILIKE '%' || tablename || '%')
   OR (qual::text ILIKE '%IN (SELECT %')
   OR (qual::text ILIKE '%EXISTS (SELECT%')
   OR (with_check::text ILIKE '%IN (SELECT %')
   OR (with_check::text ILIKE '%EXISTS (SELECT%');

COMMENT ON SCHEMA introspection IS 'Helper views for database introspection and policy smell detection';
COMMENT ON VIEW introspection.table_overview IS 'Quick overview of all tables and RLS status';
COMMENT ON VIEW introspection.policy_smells IS 'Policies with potential self-reference or subquery patterns';

