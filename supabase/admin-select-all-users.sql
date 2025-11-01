-- =====================================================
-- Allow Admins to Select All Users
-- Admins should be able to view all user_profiles
-- =====================================================

-- Drop existing admin select policy if exists
DROP POLICY IF EXISTS "admins_select_all_users" ON public.user_profiles;

-- Create policy allowing admins to select all user profiles
CREATE POLICY "admins_select_all_users" 
ON public.user_profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid()
    AND user_type = 'admin'
  )
);

-- Verify the policy
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual as using_clause
FROM pg_policies
WHERE tablename = 'user_profiles'
ORDER BY policyname;

