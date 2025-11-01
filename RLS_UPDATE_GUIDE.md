# RLS Policies Update Guide - Removing Organizations

This guide explains how to update your Row-Level Security (RLS) policies after removing organizations from your database.

## Migration Order

**IMPORTANT**: Run these SQL scripts in this exact order:

1. **First**: `supabase/remove-organizations.sql` - Removes organization tables and columns
2. **Second**: `supabase/rls-simplified-no-org.sql` - Updates all RLS policies

## Step-by-Step Instructions

### Step 1: Backup Your Database

⚠️ **CRITICAL**: Before making any changes, backup your database!

```bash
# Using Supabase CLI
supabase db dump -f backup_before_org_removal.sql

# Or export via Supabase Dashboard → Database → Backups
```

### Step 2: Run the Organization Removal Script

This removes all organization-related database structures:

```sql
-- Run in Supabase SQL Editor or via psql
\i supabase/remove-organizations.sql
```

Or copy/paste the contents of `supabase/remove-organizations.sql` into your Supabase SQL Editor and execute.

**What this does:**
- Drops organization tables (organizations, memberships, branches, teams, etc.)
- Removes `org_id` columns from all remaining tables
- Drops organization-related functions
- Removes organization-related indexes

### Step 3: Update RLS Policies

After removing organizations, you need to update all RLS policies:

```sql
-- Run in Supabase SQL Editor or via psql
\i supabase/rls-simplified-no-org.sql
```

**What this does:**
- Drops all old organization-based policies
- Creates new simplified policies that use `auth.uid()` instead of `org_id`
- Grants proper permissions to authenticated users

## Policy Changes Summary

### Before (Organization-Based)
- Policies checked: `org_id IN (SELECT public.user_org_ids())`
- Access controlled by organization membership
- Complex role-based checks through memberships table

### After (User-Based)
- Policies check: `auth.role() = 'authenticated'` or `user_id = auth.uid()`
- Access controlled by user authentication status
- Simplified permissions - all authenticated users can access most resources

## Key Policy Changes

### Sales Agents
- **Before**: Only org members could view agents
- **After**: All authenticated users can view/create/update agents

### Daily Logs
- **Before**: Only org members could view logs
- **After**: All authenticated users can view logs, agents can manage their own

### Break-Even Records
- **Before**: Only org members with specific roles could view
- **After**: All authenticated users can view, users can delete their own

### Notifications
- **Before**: Users could see org-wide notifications
- **After**: Users only see their own notifications

### System Logs (Audit)
- **Before**: Only owners/admins in orgs could view
- **After**: All authenticated users can view audit logs

## Verification

After running both scripts, verify the policies:

```sql
-- Check all policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;
```

## Troubleshooting

### Error: "policy already exists"
If you get this error, the old policies weren't dropped. The script includes `DROP POLICY IF EXISTS` statements, so it should handle this automatically. If issues persist, manually drop the conflicting policy first.

### Error: "column org_id does not exist"
This means the organization removal script ran successfully, but you're trying to run the old RLS script. Make sure you're running `rls-simplified-no-org.sql` (the new one).

### Error: "relation does not exist"
If you see errors about missing tables (like `organizations`, `memberships`), that's expected - they were removed. The RLS script handles this with `DROP POLICY IF EXISTS`.

### Policies not working
1. Check that RLS is enabled: `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';`
2. Verify user is authenticated: `SELECT auth.uid(), auth.role();`
3. Check policy definitions: `SELECT * FROM pg_policies WHERE tablename = 'your_table';`

## Security Considerations

⚠️ **Important Security Notes:**

1. **Broader Access**: The new policies are more permissive - all authenticated users can access most resources. If you need stricter access control, you'll need to implement it at the application level.

2. **User Privacy**: Users can now see all agents and logs, not just their organization's. Consider if this meets your privacy requirements.

3. **Audit Logs**: All authenticated users can view audit logs. Previously only owners/admins could. You may want to restrict this further if needed.

4. **Team Leaders**: The simplified policies don't have special team leader permissions. If you need team-based access control, you'll need to add it back using the `teams` table (if you keep it) or implement it in your application code.

## Customization

If you need stricter access control, you can modify the policies in `rls-simplified-no-org.sql`. For example:

- **Restrict agent access**: Only allow users to see agents they created
- **Restrict logs**: Only allow agents to see their own logs
- **Restrict audit logs**: Only allow specific user types (CEO, Team Leader) to view

You can add checks using `user_profiles` table:

```sql
-- Example: Only CEOs can view audit logs
CREATE POLICY "system_logs_select_ceo"
  ON public.system_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.user_id = auth.uid()
        AND up.user_type = 'ceo'
    )
  );
```

## Next Steps

After updating RLS policies:

1. ✅ Test your application thoroughly
2. ✅ Verify users can access their data
3. ✅ Check that unauthorized access is blocked
4. ✅ Update any application code that relied on organization context
5. ✅ Update your application's access control logic if needed

## Need Help?

If you encounter issues:
1. Check the error message carefully
2. Verify you ran the scripts in the correct order
3. Check that the database migration completed successfully
4. Review the policy definitions for typos

