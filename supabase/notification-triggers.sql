-- =====================================================
-- Notification Triggers for Brokmang
-- =====================================================
-- Automatically create notifications for key events:
--   1. New agent onboarded
--   2. Monthly scores calculated
--   3. Low performance alerts
--   4. New team member added
--   5. KPI settings changed
-- =====================================================

-- =====================================================
-- Helper Function: Create Notification
-- =====================================================

CREATE OR REPLACE FUNCTION create_notification(
  p_org_id UUID,
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_action_url TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    org_id,
    user_id,
    type,
    title,
    message,
    action_url,
    metadata,
    is_read,
    created_at
  ) VALUES (
    p_org_id,
    p_user_id,
    p_type,
    p_title,
    p_message,
    p_action_url,
    p_metadata,
    false,
    NOW()
  ) RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Trigger 1: New Agent Onboarded
-- =====================================================

CREATE OR REPLACE FUNCTION notify_agent_onboarded() RETURNS TRIGGER AS $$
DECLARE
  v_org_name TEXT;
  v_agent_name TEXT;
BEGIN
  -- Get organization name
  SELECT name INTO v_org_name FROM organizations WHERE id = NEW.org_id;
  
  -- Get agent name (use full_name column)
  v_agent_name := COALESCE(NEW.full_name, 'New Agent');
  
  -- Notify org owners and admins
  PERFORM create_notification(
    NEW.org_id,
    m.user_id,
    'agent_added',
    '🎉 New Agent Onboarded',
    v_agent_name || ' has been added to ' || COALESCE(v_org_name, 'your organization'),
    '/dashboard',
    jsonb_build_object(
      'agent_id', NEW.id,
      'agent_name', v_agent_name,
      'org_id', NEW.org_id
    )
  )
  FROM memberships m
  WHERE m.org_id = NEW.org_id
    AND m.role IN ('owner', 'admin')
    AND m.user_id != NEW.user_id; -- Don't notify the creator
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_agent_onboarded ON sales_agents;
CREATE TRIGGER trigger_notify_agent_onboarded
  AFTER INSERT ON sales_agents
  FOR EACH ROW
  WHEN (NEW.is_active = true)
  EXECUTE FUNCTION notify_agent_onboarded();

-- =====================================================
-- Trigger 2: Monthly Scores Calculated
-- =====================================================

CREATE OR REPLACE FUNCTION notify_monthly_scores() RETURNS TRIGGER AS $$
DECLARE
  v_agent_name TEXT;
  v_score NUMERIC;
  v_month_name TEXT;
BEGIN
  -- Get agent name
  SELECT name INTO v_agent_name FROM sales_agents WHERE id = NEW.agent_id;
  
  -- Get score
  v_score := ROUND(NEW.score::numeric, 1);
  
  -- Get month name
  v_month_name := TO_CHAR(DATE(NEW.year || '-' || NEW.month || '-01'), 'Month YYYY');
  
  -- Notify the agent
  PERFORM create_notification(
    NEW.org_id,
    NEW.user_id,
    'score_updated',
    '📊 Monthly Score Available',
    'Your performance score for ' || v_month_name || ' is ' || v_score || '%',
    '/dashboard',
    jsonb_build_object(
      'agent_id', NEW.agent_id,
      'score', v_score,
      'year', NEW.year,
      'month', NEW.month,
      'kpis', NEW.kpis
    )
  );
  
  -- If score is below 60%, also notify team leaders and admins
  IF v_score < 60 THEN
    PERFORM create_notification(
      NEW.org_id,
      m.user_id,
      'low_performance',
      '⚠️ Low Performance Alert',
      COALESCE(v_agent_name, 'An agent') || ' scored ' || v_score || '% in ' || v_month_name,
      '/dashboard',
      jsonb_build_object(
        'agent_id', NEW.agent_id,
        'agent_name', v_agent_name,
        'score', v_score,
        'year', NEW.year,
        'month', NEW.month
      )
    )
    FROM memberships m
    WHERE m.org_id = NEW.org_id
      AND m.role IN ('owner', 'admin', 'team_leader')
      AND m.user_id != NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_monthly_scores ON agent_monthly_scores;
