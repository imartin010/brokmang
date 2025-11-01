-- Make Yourself Admin
-- Run this in Supabase SQL Editor

-- Option 1: Update by your email (replace with your actual email)
UPDATE user_profiles 
SET user_type = 'admin' 
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL_HERE'
);

-- Option 2: Update by user_id (if you know your user_id)
-- UPDATE user_profiles 
-- SET user_type = 'admin' 
-- WHERE user_id = 'YOUR_USER_ID_HERE';

-- Verify the update
SELECT 
  up.user_id,
  u.email,
  up.full_name,
  up.user_type
FROM user_profiles up
JOIN auth.users u ON u.id = up.user_id
WHERE up.user_type = 'admin';
