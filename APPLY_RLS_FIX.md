# 🔧 Apply RLS Fix for break_even_records

## Problem
Error: `"new row violates row-level security policy for table 'break_even_records'"`

## Solution

### Option 1: Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Fix**
   - Copy the entire contents of `supabase/fix-break-even-rls.sql`
   - Paste into the SQL editor
   - Click "Run" (or press Cmd/Ctrl + Enter)

4. **Verify**
   - You should see a success message
   - Check the results table - it should show 3 policies created

### Option 2: Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db execute -f supabase/fix-break-even-rls.sql
```

### Option 3: Manual SQL Execution

Run these commands in your Supabase SQL Editor:

```sql
-- Drop all existing policies
DROP POLICY IF EXISTS "read own" ON public.break_even_records;
DROP POLICY IF EXISTS "insert own" ON public.break_even_records;
DROP POLICY IF EXISTS "delete own" ON public.break_even_records;
DROP POLICY IF EXISTS "break_even_records_select_own" ON public.break_even_records;
DROP POLICY IF EXISTS "break_even_records_insert_own" ON public.break_even_records;
DROP POLICY IF EXISTS "break_even_records_delete_own" ON public.break_even_records;
DROP POLICY IF EXISTS "break_even_select_org_member" ON public.break_even_records;
DROP POLICY IF EXISTS "break_even_insert_manager" ON public.break_even_records;

-- Create simple policies
CREATE POLICY "break_even_select_own"
  ON public.break_even_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "break_even_insert_own"
  ON public.break_even_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "break_even_delete_own"
  ON public.break_even_records FOR DELETE
  USING (auth.uid() = user_id);
```

## After Running the Fix

1. **Refresh your browser** (clear cache if needed)
2. **Try saving again** - should work now! ✅

## If It Still Doesn't Work

Check the browser console for the detailed error message (I've improved the error logging).

The error should now show:
- Error message
- Error code
- Details/hints from Supabase

Share that error message and I'll help fix it!

