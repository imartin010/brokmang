# 👨‍💼 Create Admin Users for Subscription Validation

Admins are special users who can validate subscription payments for both CEOs and Team Leaders.

## What is an Admin?

- **Admin** is a third user type (in addition to CEO and Team Leader)
- Admins can access `/admin/subscriptions` to validate payments
- Admins receive notifications when users submit payments
- Admins cannot access CEO-only features (like Break-Even analysis)

## User Types Comparison

| Feature | CEO | Admin | Team Leader |
|---------|-----|-------|-------------|
| Validate Payments | ✅ | ✅ | ❌ |
| Break-Even Analysis | ✅ | ❌ | ❌ |
| Full Dashboard | ✅ | ❌ | ❌ |
| Team Management | ✅ | ✅ | ✅ |
| Reports & Insights | ✅ | ✅ | ✅ |

## How to Create an Admin User

### Option 1: Convert Existing User to Admin (SQL)

Run this in Supabase SQL Editor:

```sql
-- Replace 'USER_EMAIL' with the actual email
UPDATE user_profiles 
SET user_type = 'admin' 
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'USER_EMAIL'
);
```

Or if you know the user_id:

```sql
UPDATE user_profiles 
SET user_type = 'admin' 
WHERE user_id = 'USER_UUID_HERE';
```

### Option 2: Create New Admin User

1. **Sign up normally** at `/auth/signup`
2. **Choose any role** (CEO or Team Leader) at `/select-role`
3. **Convert to Admin** via SQL:
```sql
UPDATE user_profiles 
SET user_type = 'admin' 
WHERE user_id = 'NEW_USER_ID';
```

### Option 3: Create Admin During User Creation

If creating user programmatically:

```sql
-- After user signs up via Supabase Auth
INSERT INTO user_profiles (user_id, user_type, full_name)
VALUES (
  'USER_ID_FROM_AUTH',
  'admin',
  'Admin Full Name'
)
ON CONFLICT (user_id) 
DO UPDATE SET user_type = 'admin';
```

## Verify Admin User

Check if a user is admin:

```sql
SELECT 
  up.user_id,
  u.email,
  up.full_name,
  up.user_type
FROM user_profiles up
JOIN auth.users u ON u.id = up.user_id
WHERE up.user_type = 'admin';
```

## Test Admin Access

1. **Sign in** as the admin user
2. **Go to** `/admin/subscriptions`
3. **Should see** subscription management panel (not "Access Denied")
4. **Try validating** a pending payment

## Create Multiple Admins

You can have multiple admin users:

```sql
-- Create multiple admins at once
UPDATE user_profiles 
SET user_type = 'admin' 
WHERE user_id IN (
  'ADMIN_USER_ID_1',
  'ADMIN_USER_ID_2',
  'ADMIN_USER_ID_3'
);
```

## Admin Permissions

Admins can:
- ✅ View all subscriptions
- ✅ Approve/reject payments
- ✅ View payment screenshots
- ✅ Add admin notes
- ✅ Receive validation notifications

Admins cannot:
- ❌ Access CEO-only features (Break-Even analysis)
- ❌ Delete subscriptions
- ❌ Modify other users' profiles

## Remove Admin Access

To revoke admin access:

```sql
-- Change admin back to team_leader
UPDATE user_profiles 
SET user_type = 'team_leader' 
WHERE user_id = 'ADMIN_USER_ID';

-- Or change to CEO
UPDATE user_profiles 
SET user_type = 'ceo' 
WHERE user_id = 'ADMIN_USER_ID';
```

## Recommended Setup

For production:

1. **Create 1-2 dedicated admin users** for payment validation
2. **Use admin accounts ONLY for validation** (not for regular platform use)
3. **Keep admin credentials secure**
4. **Audit admin actions** via `subscriptions.validated_by` field

## Example: Create First Admin

```sql
-- Step 1: Find a user by email
SELECT id, email FROM auth.users WHERE email = 'admin@example.com';

-- Step 2: Make them admin
UPDATE user_profiles 
SET user_type = 'admin',
    full_name = 'Payment Validator Admin'
WHERE user_id = 'USER_ID_FROM_STEP_1';

-- Step 3: Verify
SELECT * FROM user_profiles WHERE user_type = 'admin';
```

Done! The user can now access `/admin/subscriptions` and validate payments.

## Quick Reference

```sql
-- List all admins
SELECT u.email, up.full_name 
FROM user_profiles up
JOIN auth.users u ON u.id = up.user_id
WHERE up.user_type = 'admin';

-- Create admin
UPDATE user_profiles SET user_type = 'admin' WHERE user_id = 'ID';

-- Remove admin
UPDATE user_profiles SET user_type = 'team_leader' WHERE user_id = 'ID';

-- Count users by type
SELECT user_type, COUNT(*) 
FROM user_profiles 
GROUP BY user_type;
```

