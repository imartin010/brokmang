-- =====================================================
-- Brokmang. v1.1 Demo Seed Data (Auto User ID)
-- Creates sample organization with full data
-- =====================================================
-- Run this AFTER schema-v1_1.sql and rls-v1_1.sql
-- This version automatically uses the first user in the database
-- =====================================================

-- Main seed script
DO $$
DECLARE
  demo_user_id UUID;
  demo_org_id UUID := '00000000-0000-0000-0000-000000000001';
  agent_record RECORD;
  current_log_date DATE;
  days_back INT;
BEGIN
  -- =====================================================
  -- 1. GET FIRST USER
  -- =====================================================
  SELECT id INTO demo_user_id FROM auth.users LIMIT 1;
  
  IF demo_user_id IS NULL THEN
    RAISE EXCEPTION 'No users found. Please sign up first.';
  END IF;
  
  RAISE NOTICE 'Using user ID: %', demo_user_id;
  
  -- =====================================================
  -- 2. CREATE DEMO ORGANIZATION
  -- =====================================================
  INSERT INTO public.organizations (id, name, slug, owner_id, branding, settings)
  VALUES (
    demo_org_id,
    'Demo Brokerage Inc.',
    'demo-brokerage',
    demo_user_id,
    '{"primaryColor": "#257CFF", "secondaryColor": "#F45A2A"}',
    '{"twoFA": false, "currency": "EGP", "timezone": "Africa/Cairo"}'
  )
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, owner_id = EXCLUDED.owner_id;
  
  -- =====================================================
  -- 3. CREATE BRANCHES
  -- =====================================================
  INSERT INTO public.branches (id, org_id, name, address, is_active) VALUES
  ('00000000-0000-0000-0000-000000000101', demo_org_id, 'Downtown Office', '123 Main Street, Cairo, Egypt', true),
  ('00000000-0000-0000-0000-000000000102', demo_org_id, 'Uptown Office', '456 North Avenue, Cairo, Egypt', true)
  ON CONFLICT (id) DO NOTHING;
  
  -- =====================================================
  -- 4. CREATE TEAMS
  -- =====================================================
  INSERT INTO public.teams (id, org_id, branch_id, name, is_active) VALUES
  ('00000000-0000-0000-0000-000000000201', demo_org_id, '00000000-0000-0000-0000-000000000101', 'Alpha Team', true),
  ('00000000-0000-0000-0000-000000000202', demo_org_id, '00000000-0000-0000-0000-000000000101', 'Beta Team', true),
  ('00000000-0000-0000-0000-000000000203', demo_org_id, '00000000-0000-0000-0000-000000000102', 'Gamma Team', true)
  ON CONFLICT (id) DO NOTHING;
  
  -- =====================================================
  -- 5. CREATE TEAM LEADERS
  -- =====================================================
  INSERT INTO public.sales_agents (id, org_id, user_id, team_id, full_name, phone, role, is_active) VALUES
  ('00000000-0000-0000-0000-000000000301', demo_org_id, demo_user_id, '00000000-0000-0000-0000-000000000201', 'Ahmed Hassan (TL)', '+20 100 123 4567', 'team_leader', true),
  ('00000000-0000-0000-0000-000000000302', demo_org_id, demo_user_id, '00000000-0000-0000-0000-000000000202', 'Sarah Mohamed (TL)', '+20 100 234 5678', 'team_leader', true),
  ('00000000-0000-0000-0000-000000000303', demo_org_id, demo_user_id, '00000000-0000-0000-0000-000000000203', 'Omar Ali (TL)', '+20 100 345 6789', 'team_leader', true)
  ON CONFLICT (id) DO NOTHING;
  
  -- Assign team leaders to teams
  UPDATE public.teams SET team_leader_id = '00000000-0000-0000-0000-000000000301' WHERE id = '00000000-0000-0000-0000-000000000201';
  UPDATE public.teams SET team_leader_id = '00000000-0000-0000-0000-000000000302' WHERE id = '00000000-0000-0000-0000-000000000202';
  UPDATE public.teams SET team_leader_id = '00000000-0000-0000-0000-000000000303' WHERE id = '00000000-0000-0000-0000-000000000203';
  
  -- =====================================================
  -- 6. CREATE AGENTS
  -- =====================================================
  INSERT INTO public.sales_agents (id, org_id, user_id, team_id, full_name, phone, role, is_active) VALUES
  -- Alpha Team
  ('00000000-0000-0000-0000-000000000311', demo_org_id, demo_user_id, '00000000-0000-0000-0000-000000000201', 'Fatma Ibrahim', '+20 101 111 2222', 'agent', true),
  ('00000000-0000-0000-0000-000000000312', demo_org_id, demo_user_id, '00000000-0000-0000-0000-000000000201', 'Youssef Mahmoud', '+20 101 222 3333', 'agent', true),
  ('00000000-0000-0000-0000-000000000313', demo_org_id, demo_user_id, '00000000-0000-0000-0000-000000000201', 'Nour El-Din', '+20 101 333 4444', 'agent', true),
  ('00000000-0000-0000-0000-000000000314', demo_org_id, demo_user_id, '00000000-0000-0000-0000-000000000201', 'Mariam Khaled', '+20 101 444 5555', 'agent', true),
  ('00000000-0000-0000-0000-000000000315', demo_org_id, demo_user_id, '00000000-0000-0000-0000-000000000201', 'Karim Saeed', '+20 101 555 6666', 'agent', true),
  -- Beta Team
  ('00000000-0000-0000-0000-000000000321', demo_org_id, demo_user_id, '00000000-0000-0000-0000-000000000202', 'Layla Mostafa', '+20 102 111 2222', 'agent', true),
  ('00000000-0000-0000-0000-000000000322', demo_org_id, demo_user_id, '00000000-0000-0000-0000-000000000202', 'Hassan Farid', '+20 102 222 3333', 'agent', true),
  ('00000000-0000-0000-0000-000000000323', demo_org_id, demo_user_id, '00000000-0000-0000-0000-000000000202', 'Amira Youssef', '+20 102 333 4444', 'agent', true),
  ('00000000-0000-0000-0000-000000000324', demo_org_id, demo_user_id, '00000000-0000-0000-0000-000000000202', 'Tarek Nabil', '+20 102 444 5555', 'agent', true),
  ('00000000-0000-0000-0000-000000000325', demo_org_id, demo_user_id, '00000000-0000-0000-0000-000000000202', 'Dina Adel', '+20 102 555 6666', 'agent', true),
  -- Gamma Team
  ('00000000-0000-0000-0000-000000000331', demo_org_id, demo_user_id, '00000000-0000-0000-0000-000000000203', 'Rania Ahmed', '+20 103 111 2222', 'agent', true),
  ('00000000-0000-0000-0000-000000000332', demo_org_id, demo_user_id, '00000000-0000-0000-0000-000000000203', 'Mohamed Salah', '+20 103 222 3333', 'agent', true),
  ('00000000-0000-0000-0000-000000000333', demo_org_id, demo_user_id, '00000000-0000-0000-0000-000000000203', 'Heba Fathy', '+20 103 333 4444', 'agent', true),
  ('00000000-0000-0000-0000-000000000334', demo_org_id, demo_user_id, '00000000-0000-0000-0000-000000000203', 'Ali Sami', '+20 103 444 5555', 'agent', true),
  ('00000000-0000-0000-0000-000000000335', demo_org_id, demo_user_id, '00000000-0000-0000-0000-000000000203', 'Yasmin Hany', '+20 103 555 6666', 'agent', true)
  ON CONFLICT (id) DO NOTHING;
  
  -- =====================================================
  -- 7. CREATE/UPDATE KPI SETTINGS
  -- =====================================================
  -- Use upsert since there might be existing settings
  INSERT INTO public.agent_kpi_settings (org_id, user_id, workday_start, workday_end, target_calls_per_day, target_meetings_per_day, target_sales_per_month, weight_attendance, weight_calls, weight_behavior, weight_meetings, weight_sales)
  VALUES (demo_org_id, demo_user_id, '09:30', '18:30', 120, 2, 2000000, 25, 25, 20, 15, 15)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    org_id = EXCLUDED.org_id,
    workday_start = EXCLUDED.workday_start,
    workday_end = EXCLUDED.workday_end,
    target_calls_per_day = EXCLUDED.target_calls_per_day,
    target_meetings_per_day = EXCLUDED.target_meetings_per_day,
    target_sales_per_month = EXCLUDED.target_sales_per_month;
  
  -- =====================================================
  -- 8. UPDATE FINANCE SETTINGS
  -- =====================================================
  UPDATE public.org_finance_settings SET
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
  WHERE org_id = demo_org_id;
  
  -- =====================================================
  -- 9. CREATE DAILY LOGS (45 days)
  -- =====================================================
  FOR agent_record IN 
    SELECT id FROM public.sales_agents 
    WHERE org_id = demo_org_id AND role = 'agent'
  LOOP
    FOR days_back IN 0..44 LOOP
      current_log_date := CURRENT_DATE - days_back;
      
      -- Skip weekends (Friday=5, Saturday=6 for Egypt)
      IF EXTRACT(DOW FROM current_log_date) NOT IN (5, 6) THEN
        INSERT INTO public.agent_daily_logs (
          org_id, user_id, agent_id, log_date,
          check_in, check_out,
          calls_count, leads_count, meetings_count, sales_amount,
          appearance_score, ethics_score, notes
        ) VALUES (
          demo_org_id, demo_user_id, agent_record.id, current_log_date,
          ('09:' || LPAD((RANDOM() * 45)::INT::TEXT, 2, '0'))::TIME,
          ('18:' || LPAD((RANDOM() * 60)::INT::TEXT, 2, '0'))::TIME,
          80 + (RANDOM() * 70)::INT,
          5 + (RANDOM() * 15)::INT,
          (RANDOM() * 4)::INT,
          50000 + (RANDOM() * 450000)::INT,
          5 + (RANDOM() * 5)::INT,
          6 + (RANDOM() * 4)::INT,
          'Demo data'
        )
        ON CONFLICT (user_id, agent_id, log_date) DO NOTHING;
      END IF;
    END LOOP;
  END LOOP;
  
  -- =====================================================
  -- 10. CREATE NOTIFICATIONS
  -- =====================================================
  IF NOT EXISTS (SELECT 1 FROM public.notifications WHERE org_id = demo_org_id LIMIT 1) THEN
    INSERT INTO public.notifications (org_id, user_id, type, title, message, payload, is_read) VALUES
    (demo_org_id, demo_user_id, 'SYSTEM', 'Welcome to Brokmang.!', 'Your organization has been set up successfully.', '{}', false),
    (demo_org_id, demo_user_id, 'TAX_REMINDER', 'Monthly Tax Reminder', 'Don''t forget to file your monthly tax returns.', '{}', false),
    (demo_org_id, NULL, 'SYSTEM', 'Org-wide Announcement', 'This is visible to all members.', '{}', false);
  END IF;
  
  -- =====================================================
  -- 11. CREATE AUDIT LOGS
  -- =====================================================
  INSERT INTO public.system_logs (org_id, user_id, action, entity, entity_id, metadata) VALUES
  (demo_org_id, demo_user_id, 'ORG_CREATED', 'organizations', demo_org_id::TEXT, '{"source": "seed_script"}'),
  (demo_org_id, demo_user_id, 'BRANCH_CREATED', 'branches', '00000000-0000-0000-0000-000000000101', '{"name": "Downtown"}'),
  (demo_org_id, demo_user_id, 'BRANCH_CREATED', 'branches', '00000000-0000-0000-0000-000000000102', '{"name": "Uptown"}')
  ON CONFLICT DO NOTHING;
  
  -- =====================================================
  -- SUCCESS MESSAGE
  -- =====================================================
  RAISE NOTICE '✅ Demo data created successfully!';
  RAISE NOTICE '   Organization: Demo Brokerage Inc.';
  RAISE NOTICE '   Branches: 2';
  RAISE NOTICE '   Teams: 3';
  RAISE NOTICE '   Agents: 18 (3 team leaders + 15 agents)';
  RAISE NOTICE '   Daily Logs: ~600 (45 days, excluding weekends)';
  RAISE NOTICE '   Notifications: 3';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Ready to test! Visit: http://localhost:3000';
  
END $$;

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
SELECT 
  'Organizations' as entity, 
  COUNT(*)::TEXT as count 
FROM organizations 
WHERE id = '00000000-0000-0000-0000-000000000001'

UNION ALL
SELECT 'Branches', COUNT(*)::TEXT 
FROM branches 
WHERE org_id = '00000000-0000-0000-0000-000000000001'

UNION ALL
SELECT 'Teams', COUNT(*)::TEXT 
FROM teams 
WHERE org_id = '00000000-0000-0000-0000-000000000001'

UNION ALL
SELECT 'Agents', COUNT(*)::TEXT 
FROM sales_agents 
WHERE org_id = '00000000-0000-0000-0000-000000000001'

UNION ALL
SELECT 'Daily Logs', COUNT(*)::TEXT 
FROM agent_daily_logs 
WHERE org_id = '00000000-0000-0000-0000-000000000001'

UNION ALL
SELECT 'Notifications', COUNT(*)::TEXT 
FROM notifications 
WHERE org_id = '00000000-0000-0000-0000-000000000001';