CREATE TRIGGER trigger_notify_monthly_scores
  AFTER INSERT OR UPDATE ON agent_monthly_scores
  FOR EACH ROW
  WHEN (NEW.score IS NOT NULL)
  EXECUTE FUNCTION notify_monthly_scores();

-- =====================================================
-- Trigger 3: New Team Member Added
-- =====================================================

CREATE OR REPLACE FUNCTION notify_member_added() RETURNS TRIGGER AS $$
DECLARE
  v_org_name TEXT;
  v_user_email TEXT;
  v_role_display TEXT;
BEGIN
  -- Get organization name
  SELECT name INTO v_org_name FROM organizations WHERE id = NEW.org_id;
  
  -- Get user email
  SELECT email INTO v_user_email FROM auth.users WHERE id = NEW.user_id;
  
  -- Format role for display
  v_role_display := CASE NEW.role
    WHEN 'owner' THEN 'Owner'
    WHEN 'admin' THEN 'Admin'
    WHEN 'team_leader' THEN 'Team Leader'
    WHEN 'accountant' THEN 'Accountant'
    WHEN 'agent' THEN 'Agent'
    ELSE NEW.role
  END;
  
  -- Notify the new member (welcome message)
  PERFORM create_notification(
    NEW.org_id,
    NEW.user_id,
    'welcome',
    '👋 Welcome to ' || COALESCE(v_org_name, 'the team') || '!',
    'You have been added as ' || v_role_display || '. Explore your dashboard to get started.',
    '/dashboard',
    jsonb_build_object(
      'org_id', NEW.org_id,
      'role', NEW.role
    )
  );
  
  -- Notify org owners and admins (except the one who added them)
  PERFORM create_notification(
    NEW.org_id,
    m.user_id,
    'member_added',
    '👥 New Team Member',
    COALESCE(v_user_email, 'A new member') || ' joined as ' || v_role_display,
    '/org/settings?tab=members',
    jsonb_build_object(
      'new_user_id', NEW.user_id,
      'new_user_email', v_user_email,
      'role', NEW.role
    )
  )
  FROM memberships m
  WHERE m.org_id = NEW.org_id
    AND m.role IN ('owner', 'admin')
    AND m.user_id != NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_member_added ON memberships;
CREATE TRIGGER trigger_notify_member_added
  AFTER INSERT ON memberships
  FOR EACH ROW
  EXECUTE FUNCTION notify_member_added();

-- =====================================================
-- Trigger 4: KPI Settings Changed
-- =====================================================

CREATE OR REPLACE FUNCTION notify_kpi_settings_changed() RETURNS TRIGGER AS $$
DECLARE
  v_user_email TEXT;
  v_changes TEXT[];
