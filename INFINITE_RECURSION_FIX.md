# 🚨 INFINITE RECURSION ERROR - CRITICAL FIX

## ❌ The Error

```
code: "42P17"
message: "infinite recursion detected in policy for relation \"sales_agents\""
```

## 🎯 What This Means

Your **RLS (Row Level Security) policies** are causing an **infinite loop**. This happens when:
1. Multiple policies check the same table
2. Policies reference each other
3. Old + new policies conflict

**This is a CRITICAL error that blocks ALL database access to that table.**

---

## ✅ IMMEDIATE FIX (Run This NOW)

### Step 1: Open Supabase SQL Editor

### Step 2: Copy/Paste This ENTIRE Script

```sql
-- CRITICAL FIX: Remove ALL policies and create simple ones

-- Disable RLS temporarily
ALTER TABLE public.sales_agents DISABLE ROW LEVEL SECURITY;

-- Drop EVERY policy (loop through all existing ones)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'sales_agents') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.sales_agents';
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE public.sales_agents ENABLE ROW LEVEL SECURITY;

-- Create SIMPLE policies (no recursion possible)
CREATE POLICY "users_select_own_row" ON public.sales_agents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_row" ON public.sales_agents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_row" ON public.sales_agents
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### Step 3: Verify It Worked

Run this to check policies:

```sql
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'sales_agents';
```

**Should show ONLY 3 policies:**
- `users_select_own_row` | SELECT
- `users_insert_own_row` | INSERT
- `users_update_own_row` | UPDATE

### Step 4: Test Role Selection

1. **Go back to:** `localhost:3000/select-account-type`
2. **Click CEO**
3. **Should work!** ✅

---

## 🔍 Why This Happened

### Common Causes

1. **Multiple Migrations**
   - You ran multiple schema files
   - Each added their own policies
   - Old policies never got removed

2. **Policy Conflicts**
   - `agents_select_org_member` policy
   - References `sales_agents` table
   - Which triggers another policy check
   - Which triggers another... **INFINITE LOOP**

3. **Complex Policy Logic**
   - Policies with JOINs to same table
   - Subqueries on same table
   - Recursive checks

---

## 🛡️ The Safe Policies (No Recursion)

### Why These Are Safe

```sql
-- ✅ SAFE: Direct check on current row only
USING (auth.uid() = user_id)

-- ❌ DANGEROUS: Checking other rows (can recurse)
USING (user_id IN (SELECT user_id FROM sales_agents WHERE ...))

-- ❌ DANGEROUS: JOINing to same table
USING (EXISTS (SELECT 1 FROM sales_agents AS sa WHERE ...))
```

Our new policies are **deliberately simple**:
- ✅ Only check `auth.uid() = user_id`
- ✅ No subqueries
- ✅ No JOINs
- ✅ No references to other rows
- ✅ **Cannot recurse!**

---

## 🧪 After Running Fix

### What You Should See

```sql
-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'sales_agents';

-- Result: Exactly 3 policies
✅ users_select_own_row
✅ users_insert_own_row  
✅ users_update_own_row
```

### Test Your Access

```sql
-- This should work now (returns empty or your row)
SELECT * FROM sales_agents WHERE user_id = auth.uid();

-- This should work too (try inserting)
INSERT INTO sales_agents (user_id, user_type, full_name, is_active)
VALUES (auth.uid(), 'ceo', 'Test User', true)
ON CONFLICT (user_id) DO UPDATE 
SET user_type = 'ceo';
```

---

## 🚨 If You Get Other Errors

### Error: "permission denied for table sales_agents"
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename = 'sales_agents';

-- Should show: rowsecurity = true
```

### Error: "new row violates row-level security policy"
```sql
-- Check your policies allow INSERT
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'sales_agents' AND cmd = 'INSERT';

-- Should show: users_insert_own_row
```

### Error: "duplicate key value"
```sql
-- You already have a row, use UPDATE instead
UPDATE sales_agents 
SET user_type = 'ceo' 
WHERE user_id = auth.uid();
```

---

## 📊 Understanding the Error Code

```
PostgreSQL Error Codes:
- 42P17 = "infinite recursion detected in policy"
- 42501 = "permission denied" (RLS blocking)
- 23505 = "duplicate key violation" (unique constraint)
- 23502 = "not-null constraint violation"
```

**42P17** specifically means your policies are calling each other in a loop.

---

## 🔄 Complete Reset (Nuclear Option)

If the fix above STILL doesn't work:

```sql
-- WARNING: This removes ALL data from sales_agents table!
-- Only use for local development/testing

-- 1. Drop table completely
DROP TABLE IF EXISTS public.sales_agents CASCADE;

-- 2. Recreate it fresh
CREATE TABLE public.sales_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type text CHECK (user_type IN ('ceo', 'team_leader')),
  full_name text NOT NULL,
  phone text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE public.sales_agents ENABLE ROW LEVEL SECURITY;

-- 4. Add simple policies
CREATE POLICY "users_select_own_row" ON public.sales_agents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_row" ON public.sales_agents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_row" ON public.sales_agents
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

## ✅ Success Checklist

After running the fix:

- [ ] Supabase SQL runs without errors
- [ ] `SELECT * FROM pg_policies WHERE tablename = 'sales_agents'` shows exactly 3 policies
- [ ] No policies with "org_member" or "agent_select" names
- [ ] Can SELECT from sales_agents WHERE user_id = auth.uid()
- [ ] Role selection page works
- [ ] Can click CEO and get redirected to dashboard
- [ ] No infinite recursion errors in console

---

## 🎉 Expected Result

```
1. Click "Select CEO"
   ↓
2. Button shows "Setting up..."
   ↓
3. Database INSERT/UPDATE works ✅
   ↓
4. Redirect to /dashboard ✅
   ↓
5. Shows CEO Dashboard ✅
```

**No errors, no recursion, just works!**

---

**File:** `supabase/fix-infinite-recursion.sql`
**Priority:** 🚨 CRITICAL - Run immediately
**Time:** 10 seconds

---

Run that SQL and the infinite recursion will be **completely eliminated**! 🎯

