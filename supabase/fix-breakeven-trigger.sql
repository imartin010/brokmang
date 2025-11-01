-- Fix: Update notify_breakeven_saved trigger to not require 'title' column
-- Also fix create_notification function to use 'payload' instead of 'metadata'

-- First, fix the create_notification function to use 'payload' column
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
    payload,  -- Use 'payload' instead of 'metadata'
    is_read,
    created_at
  ) VALUES (
    p_org_id,
    p_user_id,
    p_type,
    p_title,
    p_message,
    p_action_url,
    p_metadata,  -- Still use p_metadata parameter, but insert into payload column
    false,
    NOW()
  ) RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Now fix the notify_breakeven_saved trigger
CREATE OR REPLACE FUNCTION notify_breakeven_saved() RETURNS TRIGGER AS $$
DECLARE
  v_user_email TEXT;
BEGIN
  -- Get user email
  SELECT email INTO v_user_email FROM auth.users WHERE id = NEW.user_id;
  
  -- Skip notification if no org_id (personal records don't need org notifications)
  -- Just return without error
  IF NEW.org_id IS NOT NULL THEN
    -- Only notify if org_id exists and user is in memberships
    PERFORM create_notification(
      NEW.org_id,
      m.user_id,
      'BREAK_EVEN_WARNING',  -- Use valid type from enum
      '📄 New Break-Even Analysis',
      COALESCE(v_user_email, 'A team member') || ' saved a new analysis',
      '/history',
      jsonb_build_object(
        'record_id', NEW.id,
        'saved_by', v_user_email
      )
    )
    FROM memberships m
    WHERE m.org_id = NEW.org_id
      AND m.role IN ('owner', 'admin', 'accountant')
      AND m.user_id != NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS trigger_notify_breakeven_saved ON break_even_records;
CREATE TRIGGER trigger_notify_breakeven_saved
  AFTER INSERT ON break_even_records
  FOR EACH ROW
  EXECUTE FUNCTION notify_breakeven_saved();

-- Verify trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'break_even_records';

