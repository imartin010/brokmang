-- =====================================================
-- Subscription System for AI Features
-- =====================================================
-- Paid AI Features:
--   - Team Leader: 50 EGP/month
--   - CEO: 100 EGP/month
-- Payment: InstaPay (manual validation by admin)
-- =====================================================

-- Subscription status enum
DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM (
    'pending_payment',    -- User submitted, awaiting admin validation
    'active',             -- Admin approved, AI features enabled
    'expired',            -- 31 days passed, AI features disabled
    'cancelled'           -- User cancelled
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- Subscriptions Table
-- =====================================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_type user_account_type NOT NULL, -- 'ceo' or 'team_leader'
  
  -- Subscription details
  status subscription_status NOT NULL DEFAULT 'pending_payment',
  amount_egp INTEGER NOT NULL, -- 50 or 100
  
  -- Payment proof
  payment_method TEXT DEFAULT 'instapay',
  payment_reference TEXT, -- User's reference/transaction ID
  payment_screenshot_url TEXT, -- Optional: user uploads screenshot
  payment_submitted_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Admin validation
  validated_by UUID REFERENCES auth.users(id),
  validated_at TIMESTAMPTZ,
  admin_notes TEXT,
  
  -- Subscription period (31 days)
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  
  -- Notifications sent
  payment_submitted_notif_sent BOOLEAN DEFAULT false,
  activation_notif_sent BOOLEAN DEFAULT false,
  renewal_reminder_sent BOOLEAN DEFAULT false, -- 5 days before expiry
  expiry_notif_sent BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_org_id ON subscriptions(org_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date ON subscriptions(end_date);

-- Comments
COMMENT ON TABLE subscriptions IS 'AI feature subscriptions with InstaPay payment';
COMMENT ON COLUMN subscriptions.amount_egp IS '50 EGP for team_leader, 100 EGP for ceo';
COMMENT ON COLUMN subscriptions.status IS 'pending_payment -> active -> expired';

-- =====================================================
-- Payment History Table (for auditing)
-- =====================================================

CREATE TABLE IF NOT EXISTS subscription_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Payment details
  amount_egp INTEGER NOT NULL,
  payment_method TEXT DEFAULT 'instapay',
  payment_reference TEXT,
  payment_screenshot_url TEXT,
  
  -- Status tracking
  status TEXT NOT NULL, -- 'submitted', 'validated', 'rejected'
  validated_by UUID REFERENCES auth.users(id),
  validated_at TIMESTAMPTZ,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_subscription ON subscription_payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON subscription_payments(user_id);

-- =====================================================
-- Helper Functions
-- =====================================================

-- Check if user has active AI subscription
CREATE OR REPLACE FUNCTION has_active_ai_subscription(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_has_active BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM subscriptions
    WHERE user_id = p_user_id
      AND status = 'active'
      AND end_date > NOW()
  ) INTO v_has_active;
  
  RETURN v_has_active;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get active subscription for user
CREATE OR REPLACE FUNCTION get_active_subscription(p_user_id UUID)
RETURNS subscriptions AS $$
DECLARE
  v_subscription subscriptions;
BEGIN
  SELECT * INTO v_subscription
  FROM subscriptions
  WHERE user_id = p_user_id
    AND status = 'active'
    AND end_date > NOW()
  ORDER BY end_date DESC
  LIMIT 1;
  
  RETURN v_subscription;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get subscription price based on user type
CREATE OR REPLACE FUNCTION get_subscription_price(p_user_type user_account_type)
RETURNS INTEGER AS $$
BEGIN
  CASE p_user_type
    WHEN 'ceo' THEN RETURN 100;
    WHEN 'team_leader' THEN RETURN 50;
    ELSE RETURN 0;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- RLS Policies
-- =====================================================

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_payments ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscriptions
DROP POLICY IF EXISTS "subscriptions_select_own" ON subscriptions;
CREATE POLICY "subscriptions_select_own"
ON subscriptions FOR SELECT
USING (auth.uid() = user_id);

-- Users can create subscription requests
DROP POLICY IF EXISTS "subscriptions_insert_own" ON subscriptions;
CREATE POLICY "subscriptions_insert_own"
ON subscriptions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Only admins can update subscriptions (validation)
DROP POLICY IF EXISTS "subscriptions_update_admin" ON subscriptions;
CREATE POLICY "subscriptions_update_admin"
ON subscriptions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM memberships
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'admin')
  )
);

