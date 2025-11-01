-- Make Martin Admin
-- Update user_profiles to set user_type = 'admin' for themartining@gmail.com

UPDATE user_profiles 
SET user_type = 'admin' 
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'themartining@gmail.com'
);

-- Verify the update
SELECT 
  up.user_id,
  u.email,
  up.full_name,
  up.user_type,
  up.created_at
FROM user_profiles up
JOIN auth.users u ON u.id = up.user_id
WHERE u.email = 'themartining@gmail.com';

-- List all admins
SELECT 
  up.user_id,
  u.email,
  up.full_name,
  up.user_type
FROM user_profiles up
JOIN auth.users u ON u.id = up.user_id
WHERE up.user_type = 'admin';
