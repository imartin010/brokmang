# ⚠️ Database Setup Required!

You're seeing errors because **the database migrations haven't been run yet**.

## 🔧 Quick Fix (Run These Migrations)

### Step 1: Add User Type Column

Go to **Supabase Dashboard** → **SQL Editor** and run this file:

📁 **`supabase/add-user-type.sql`**

This adds the `user_type` column to your `sales_agents` table.

### Step 2: Verify It Worked

Run this query in SQL Editor to check:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'sales_agents' 
AND column_name = 'user_type';
```

You should see the `user_type` column listed.

---

## 🎯 What This Fixes

After running the migration, new users will be able to:
- ✅ Select their account type (CEO or Team Leader)
- ✅ Have it saved to the database
- ✅ See appropriate navigation based on their type
- ✅ Access the correct features

---

## 📝 Alternative: Manual SQL

If you prefer, run this directly in SQL Editor:

```sql
-- Create enum type
DO $$ BEGIN
  CREATE TYPE user_account_type AS ENUM ('ceo', 'team_leader');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add column to sales_agents
ALTER TABLE sales_agents
ADD COLUMN IF NOT EXISTS user_type user_account_type DEFAULT NULL;

-- Add index
CREATE INDEX IF NOT EXISTS idx_sales_agents_user_type ON sales_agents(user_type);
```

---

## 🚀 After Running the Migration

1. **Refresh your browser** at `localhost:3000/select-account-type`
2. **Select your account type**
3. **It should work!** ✅

---

## 💡 Future: Full Multi-Tenant Setup

If you want the complete Phase-2 multi-tenant system, also run:
- `supabase/schema-v1_1.sql` (organizations, branches, teams)
- `supabase/rls-v1_1.sql` (security policies)
- `supabase/subscription-system.sql` (AI payments)

But for now, just running `add-user-type.sql` is enough to unblock you!