-- Users can view their payment history
DROP POLICY IF EXISTS "payments_select_own" ON subscription_payments;
CREATE POLICY "payments_select_own"
ON subscription_payments FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert payment records
DROP POLICY IF EXISTS "payments_insert_own" ON subscription_payments;
CREATE POLICY "payments_insert_own"
ON subscription_payments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- Trigger: Auto-update updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_subscription_updated_at ON subscriptions;
CREATE TRIGGER trigger_update_subscription_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_updated_at();

-- =====================================================
-- Sample Data for Testing (Optional)
-- =====================================================

-- Uncomment to insert sample subscription
/*
INSERT INTO subscriptions (
  user_id,
  org_id,
  user_type,
  amount_egp,
  status,
  start_date,
  end_date
) VALUES (
  auth.uid(), -- Replace with actual user ID
  'your-org-id',
  'ceo',
  100,
  'active',
  NOW(),
  NOW() + INTERVAL '31 days'
);
*/

-- =====================================================
-- Admin Views (Helpful for admin panel)
-- =====================================================

-- View: Pending payment validations
CREATE OR REPLACE VIEW pending_subscription_validations AS
SELECT 
  s.id,
  s.user_id,
  u.email as user_email,
  s.org_id,
  o.name as org_name,
  s.user_type,
  s.amount_egp,
  s.payment_reference,
  s.payment_screenshot_url,
  s.payment_submitted_at,
  s.created_at
FROM subscriptions s
LEFT JOIN auth.users u ON s.user_id = u.id
LEFT JOIN organizations o ON s.org_id = o.id
WHERE s.status = 'pending_payment'
ORDER BY s.payment_submitted_at DESC;

-- View: Active subscriptions
CREATE OR REPLACE VIEW active_subscriptions AS
SELECT 
  s.id,
  s.user_id,
  u.email as user_email,
  s.org_id,
  o.name as org_name,
  s.user_type,
  s.amount_egp,
  s.start_date,
  s.end_date,
  EXTRACT(DAY FROM (s.end_date - NOW())) as days_remaining
FROM subscriptions s
LEFT JOIN auth.users u ON s.user_id = u.id
LEFT JOIN organizations o ON s.org_id = o.id
WHERE s.status = 'active'
  AND s.end_date > NOW()
ORDER BY s.end_date ASC;

-- View: Expiring soon (within 5 days)
CREATE OR REPLACE VIEW expiring_soon_subscriptions AS
SELECT 
  s.id,
  s.user_id,
  u.email as user_email,
  s.org_id,
  s.user_type,
  s.end_date,
  EXTRACT(DAY FROM (s.end_date - NOW())) as days_remaining,
  s.renewal_reminder_sent
FROM subscriptions s
LEFT JOIN auth.users u ON s.user_id = u.id
WHERE s.status = 'active'
  AND s.end_date > NOW()
  AND s.end_date <= NOW() + INTERVAL '5 days'
  AND s.renewal_reminder_sent = false
ORDER BY s.end_date ASC;

-- =====================================================
-- Summary
-- =====================================================
-- 
-- Tables Created:
--   ✅ subscriptions - Main subscription tracking
--   ✅ subscription_payments - Payment history/audit
--
-- Functions Created:
--   ✅ has_active_ai_subscription() - Check if user can access AI
--   ✅ get_active_subscription() - Get user's subscription
--   ✅ get_subscription_price() - Get price by user type
--
-- Views Created:
--   ✅ pending_subscription_validations - Admin review queue
--   ✅ active_subscriptions - Current paid users
--   ✅ expiring_soon_subscriptions - Renewal reminders needed
--
-- RLS Policies:
--   ✅ Users can view/create their own subscriptions
--   ✅ Only admins can validate payments
--
-- Ready for:
--   1. Payment submission by users
--   2. Admin validation workflow
--   3. Automatic expiry handling
--   4. Renewal reminder notifications
--
-- =====================================================

