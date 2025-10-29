-- =====================================================
-- Brokmang. v1.1 Demo Seed Data
-- Creates sample organization with full data
-- =====================================================
-- Run this AFTER schema-v1_1.sql and rls-v1_1.sql
-- =====================================================

-- NOTE: Replace 'YOUR_USER_ID_HERE' with your actual user ID
-- Get it from: SELECT id FROM auth.users WHERE email = 'your@email.com';

-- =====================================================
-- 1. CREATE DEMO ORGANIZATION
-- =====================================================

-- Insert demo organization
INSERT INTO public.organizations (id, name, slug, owner_id, branding, settings)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Demo Brokerage Inc.',
  'demo-brokerage',
  'YOUR_USER_ID_HERE', -- Replace with your user ID
  '{"primaryColor": "#257CFF", "secondaryColor": "#F45A2A"}',
  '{"twoFA": false, "currency": "EGP", "timezone": "Africa/Cairo"}'
)
ON CONFLICT (slug) DO NOTHING;

-- Membership is auto-created by trigger for owner

-- =====================================================
-- 2. CREATE BRANCHES
-- =====================================================

INSERT INTO public.branches (id, org_id, name, address, is_active) VALUES
('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'Downtown Office', '123 Main Street, Cairo, Egypt', true),
('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', 'Uptown Office', '456 North Avenue, Cairo, Egypt', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 3. CREATE TEAMS
-- =====================================================

INSERT INTO public.teams (id, org_id, branch_id, name, is_active) VALUES
('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000101', 'Alpha Team', true),
('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000101', 'Beta Team', true),
('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000102', 'Gamma Team', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 4. CREATE SALES AGENTS (20 total: 5 Team Leaders + 15 Agents)
-- =====================================================

-- Team Leaders
INSERT INTO public.sales_agents (id, org_id, user_id, team_id, full_name, phone, role, is_active) VALUES
('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000001', 'YOUR_USER_ID_HERE', '00000000-0000-0000-0000-000000000201', 'Ahmed Hassan (TL)', '+20 100 123 4567', 'TEAM_LEADER', true),
('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000001', 'YOUR_USER_ID_HERE', '00000000-0000-0000-0000-000000000202', 'Sarah Mohamed (TL)', '+20 100 234 5678', 'TEAM_LEADER', true),
('00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000001', 'YOUR_USER_ID_HERE', '00000000-0000-0000-0000-000000000203', 'Omar Ali (TL)', '+20 100 345 6789', 'TEAM_LEADER', true)
ON CONFLICT (id) DO NOTHING;

-- Update teams with team leaders
UPDATE public.teams SET team_leader_id = '00000000-0000-0000-0000-000000000301' WHERE id = '00000000-0000-0000-0000-000000000201';
UPDATE public.teams SET team_leader_id = '00000000-0000-0000-0000-000000000302' WHERE id = '00000000-0000-0000-0000-000000000202';
UPDATE public.teams SET team_leader_id = '00000000-0000-0000-0000-000000000303' WHERE id = '00000000-0000-0000-0000-000000000203';

-- Agents for Alpha Team
INSERT INTO public.sales_agents (id, org_id, user_id, team_id, full_name, phone, role, is_active) VALUES
('00000000-0000-0000-0000-000000000311', '00000000-0000-0000-0000-000000000001', 'YOUR_USER_ID_HERE', '00000000-0000-0000-0000-000000000201', 'Fatma Ibrahim', '+20 101 111 2222', 'AGENT', true),
('00000000-0000-0000-0000-000000000312', '00000000-0000-0000-0000-000000000001', 'YOUR_USER_ID_HERE', '00000000-0000-0000-0000-000000000201', 'Youssef Mahmoud', '+20 101 222 3333', 'AGENT', true),
('00000000-0000-0000-0000-000000000313', '00000000-0000-0000-0000-000000000001', 'YOUR_USER_ID_HERE', '00000000-0000-0000-0000-000000000201', 'Nour El-Din', '+20 101 333 4444', 'AGENT', true),
('00000000-0000-0000-0000-000000000314', '00000000-0000-0000-0000-000000000001', 'YOUR_USER_ID_HERE', '00000000-0000-0000-0000-000000000201', 'Mariam Khaled', '+20 101 444 5555', 'AGENT', true),
('00000000-0000-0000-0000-000000000315', '00000000-0000-0000-0000-000000000001', 'YOUR_USER_ID_HERE', '00000000-0000-0000-0000-000000000201', 'Karim Saeed', '+20 101 555 6666', 'AGENT', true)
ON CONFLICT (id) DO NOTHING;

-- Agents for Beta Team
INSERT INTO public.sales_agents (id, org_id, user_id, team_id, full_name, phone, role, is_active) VALUES
('00000000-0000-0000-0000-000000000321', '00000000-0000-0000-0000-000000000001', 'YOUR_USER_ID_HERE', '00000000-0000-0000-0000-000000000202', 'Layla Mostafa', '+20 102 111 2222', 'AGENT', true),
('00000000-0000-0000-0000-000000000322', '00000000-0000-0000-0000-000000000001', 'YOUR_USER_ID_HERE', '00000000-0000-0000-0000-000000000202', 'Hassan Farid', '+20 102 222 3333', 'AGENT', true),
('00000000-0000-0000-0000-000000000323', '00000000-0000-0000-0000-000000000001', 'YOUR_USER_ID_HERE', '00000000-0000-0000-0000-000000000202', 'Amira Youssef', '+20 102 333 4444', 'AGENT', true),
('00000000-0000-0000-0000-000000000324', '00000000-0000-0000-0000-000000000001', 'YOUR_USER_ID_HERE', '00000000-0000-0000-0000-000000000202', 'Tarek Nabil', '+20 102 444 5555', 'AGENT', true),
('00000000-0000-0000-0000-000000000325', '00000000-0000-0000-0000-000000000001', 'YOUR_USER_ID_HERE', '00000000-0000-0000-0000-000000000202', 'Dina Adel', '+20 102 555 6666', 'AGENT', true)
ON CONFLICT (id) DO NOTHING;

-- Agents for Gamma Team
INSERT INTO public.sales_agents (id, org_id, user_id, team_id, full_name, phone, role, is_active) VALUES
('00000000-0000-0000-0000-000000000331', '00000000-0000-0000-0000-000000000001', 'YOUR_USER_ID_HERE', '00000000-0000-0000-0000-000000000203', 'Rania Ahmed', '+20 103 111 2222', 'AGENT', true),
('00000000-0000-0000-0000-000000000332', '00000000-0000-0000-0000-000000000001', 'YOUR_USER_ID_HERE', '00000000-0000-0000-0000-000000000203', 'Mohamed Salah', '+20 103 222 3333', 'AGENT', true),
('00000000-0000-0000-0000-000000000333', '00000000-0000-0000-0000-000000000001', 'YOUR_USER_ID_HERE', '00000000-0000-0000-0000-000000000203', 'Heba Fathy', '+20 103 333 4444', 'AGENT', true),
('00000000-0000-0000-0000-000000000334', '00000000-0000-0000-0000-000000000001', 'YOUR_USER_ID_HERE', '00000000-0000-0000-0000-000000000203', 'Ali Sami', '+20 103 444 5555', 'AGENT', true),
('00000000-0000-0000-0000-000000000335', '00000000-0000-0000-0000-000000000001', 'YOUR_USER_ID_HERE', '00000000-0000-0000-0000-000000000203', 'Yasmin Hany', '+20 103 555 6666', 'AGENT', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 5. CREATE KPI SETTINGS
-- =====================================================

INSERT INTO public.agent_kpi_settings (org_id, user_id, workday_start, workday_end, target_calls_per_day, target_meetings_per_day, target_sales_per_month, weight_attendance, weight_calls, weight_behavior, weight_meetings, weight_sales)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'YOUR_USER_ID_HERE',
  '09:30',
  '18:30',
  120,
  2,
  2000000,
  25,
  25,
  20,
  15,
  15
)
ON CONFLICT (user_id, org_id) DO NOTHING;

-- =====================================================
-- 6. UPDATE FINANCE SETTINGS (auto-created by trigger)
-- =====================================================

UPDATE public.org_finance_settings
SET
  rent_per_seat = 4500,
  salary_per_seat = 8000,
  marketing_per_seat = 13000,
  tl_share_per_seat = 3000,
  others_per_seat = 1200,
  sim_per_seat = 750,
  owner_salary = 200000,
  gross_rate = 0.04,
  agent_comm_per_1m = 5000,
  tl_comm_per_1m = 2500
WHERE org_id = '00000000-0000-0000-0000-000000000001';

-- =====================================================
-- 7. CREATE 45 DAYS OF DAILY LOGS
-- =====================================================

-- Function to generate random logs for agents
DO $$
DECLARE
  agent_record RECORD;
  log_date DATE;
  days_back INT;
BEGIN
  -- For each agent
  FOR agent_record IN 
    SELECT id FROM public.sales_agents 
    WHERE org_id = '00000000-0000-0000-0000-000000000001'
      AND role = 'AGENT'
  LOOP
    -- Generate logs for last 45 days
    FOR days_back IN 0..44 LOOP
      log_date := CURRENT_DATE - days_back;
      
      -- Skip weekends (Friday and Saturday for Egypt)
      IF EXTRACT(DOW FROM log_date) NOT IN (5, 6) THEN
        INSERT INTO public.agent_daily_logs (
          org_id,
          user_id,
          agent_id,
          log_date,
          check_in,
          check_out,
          calls_count,
          leads_count,
          meetings_count,
          sales_amount,
          appearance_score,
          ethics_score,
          notes
        ) VALUES (
          '00000000-0000-0000-0000-000000000001',
          'YOUR_USER_ID_HERE',
          agent_record.id,
          log_date,
          -- Random check-in between 09:00 and 09:45
          ('09:' || LPAD((RANDOM() * 45)::INT::TEXT, 2, '0'))::TIME,
          -- Random check-out between 18:00 and 19:00
          ('18:' || LPAD((RANDOM() * 60)::INT::TEXT, 2, '0'))::TIME,
          -- Random calls between 80 and 150
          80 + (RANDOM() * 70)::INT,
          -- Random leads between 5 and 20
          5 + (RANDOM() * 15)::INT,
          -- Random meetings between 0 and 4
          (RANDOM() * 4)::INT,
          -- Random sales between 50,000 and 500,000
          50000 + (RANDOM() * 450000)::INT,
          -- Random appearance score 5-10
          5 + (RANDOM() * 5)::INT,
          -- Random ethics score 6-10
          6 + (RANDOM() * 4)::INT,
          'Auto-generated demo data'
        )
        ON CONFLICT (user_id, agent_id, log_date) DO NOTHING;
      END IF;
    END LOOP;
  END LOOP;
END $$;

-- =====================================================
-- 8. CREATE SAMPLE NOTIFICATIONS
-- =====================================================

INSERT INTO public.notifications (org_id, user_id, type, title, message, payload, is_read) VALUES
('00000000-0000-0000-0000-000000000001', 'YOUR_USER_ID_HERE', 'SYSTEM', 'Welcome to Brokmang.!', 'Your organization has been set up successfully. Start by adding daily logs for your agents.', '{}', false),
('00000000-0000-0000-0000-000000000001', 'YOUR_USER_ID_HERE', 'TAX_REMINDER', 'Monthly Tax Reminder', 'Don''t forget to file your monthly tax returns. Deadline: End of month.', '{}', false),
('00000000-0000-0000-0000-000000000001', NULL, 'SYSTEM', 'Org-wide Announcement', 'This is an organization-wide notification visible to all members.', '{}', false)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 9. CREATE SAMPLE AUDIT LOGS
-- =====================================================

INSERT INTO public.system_logs (org_id, user_id, action, entity, entity_id, metadata) VALUES
('00000000-0000-0000-0000-000000000001', 'YOUR_USER_ID_HERE', 'ORG_CREATED', 'organizations', '00000000-0000-0000-0000-000000000001', '{"source": "seed_script", "agents_count": 18}'),
('00000000-0000-0000-0000-000000000001', 'YOUR_USER_ID_HERE', 'BRANCH_CREATED', 'branches', '00000000-0000-0000-0000-000000000101', '{"name": "Downtown Office"}'),
('00000000-0000-0000-0000-000000000001', 'YOUR_USER_ID_HERE', 'BRANCH_CREATED', 'branches', '00000000-0000-0000-0000-000000000102', '{"name": "Uptown Office"}');

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify the seed data:

-- SELECT * FROM organizations WHERE slug = 'demo-brokerage';
-- SELECT COUNT(*) FROM branches WHERE org_id = '00000000-0000-0000-0000-000000000001';
-- SELECT COUNT(*) FROM teams WHERE org_id = '00000000-0000-0000-0000-000000000001';
-- SELECT COUNT(*) FROM sales_agents WHERE org_id = '00000000-0000-0000-0000-000000000001';
-- SELECT COUNT(*) FROM agent_daily_logs WHERE org_id = '00000000-0000-0000-0000-000000000001';
-- SELECT * FROM notifications WHERE org_id = '00000000-0000-0000-0000-000000000001';

-- =====================================================
-- CLEANUP (if needed)
-- =====================================================
-- To remove all demo data:
-- DELETE FROM organizations WHERE id = '00000000-0000-0000-0000-000000000001';
-- This will cascade delete all related data (branches, teams, agents, logs, notifications)

