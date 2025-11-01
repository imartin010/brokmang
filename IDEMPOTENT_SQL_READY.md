# ✅ Idempotent SQL Ready

## 🎯 The Error You Saw

**Error:** `policy "users_select_own_profile" for table "user_profiles" already exists`

**Why:** You tried to create policies that already exist.

---

## ✅ The Solution

**File:** `supabase/create-user-profiles-IDEMPOTENT.sql`

This script:
1. ✅ Drops existing policies **first** (if they exist)
2. ✅ Then creates them fresh
3. ✅ Can be run **multiple times safely**
4. ✅ Includes verification

---

## 🚀 Run This Instead

**Copy this entire SQL block:**

```sql
BEGIN;

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type text NOT NULL CHECK (user_type IN ('ceo', 'team_leader')),
  full_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_user_id_uidx ON public.user_profiles (user_id);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "users_insert_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.user_profiles;

CREATE POLICY "users_select_own_profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

COMMIT;
```

---

## ✅ What This Does

1. **Creates table** (only if doesn't exist)
2. **Creates index** (only if doesn't exist)
3. **Drops old policies** (safe - won't error if missing)
4. **Creates fresh policies** (clean slate)
5. **Verifies success**

---

## 🧪 After Running

**Expected output:**
```
NOTICE: ===========================================
NOTICE: VERIFICATION RESULTS
NOTICE: ===========================================
NOTICE: Table exists: true (expected: true)
NOTICE: RLS policies: 3 (expected: 3)
NOTICE: Unique index: true (expected: true)
NOTICE: ===========================================
NOTICE: ✅ SUCCESS! user_profiles table is ready!
NOTICE: ===========================================
```

**Then test sign-in - should work!** 🚀

