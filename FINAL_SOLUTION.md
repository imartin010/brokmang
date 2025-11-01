# ✅ FINAL SOLUTION - Create user_profiles Table

## 🎯 You Were Right!

The problem is we need a **dedicated table** for user profiles, separate from `sales_agents`.

**`sales_agents`** = For actual sales agents/employees (complex table with org_id, branch_id, etc.)
**`user_profiles`** = For user authentication and role (simple, clean)

---

## 🚀 THE COMPLETE FIX (2 Steps)

### Step 1: Create user_profiles Table

**Open Supabase SQL Editor** and run:

```sql
-- File: supabase/create-user-profiles-table.sql

BEGIN;

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type text NOT NULL CHECK (user_type IN ('ceo', 'team_leader')),
  full_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create unique index
CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_user_id_uidx ON public.user_profiles (user_id);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies
CREATE POLICY "users_select_own_profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Verification
DO $$
DECLARE
  table_exists boolean;
  policy_count int;
  index_exists boolean;
BEGIN
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') INTO table_exists;
  SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename = 'user_profiles';
  SELECT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'user_profiles' AND indexname = 'user_profiles_user_id_uidx') INTO index_exists;
  
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Table exists: % (expected: true)', table_exists;
  RAISE NOTICE 'RLS policies: % (expected: 3)', policy_count;
  RAISE NOTICE 'Unique index: % (expected: true)', index_exists;
  
  IF NOT table_exists OR policy_count != 3 OR NOT index_exists THEN
    RAISE EXCEPTION 'Verification failed!';
  END IF;
  
  RAISE NOTICE '✅ TABLE CREATED SUCCESSFULLY!';
  RAISE NOTICE '===========================================';
END $$;

COMMIT;
```

### Step 2: Test the App

1. **Refresh browser**
2. **Go to** `localhost:3000`
3. **Click "Sign In"** (or Sign Up if new)
4. **Go to** `/select-role`
5. **Click CEO** or **Team Leader**
6. **Should work perfectly!** ✅

---

## ✅ What I Updated

**Code files now use `user_profiles` table:**
- ✅ `app/select-role/page.tsx` - Saves to user_profiles
- ✅ `app/dashboard/page.tsx` - Reads from user_profiles
- ✅ `components/Navbar.tsx` - Fetches from user_profiles
- ✅ `app/auth/callback/page.tsx` - Checks user_profiles

---

## 🎨 Table Structure

```sql
user_profiles
├─ id (uuid) - Primary key
├─ user_id (uuid) - UNIQUE, links to auth.users
├─ user_type (text) - 'ceo' or 'team_leader'
├─ full_name (text) - User's name
├─ created_at (timestamptz)
└─ updated_at (timestamptz)
```

**Clean, simple, purpose-built for user authentication!**

---

## 🔄 The Complete Flow

```
1. User signs up → auth.users created
2. User selects role → user_profiles INSERT
3. Dashboard loads → user_profiles SELECT
4. Show content based on user_type
```

---

## ✅ Why This Works

1. **Dedicated table** - No conflicts with sales_agents
2. **Simple structure** - Only what's needed
3. **Clean RLS** - Simple policies, no recursion
4. **Unique constraint** - Allows upsert with onConflict
5. **Separate concerns** - Auth data vs business data

---

**Just run the SQL and it will work immediately!** 🚀

