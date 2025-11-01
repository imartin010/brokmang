# ✅ Solution: Create user_profiles Table

## 🎯 You're Right!

You need a **dedicated table** to store user profiles with their role and info.

Instead of using the complex `sales_agents` table (which is for actual agents/employees), we should use a simple `user_profiles` table.

---

## 🗄️ New Approach: user_profiles Table

### Why This Is Better

❌ **Old Approach:** Use `sales_agents` table
- Table is for employees/agents data
- Has many columns (org_id, branch_id, team_id, etc.)
- Complex constraints and relationships
- Confusing for simple user role storage

✅ **New Approach:** Create `user_profiles` table
- Dedicated to user authentication data
- Simple structure (user_id + user_type + name)
- Clean separation of concerns
- No complex relationships

---

## 🚀 Run This SQL

**File:** `supabase/create-user-profiles-table.sql`

This creates:
```sql
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY,
  user_id uuid UNIQUE NOT NULL,  -- Links to auth.users
  user_type text NOT NULL,        -- 'ceo' or 'team_leader'
  full_name text,
  created_at timestamptz,
  updated_at timestamptz
);
```

With:
- ✅ Unique index on user_id (allows upsert)
- ✅ Simple RLS policies (no recursion possible)
- ✅ Built-in verification
- ✅ Clean, focused purpose

---

## 📝 Then Update Code

After creating the table, I'll update the code to use `user_profiles` instead of `sales_agents`.

---

## 🎯 The Flow

```
Sign Up → auth.users created
       ↓
Select Role (CEO/Team Leader)
       ↓
INSERT into user_profiles:
  {
    user_id: auth-id,
    user_type: 'ceo' or 'team_leader',
    full_name: from email
  }
       ↓
Dashboard queries user_profiles
       ↓
Shows content based on user_type
```

---

**Should I:**
1. ✅ **Create the user_profiles table** (clean, dedicated)
2. ❌ **Try to fix sales_agents** (complex, messy)

**Which do you prefer?** I recommend option 1 (create user_profiles table) - it's cleaner and will work immediately!

