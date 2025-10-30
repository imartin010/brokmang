# 🔧 Select Role Error - Quick Fix

## ❌ The Error

When selecting CEO or Team Leader, you get:
```
Error setting user type: {}
```

## 🎯 Root Cause

**RLS (Row Level Security) policies** are either:
1. Missing from the database
2. Conflicting with the upsert operation
3. Not properly configured for INSERT/UPDATE

## ✅ Quick Fix

### Step 1: Run This SQL

Open **Supabase SQL Editor** and run:

```sql
-- File: supabase/fix-rls-policies.sql
```

Or copy/paste this:

```sql
-- Enable RLS
ALTER TABLE public.sales_agents ENABLE ROW LEVEL SECURITY;

-- Drop ALL old policies (clean slate)
DROP POLICY IF EXISTS "select own agent row" ON public.sales_agents;
DROP POLICY IF EXISTS "update own agent row" ON public.sales_agents;
DROP POLICY IF EXISTS "insert self row" ON public.sales_agents;
DROP POLICY IF EXISTS "agents_select_own" ON public.sales_agents;
DROP POLICY IF EXISTS "agents_insert_own" ON public.sales_agents;
DROP POLICY IF EXISTS "agents_update_own" ON public.sales_agents;
DROP POLICY IF EXISTS "agents_delete_own" ON public.sales_agents;
DROP POLICY IF EXISTS "agents_select_org_member" ON public.sales_agents;

-- Create new simple policies
CREATE POLICY "select own agent row" ON public.sales_agents
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "insert self row" ON public.sales_agents
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update own agent row" ON public.sales_agents
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

### Step 2: Test Again

1. **Refresh** the page: `localhost:3000/select-account-type`
2. **Click CEO** or **Team Leader**
3. **Should work now!** ✅

---

## 🔍 Why This Happens

Supabase RLS can have **conflicting policies** from:
- Old migrations
- Multiple schema files
- Previous testing

This script **cleans up all old policies** and creates fresh ones.

---

## ✅ What The Policies Do

### 1. SELECT Policy
```sql
USING (auth.uid() = user_id)
```
- Users can **read** their own row

### 2. INSERT Policy  
```sql
WITH CHECK (auth.uid() = user_id)
```
- Users can **create** a row for themselves
- **Crucial for role selection!**

### 3. UPDATE Policy
```sql
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id)
```
- Users can **update** their own row
- **Needed for upsert operation!**

---

## 🧪 Verify It Worked

Run this in Supabase SQL Editor:

```sql
-- Check policies exist
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'sales_agents';

-- Should show:
-- "select own agent row" | SELECT
-- "insert self row"      | INSERT  
-- "update own agent row" | UPDATE
```

---

## 🚨 Alternative: Temporary Bypass (Not Recommended)

If you need to test **immediately**, you can temporarily disable RLS:

```sql
-- TEMPORARY - NOT FOR PRODUCTION
ALTER TABLE public.sales_agents DISABLE ROW LEVEL SECURITY;
```

**Warning:** This allows anyone to access any data! Only for local testing.

To re-enable:
```sql
ALTER TABLE public.sales_agents ENABLE ROW LEVEL SECURITY;
```

---

## 🔄 If Still Not Working

### Check Your Session
```javascript
// In browser console
const { data } = await supabase.auth.getSession();
console.log('User ID:', data.session?.user?.id);
```

### Check Database Directly
```sql
-- In Supabase SQL Editor
SELECT user_id, user_type, full_name, created_at
FROM public.sales_agents
ORDER BY created_at DESC
LIMIT 5;
```

### Check Browser Console
1. **Open DevTools** (F12)
2. **Go to Console tab**
3. **Try selecting role again**
4. **Look for detailed error message**

---

## 📝 Common Error Messages

| Error | Cause | Fix |
|-------|-------|-----|
| `Error setting user type: {}` | RLS blocking | Run fix-rls-policies.sql |
| `new row violates row-level security policy` | RLS policy mismatch | Run fix-rls-policies.sql |
| `duplicate key value violates unique constraint` | Already exists | Use UPDATE instead |
| `null value in column "full_name"` | Missing required field | Check code |

---

## 🎉 Expected Result

After fix:
1. ✅ Click CEO → Redirects to dashboard
2. ✅ Click Team Leader → Redirects to dashboard
3. ✅ Dashboard shows correct role
4. ✅ No errors in console

---

**Status:** Ready to fix!
**File:** `supabase/fix-rls-policies.sql`
**Time:** ~30 seconds to run