BEGIN
  -- Only trigger on UPDATE (not INSERT)
  IF TG_OP != 'UPDATE' THEN
    RETURN NEW;
  END IF;
  
  -- Get user email
  SELECT email INTO v_user_email FROM auth.users WHERE id = NEW.user_id;
  
  -- Build list of changes
  v_changes := ARRAY[]::TEXT[];
  
  IF OLD.target_calls_per_day != NEW.target_calls_per_day THEN
    v_changes := array_append(v_changes, 'Target Calls: ' || NEW.target_calls_per_day);
  END IF;
  
  IF OLD.target_meetings_per_day != NEW.target_meetings_per_day THEN
    v_changes := array_append(v_changes, 'Target Meetings: ' || NEW.target_meetings_per_day);
  END IF;
  
  IF OLD.target_sales_per_month != NEW.target_sales_per_month THEN
    v_changes := array_append(v_changes, 'Target Sales: ' || NEW.target_sales_per_month);
  END IF;
  
  -- Only notify if there are actual changes
  IF array_length(v_changes, 1) > 0 THEN
    PERFORM create_notification(
      NULL, -- No org context for user-specific settings
      NEW.user_id,
      'settings_updated',
      '⚙️ KPI Settings Updated',
      'Your KPI targets have been updated: ' || array_to_string(v_changes, ', '),
      '/dashboard',
      jsonb_build_object(
        'changes', v_changes,
        'new_settings', row_to_json(NEW)
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_kpi_settings_changed ON agent_kpi_settings;
CREATE TRIGGER trigger_notify_kpi_settings_changed
  AFTER UPDATE ON agent_kpi_settings
  FOR EACH ROW
  EXECUTE FUNCTION notify_kpi_settings_changed();

-- =====================================================
-- Trigger 5: Break-Even Record Saved
-- =====================================================

CREATE OR REPLACE FUNCTION notify_breakeven_saved() RETURNS TRIGGER AS $$
DECLARE
  v_user_email TEXT;
  v_title TEXT;
BEGIN
  -- Get user email
  SELECT email INTO v_user_email FROM auth.users WHERE id = NEW.user_id;
  
  -- Get title or create default
  v_title := COALESCE(NEW.title, 'Untitled Scenario');
  
  -- Notify org members if this is org-scoped
  IF NEW.org_id IS NOT NULL THEN
    PERFORM create_notification(
      NEW.org_id,
      m.user_id,
      'report_generated',
      '📄 New Break-Even Analysis',
      COALESCE(v_user_email, 'A team member') || ' saved "' || v_title || '"',
      '/history',
      jsonb_build_object(
        'record_id', NEW.id,
        'title', v_title,
        'saved_by', v_user_email
      )
    )
    FROM memberships m
    WHERE m.org_id = NEW.org_id
      AND m.role IN ('owner', 'admin', 'accountant')
      AND m.user_id != NEW.user_id;
  ELSE
    -- Personal record, just notify the user
    PERFORM create_notification(
      NULL,
      NEW.user_id,
      'report_generated',
      '✅ Analysis Saved',
      'Your break-even analysis "' || v_title || '" has been saved',
      '/history',
      jsonb_build_object(
        'record_id', NEW.id,
        'title', v_title
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_breakeven_saved ON break_even_records;
CREATE TRIGGER trigger_notify_breakeven_saved
  AFTER INSERT ON break_even_records
  FOR EACH ROW
  EXECUTE FUNCTION notify_breakeven_saved();

-- =====================================================
-- Trigger 6: Team Created
-- =====================================================

CREATE OR REPLACE FUNCTION notify_team_created() RETURNS TRIGGER AS $$
DECLARE
  v_branch_name TEXT;
  v_leader_name TEXT;
BEGIN
  -- Get branch name
  SELECT name INTO v_branch_name FROM branches WHERE id = NEW.branch_id;
  
  -- Get team leader name if assigned
  IF NEW.leader_id IS NOT NULL THEN
    SELECT name INTO v_leader_name FROM sales_agents WHERE id = NEW.leader_id;
  END IF;
  
  -- Notify org admins and owners
  PERFORM create_notification(
    NEW.org_id,
    m.user_id,
    'team_created',
    '🎯 New Team Created',
    'Team "' || NEW.name || '" created in ' || COALESCE(v_branch_name, 'branch') ||
    CASE 
      WHEN v_leader_name IS NOT NULL THEN ' led by ' || v_leader_name
      ELSE ''
    END,
    '/org/settings',
    jsonb_build_object(
      'team_id', NEW.id,
      'team_name', NEW.name,
      'branch_id', NEW.branch_id,
      'leader_id', NEW.leader_id
    )
  )
  FROM memberships m
  WHERE m.org_id = NEW.org_id
    AND m.role IN ('owner', 'admin');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_team_created ON teams;
CREATE TRIGGER trigger_notify_team_created
  AFTER INSERT ON teams
  FOR EACH ROW
  EXECUTE FUNCTION notify_team_created();

-- =====================================================
-- Summary
-- =====================================================
-- 
-- Triggers now active for:
--   ✅ New agents onboarded
--   ✅ Monthly scores calculated
--   ✅ Low performance alerts (score < 60%)
--   ✅ New team members added
--   ✅ KPI settings changed
--   ✅ Break-even records saved
--   ✅ Teams created
--
-- All notifications automatically appear in NotificationCenter
-- =====================================================

