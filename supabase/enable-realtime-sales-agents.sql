-- =====================================================
-- Enable Realtime for sales_agents table
-- =====================================================
-- This allows real-time subscriptions to changes in the sales_agents table
-- Run this in your Supabase SQL Editor

-- Enable realtime for sales_agents table
ALTER PUBLICATION supabase_realtime ADD TABLE public.sales_agents;

-- Set replica identity to FULL to get both old and new values in realtime events
ALTER TABLE public.sales_agents REPLICA IDENTITY FULL;

-- =====================================================
-- Verification Query
-- =====================================================
-- Run this to verify realtime is enabled:
-- SELECT schemaname, tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

