-- =====================================================
-- Add Admin Role for Subscription Validation
-- Admins can validate payments for CEOs and Team Leaders
-- =====================================================

-- Step 1: Update user_type to include 'admin'
-- This extends the existing constraint to allow admin
ALTER TABLE public.user_profiles 
  DROP CONSTRAINT IF EXISTS user_profiles_user_type_check;

ALTER TABLE public.user_profiles
  ADD CONSTRAINT user_profiles_user_type_check 
  CHECK (user_type IN ('ceo', 'team_leader', 'admin'));

COMMENT ON COLUMN public.user_profiles.user_type IS 'User account type: ceo, team_leader, or admin (admin can validate subscriptions)';

-- Step 2: Update RLS policies to allow admins

-- Drop ALL existing subscription policies
DROP POLICY IF EXISTS "subscriptions_update_ceo" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_select_ceo" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_update_admin_ceo" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_select_admin_ceo" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_select_own" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_insert_service" ON public.subscriptions;

-- Admins and CEOs can update subscriptions (for validation)
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

-- Admins and CEOs can view all subscriptions
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

-- Step 3: Update payment screenshots policies

-- Drop existing CEO policy
DROP POLICY IF EXISTS "CEOs can read all payment screenshots" ON storage.objects;

-- Admins and CEOs can read all payment screenshots
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

-- Step 4: Update payments table policies

DROP POLICY IF EXISTS "payments_select_ceo" ON public.subscription_payments;

-- Admins and CEOs can view all payments
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

-- Step 5: Create or update admin users

-- Example: Make an existing user an admin
-- UPDATE user_profiles 
-- SET user_type = 'admin' 
-- WHERE user_id = 'YOUR_ADMIN_USER_ID';

-- Or create a new admin user profile
-- INSERT INTO user_profiles (user_id, user_type, full_name)
-- VALUES ('ADMIN_USER_ID', 'admin', 'Admin Name')
-- ON CONFLICT (user_id) DO UPDATE SET user_type = 'admin';

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check admin users
SELECT user_id, user_type, full_name 
FROM user_profiles 
WHERE user_type = 'admin';

-- Verify policies
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('subscriptions', 'subscription_payments')
ORDER BY tablename, policyname;

