# 🚨 CRITICAL: Run These Steps NOW

## Step 1: Fix Database (DO THIS FIRST!)

**Copy this entire SQL block** and paste in Supabase SQL Editor:

```sql
-- FIX INFINITE RECURSION
ALTER TABLE public.sales_agents DISABLE ROW LEVEL SECURITY;

DO $$ 
DECLARE r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'sales_agents') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.sales_agents';
    END LOOP;
END $$;

ALTER TABLE public.sales_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own" ON public.sales_agents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own" ON public.sales_agents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own" ON public.sales_agents
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

**Click "Run" in Supabase!**

---

## Step 2: Clear Cache

```bash
# Stop dev server (Ctrl+C in terminal)
rm -rf .next
npm run dev
```

---

## Step 3: Clear Browser

1. **Chrome DevTools** (F12)
2. **Application tab**
3. **Storage** → **Clear site data**
4. **Click "Clear site data"**
5. **Close browser**
6. **Reopen browser**

---

## Step 4: Test

1. Go to `localhost:3000/auth`
2. Sign in
3. Should work! ✅

---

**DO THESE STEPS IN ORDER!**

The SQL fix is the MOST IMPORTANT - it removes the infinite recursion error that's blocking everything.

