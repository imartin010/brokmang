-- =====================================================
-- Complete Subscription System Setup (No Organizations)
-- Run this single file to set everything up
-- =====================================================

-- =====================================================
-- Step 1: Remove org_id from subscriptions
-- =====================================================

ALTER TABLE public.subscriptions
  DROP COLUMN IF EXISTS org_id CASCADE;

DROP INDEX IF EXISTS idx_subscriptions_org_id;

COMMENT ON TABLE public.subscriptions IS 'AI feature subscriptions - no longer multi-tenant';

-- =====================================================
-- Step 2: Add Admin Role Support
-- =====================================================

-- Update user_type constraint to include 'admin'
ALTER TABLE public.user_profiles 
  DROP CONSTRAINT IF EXISTS user_profiles_user_type_check;

ALTER TABLE public.user_profiles
  ADD CONSTRAINT user_profiles_user_type_check 
  CHECK (user_type IN ('ceo', 'team_leader', 'admin'));

COMMENT ON COLUMN public.user_profiles.user_type IS 'User account type: ceo, team_leader, or admin (admin can validate subscriptions)';

-- =====================================================
-- Step 3: Create/Update Pending Subscriptions View
-- =====================================================

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
-- Step 4: Update ALL RLS Policies for Subscriptions
-- =====================================================

DO $$ 
BEGIN
  -- Drop ALL existing policies if they exist
  DROP POLICY IF EXISTS "subscriptions_select_user" ON public.subscriptions;
  DROP POLICY IF EXISTS "subscriptions_insert_user" ON public.subscriptions;
  DROP POLICY IF EXISTS "subscriptions_update_admin" ON public.subscriptions;
  DROP POLICY IF EXISTS "subscriptions_select_own" ON public.subscriptions;
  DROP POLICY IF EXISTS "subscriptions_insert_service" ON public.subscriptions;
  DROP POLICY IF EXISTS "subscriptions_update_ceo" ON public.subscriptions;
  DROP POLICY IF EXISTS "subscriptions_select_ceo" ON public.subscriptions;
  DROP POLICY IF EXISTS "subscriptions_update_admin_ceo" ON public.subscriptions;
  DROP POLICY IF EXISTS "subscriptions_select_admin_ceo" ON public.subscriptions;

  -- Create new policies only if they don't exist
  
  -- Users can view their own subscriptions
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'subscriptions' AND policyname = 'subscriptions_select_own') THEN
    CREATE POLICY "subscriptions_select_own"
      ON public.subscriptions FOR SELECT
      USING (user_id = auth.uid());
  END IF;

  -- Service role can insert subscriptions (via API)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'subscriptions' AND policyname = 'subscriptions_insert_service') THEN
    CREATE POLICY "subscriptions_insert_service"
      ON public.subscriptions FOR INSERT
      WITH CHECK (auth.role() = 'service_role');
  END IF;

  -- Admins and CEOs can update subscriptions (for validation)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'subscriptions' AND policyname = 'subscriptions_update_admin_ceo') THEN
    CREATE POLICY "subscriptions_update_admin_ceo"
      ON public.subscriptions FOR UPDATE
      USING (
        auth.role() = 'service_role' 
        OR
        EXISTS (
          SELECT 1 FROM public.user_profiles
          WHERE user_id = auth.uid()
          AND user_type IN ('ceo', 'admin')
        )
      );
  END IF;

  -- Admins and CEOs can view all subscriptions
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'subscriptions' AND policyname = 'subscriptions_select_admin_ceo') THEN
    CREATE POLICY "subscriptions_select_admin_ceo"
      ON public.subscriptions FOR SELECT
      USING (
        user_id = auth.uid() -- Users can see their own
        OR
        EXISTS (
          SELECT 1 FROM public.user_profiles
          WHERE user_id = auth.uid()
          AND user_type IN ('ceo', 'admin')
        )
      );
  END IF;
END $$;

-- =====================================================
-- Step 5: Update RLS Policies for Subscription Payments
-- =====================================================

DO $$ 
BEGIN
  -- Drop old policies
  DROP POLICY IF EXISTS "payments_select_user" ON public.subscription_payments;
  DROP POLICY IF EXISTS "payments_insert_service" ON public.subscription_payments;
  DROP POLICY IF EXISTS "payments_select_ceo" ON public.subscription_payments;
  DROP POLICY IF EXISTS "payments_select_admin_ceo" ON public.subscription_payments;
  DROP POLICY IF EXISTS "payments_select_own" ON public.subscription_payments;

  -- Users can view their own payment history
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'subscription_payments' AND policyname = 'payments_select_own') THEN
    CREATE POLICY "payments_select_own"
      ON public.subscription_payments FOR SELECT
      USING (user_id = auth.uid());
  END IF;

  -- Service role can insert payments
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'subscription_payments' AND policyname = 'payments_insert_service') THEN
    CREATE POLICY "payments_insert_service"
      ON public.subscription_payments FOR INSERT
      WITH CHECK (auth.role() = 'service_role');
  END IF;

  -- Admins and CEOs can view all payments
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'subscription_payments' AND policyname = 'payments_select_admin_ceo') THEN
    CREATE POLICY "payments_select_admin_ceo"
      ON public.subscription_payments FOR SELECT
      USING (
        user_id = auth.uid() -- Users can see their own
        OR
        EXISTS (
          SELECT 1 FROM public.user_profiles
          WHERE user_id = auth.uid()
          AND user_type IN ('ceo', 'admin')
        )
      );
  END IF;
END $$;

-- =====================================================
-- Step 6: Create Storage Bucket for Payment Screenshots
-- =====================================================

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-screenshots', 'payment-screenshots', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies (ignore errors if they don't exist)
DROP POLICY IF EXISTS "Users can upload payment screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own payment screenshots" ON storage.objects;
DROP POLICY IF EXISTS "CEOs can read all payment screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Admins and CEOs can read all payment screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Service role has full access to payment screenshots" ON storage.objects;

-- Create storage policies

-- Allow authenticated users to upload their own screenshots
CREATE POLICY "Users can upload payment screenshots"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'payment-screenshots' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to read their own screenshots
CREATE POLICY "Users can read own payment screenshots"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-screenshots' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow Admins and CEOs to read all payment screenshots (for validation)
CREATE POLICY "Admins and CEOs can read all payment screenshots"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-screenshots' AND
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid()
    AND user_type IN ('ceo', 'admin')
  )
);

-- Service role has full access (for Edge Functions)
CREATE POLICY "Service role has full access to payment screenshots"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'payment-screenshots');

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check subscriptions table structure
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'subscriptions' ORDER BY ordinal_position;

-- Check admin users
-- SELECT user_id, user_type, full_name FROM user_profiles WHERE user_type = 'admin';

-- Check pending payments
-- SELECT * FROM pending_subscription_validations;

-- Check policies
-- SELECT tablename, policyname FROM pg_policies 
-- WHERE tablename IN ('subscriptions', 'subscription_payments') 
-- ORDER BY tablename, policyname;

-- Check storage bucket
-- SELECT * FROM storage.buckets WHERE id = 'payment-screenshots';

-- =====================================================
-- DONE!
-- =====================================================

