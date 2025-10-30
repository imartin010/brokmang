# 🔧 Migration Fix - Duplicate user_id Issue

## ❌ Problem

The migration failed with error:
```
ERROR: 23505: could not create unique index "sales_agents_user_id_uidx"
DETAIL: Key (user_id)=(4c4a72b9-7ded-4d33-b7ed-0ee9b87a1778) is duplicated.
```

**Cause:** You have duplicate `user_id` entries in the `sales_agents` table. This happens when the same user has multiple agent records.

---

## ✅ Solution

I've created a **fixed migration** that handles this automatically.

### Option 1: Run Fixed Migration (Recommended)

**File:** `supabase/migrations/01_user_type_column_fixed.sql`

This migration will:
1. ✅ Detect duplicate entries
2. ✅ Keep only the **most recent** record per user
3. ✅ Delete older duplicate records
4. ✅ Create the unique index
5. ✅ Enable realtime
6. ✅ Set up RLS policies

**Just run this SQL file in Supabase SQL Editor!**

---

### Option 2: Check Duplicates First (Optional)

If you want to **see the duplicates** before removing them:

```sql
-- 1. Find all duplicate user_id entries
SELECT 
  user_id,
  COUNT(*) as duplicate_count,
  ARRAY_AGG(id ORDER BY created_at DESC) as record_ids,
  ARRAY_AGG(full_name ORDER BY created_at DESC) as names
FROM public.sales_agents
WHERE user_id IS NOT NULL
GROUP BY user_id
HAVING COUNT(*) > 1;
```

This will show you:
- Which `user_id` values are duplicated
- How many duplicates exist
- The IDs of duplicate records
- The names associated with each

---

### Option 3: Manual Cleanup (Advanced)

If you want to **manually decide** which records to keep:

```sql
-- View all records for a specific user_id
SELECT id, user_id, full_name, user_type, created_at, is_active
FROM public.sales_agents
WHERE user_id = 'YOUR_USER_ID_HERE'
ORDER BY created_at DESC;

-- Delete specific record(s) by ID
DELETE FROM public.sales_agents WHERE id = 'RECORD_ID_TO_DELETE';

-- After cleaning up, run the original migration
```

---

## 🚀 Quick Fix (Recommended)

**Just run this in Supabase SQL Editor:**

```bash
supabase/migrations/01_user_type_column_fixed.sql
```

The fixed migration will:
- Automatically remove duplicates (keeps newest)
- Create unique index successfully
- Enable realtime
- Set up security policies
- Show you a summary at the end

---

## 🧪 After Migration - Verify

Run these queries to verify everything worked:

```sql
-- 1. Check for any remaining duplicates (should return 0 rows)
SELECT user_id, COUNT(*) as cnt
FROM public.sales_agents
WHERE user_id IS NOT NULL
GROUP BY user_id
HAVING COUNT(*) > 1;

-- 2. Check realtime is enabled (should return 1 row)
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
  AND tablename = 'sales_agents';

-- 3. Check unique index exists (should return 1 row)
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'sales_agents' 
  AND indexname = 'sales_agents_user_id_uidx';

-- 4. View your user_type
SELECT user_id, user_type, full_name, created_at
FROM public.sales_agents
WHERE user_id = auth.uid();
```

---

## 🎯 Expected Results

After running the fixed migration, you should see:

```
NOTICE: Found X duplicate user_id entries. Will keep the most recent one.
NOTICE: ===========================================
NOTICE: Migration Complete!
NOTICE: ===========================================
NOTICE: Total sales_agents records: X
NOTICE: Records with user_id: X
NOTICE: Records with user_type: X
NOTICE: ===========================================
```

---

## ❓ FAQ

### Why do I have duplicates?

This can happen when:
- Multiple agent records were created for the same user
- Old test data exists
- Migration was run multiple times with errors
- Manual data entry created duplicates

### Which record will be kept?

The **most recent** record (by `created_at` timestamp) will be kept, and older duplicates will be deleted.

### What if I want to keep a specific record?

Before running the fixed migration:
1. Check duplicates using Option 2 above
2. Manually delete the ones you DON'T want
3. Then run the fixed migration

### Will this affect my data?

Only duplicate records will be deleted. If you only have one record per `user_id`, nothing will be deleted.

---

## 🔄 Next Steps

1. **Run the fixed migration:** `01_user_type_column_fixed.sql`
2. **Verify:** Run the verification queries above
3. **Test:** Try the dashboard flow (sign in → select role → see dashboard)

---

**Status:** ✅ Fixed migration ready to run
**File:** `supabase/migrations/01_user_type_column_fixed.sql`

