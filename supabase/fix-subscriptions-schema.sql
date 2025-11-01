-- =====================================================
-- Fix Subscriptions Schema - Remove org_id
-- =====================================================

-- Remove org_id from subscriptions table
ALTER TABLE public.subscriptions
  DROP COLUMN IF EXISTS org_id CASCADE;

-- Remove org_id index
DROP INDEX IF EXISTS idx_subscriptions_org_id;

-- Update comments
COMMENT ON TABLE public.subscriptions IS 'AI feature subscriptions - no longer multi-tenant';

-- =====================================================
-- Update Subscription Views (if they exist)
-- =====================================================

-- Drop and recreate the pending subscriptions view without org references
DROP VIEW IF EXISTS pending_subscription_validations CASCADE;

CREATE OR REPLACE VIEW pending_subscription_validations AS
SELECT 
  s.id,
  s.user_id,
  s.user_type,
  s.amount_egp,
  s.payment_reference,
  s.payment_screenshot_url,
  s.payment_submitted_at,
  s.admin_notes,
  u.email as user_email,
  up.full_name as user_name
FROM subscriptions s
LEFT JOIN auth.users u ON u.id = s.user_id
LEFT JOIN user_profiles up ON up.user_id = s.user_id
WHERE s.status = 'pending_payment'
ORDER BY s.payment_submitted_at ASC;

COMMENT ON VIEW pending_subscription_validations IS 'Admin view of pending subscription payments';

-- =====================================================
-- Update RLS Policies for Subscriptions
-- =====================================================

-- Drop ALL existing policies first
DROP POLICY IF EXISTS "subscriptions_select_user" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_insert_user" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_update_admin" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_select_own" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_insert_service" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_update_ceo" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_select_ceo" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_update_admin_ceo" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_select_admin_ceo" ON public.subscriptions;

-- Users can view their own subscriptions
CREATE POLICY "subscriptions_select_own"
  ON public.subscriptions FOR SELECT
  USING (user_id = auth.uid());

-- Service role can insert subscriptions (via API)
CREATE POLICY "subscriptions_insert_service"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Only CEOs can update subscriptions (for validation)
CREATE POLICY "subscriptions_update_ceo"
  ON public.subscriptions FOR UPDATE
  USING (
    auth.role() = 'service_role' 
    OR
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid()
      AND user_type = 'ceo'
    )
  );

-- CEOs can view all subscriptions
CREATE POLICY "subscriptions_select_ceo"
  ON public.subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid()
      AND user_type = 'ceo'
    )
  );

-- =====================================================
-- Update RLS Policies for Subscription Payments
-- =====================================================

-- Drop old policies
DROP POLICY IF EXISTS "payments_select_user" ON public.subscription_payments;
DROP POLICY IF EXISTS "payments_insert_service" ON public.subscription_payments;

-- Users can view their own payment history
CREATE POLICY "payments_select_own"
  ON public.subscription_payments FOR SELECT
  USING (user_id = auth.uid());

-- Service role can insert payments
CREATE POLICY "payments_insert_service"
  ON public.subscription_payments FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- CEOs can view all payments
CREATE POLICY "payments_select_ceo"
  ON public.subscription_payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid()
      AND user_type = 'ceo'
    )
  );

-- =====================================================
-- VERIFICATION
-- =====================================================
-- SELECT * FROM pending_subscription_validations;

