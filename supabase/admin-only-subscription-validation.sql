-- =====================================================
-- Admin-Only Subscription Validation
-- Only Admins can validate AI subscriptions
-- CEOs and Team Leaders are clients who purchase subscriptions
-- =====================================================

-- Step 1: Update subscription RLS policies (Admin-only for validation)
-- =====================================================

-- Drop existing policies that allow CEOs to validate
DROP POLICY IF EXISTS "subscriptions_update_admin_ceo" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_select_admin_ceo" ON public.subscriptions;

-- Only Admins can update subscriptions (for validation)
-- Service role can also update (for system operations)
CREATE POLICY "subscriptions_update_admin_only"
  ON public.subscriptions FOR UPDATE
  USING (
    auth.role() = 'service_role' 
    OR
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid()
      AND user_type = 'admin'
    )
  )
  WITH CHECK (
    auth.role() = 'service_role' 
    OR
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid()
      AND user_type = 'admin'
    )
  );

-- Users can see their own subscriptions
-- Admins can see all subscriptions (for validation)
CREATE POLICY "subscriptions_select_own_or_admin"
  ON public.subscriptions FOR SELECT
  USING (
    user_id = auth.uid() -- Users can see their own
    OR
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid()
      AND user_type = 'admin'
    )
  );

-- Step 2: Update subscription_payments RLS policies (Admin-only for validation)
-- =====================================================

-- Drop existing policies that allow CEOs to view all payments
DROP POLICY IF EXISTS "payments_select_admin_ceo" ON public.subscription_payments;

-- Users can see their own payments
-- Admins can see all payments (for validation)
CREATE POLICY "payments_select_own_or_admin"
  ON public.subscription_payments FOR SELECT
  USING (
    user_id = auth.uid() -- Users can see their own
    OR
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid()
      AND user_type = 'admin'
    )
  );

-- Only Admins can update payment status (for validation)
CREATE POLICY "payments_update_admin_only"
  ON public.subscription_payments FOR UPDATE
  USING (
    auth.role() = 'service_role' 
    OR
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid()
      AND user_type = 'admin'
    )
  )
  WITH CHECK (
    auth.role() = 'service_role' 
    OR
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid()
      AND user_type = 'admin'
    )
  );

-- Step 3: Update payment screenshots storage policies (Admin-only)
-- =====================================================

-- Drop existing policy that allows CEOs to read payment screenshots
DROP POLICY IF EXISTS "Admins and CEOs can read all payment screenshots" ON storage.objects;

-- Only Admins can read payment screenshots (for validation)
CREATE POLICY "Admins can read all payment screenshots"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-screenshots' AND
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid()
    AND user_type = 'admin'
  )
);

-- Users can upload their own payment screenshots
CREATE POLICY "Users can upload their own payment screenshots"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'payment-screenshots' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can read their own payment screenshots
CREATE POLICY "Users can read their own payment screenshots"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-screenshots' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check admin users
SELECT 
  u.email,
  up.user_type,
  up.full_name
FROM user_profiles up
JOIN auth.users u ON u.id = up.user_id
WHERE up.user_type = 'admin';

-- Verify subscription policies
SELECT 
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN qual IS NOT NULL THEN substring(qual::text, 1, 100)
    ELSE NULL
  END as using_clause
FROM pg_policies 
WHERE tablename IN ('subscriptions', 'subscription_payments')
ORDER BY tablename, cmd, policyname;

-- Verify storage policies
SELECT 
  policyname,
  cmd,
  CASE 
    WHEN qual IS NOT NULL THEN substring(qual::text, 1, 100)
    ELSE NULL
  END as using_clause
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%payment%'
ORDER BY policyname;

