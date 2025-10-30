# 🔧 Stuck at Sign In - Quick Fix

## ❌ The Error

```
PGRST116: The result contains 0 rows
406 (Not Acceptable)
```

## 🎯 What This Means

The database query for `sales_agents` is:
1. Returning 0 rows (you don't have a record), OR
2. Being blocked by RLS policies

## ✅ IMMEDIATE FIX

### Step 1: Run This SQL (CRITICAL!)

**Open Supabase SQL Editor and paste this:**

```sql
-- Completely reset RLS policies
ALTER TABLE public.sales_agents DISABLE ROW LEVEL SECURITY;

-- Drop ALL policies
DO $$ 
DECLARE r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'sales_agents') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.sales_agents';
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE public.sales_agents ENABLE ROW LEVEL SECURITY;

-- Create SIMPLE policies
CREATE POLICY "users_select_own" ON public.sales_agents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own" ON public.sales_agents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own" ON public.sales_agents
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Verify
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'sales_agents';
```

### Step 2: Clear Browser

1. **DevTools** (F12) → **Application** → **Storage** → **Clear site data**
2. **Close browser completely**
3. **Reopen browser**

### Step 3: Test Again

1. Go to `localhost:3000`
2. Click "Sign In"
3. Enter credentials
4. Click "Sign In"
5. **Should work!** ✅

---

## 🔍 Why You're Stuck

The `sales_agents` table query is failing because:
1. **RLS policies are still broken** (infinite recursion)
2. Database can't return results
3. App gets stuck waiting for data

The SQL above **completely resets the policies** to simple, working ones.

---

## 🚀 After SQL Fix

The flow will be:
1. Sign in → Session created ✅
2. Dashboard checks user_type → No record found
3. Redirects to `/select-role`
4. You choose CEO or Team Leader
5. Saves to database ✅
6. Shows dashboard ✅

---

**Run that SQL NOW and you'll be unstuck!** 🎯

