# 🎯 Agents Role & Team Leader System - Complete Guide

## 📋 Overview

Your Agents module now supports **roles** (Agent vs Team Leader) and **team assignments**. Each agent can be assigned to a team leader for better organization and management.

---

## 🚀 Quick Start

### Step 1: Run the Database Migration

**IMPORTANT**: Run this SQL script in your Supabase SQL Editor first!

```sql
-- File: supabase/migration-add-role-and-team-leader.sql

-- Step 1: Add role column
ALTER TABLE public.sales_agents 
ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'agent' 
CHECK (role IN ('agent', 'team_leader'));

-- Step 2: Add team_leader_id column
ALTER TABLE public.sales_agents 
ADD COLUMN IF NOT EXISTS team_leader_id uuid REFERENCES public.sales_agents(id) ON DELETE SET NULL;

-- Step 3: Create index for performance
CREATE INDEX IF NOT EXISTS idx_sales_agents_team_leader_id ON public.sales_agents(team_leader_id);

-- Step 4: Update existing agents to have default role
UPDATE public.sales_agents SET role = 'agent' WHERE role IS NULL;
```

### Step 2: Test the Feature

1. **Go to Agents → Team**
2. **Create a Team Leader first**
   - Click "Add Agent"
   - Fill in name, phone
   - Select **Role: Team Leader**
   - Click Create
3. **Create Agents and assign them to the Team Leader**
   - Click "Add Agent" again
   - Fill in name, phone
   - Select **Role: Agent**
   - Select your Team Leader from the dropdown
   - Click Create

---

## ✨ Features

### 1. **Two Roles**

#### 👑 Team Leader
- Managers who oversee agents
- Shown with a **crown icon** (👑) in the table
- Can have multiple agents assigned to them
- Don't need a team leader themselves

#### 👤 Agent
- Regular sales agents
- Shown with a **user icon** (👤) in the table
- Can be assigned to a team leader (optional)
- Reports to their team leader

### 2. **Team Hierarchy**

- **Agents** can be assigned to a **Team Leader**
- Team Leader dropdown shows only active team leaders
- Team Leader column in table shows who each agent reports to
- If no team leader assigned, shows "—"

### 3. **Smart Form Behavior**

- When **Role = Agent** → Team Leader dropdown appears
- When **Role = Team Leader** → Team Leader dropdown hides
- Can't assign an agent to themselves
- Only active team leaders appear in the dropdown

---

## 📊 Updated Table Columns

The Agents table now shows:

| Name | Phone | Role | Team Leader | Status | Actions |
|------|-------|------|-------------|--------|---------|
| John Doe | +20... | 👑 Team Leader | — | ✅ Active | Edit Delete |
| Jane Smith | +20... | 👤 Agent | John Doe | ✅ Active | Edit Delete |

---

## 🎨 Visual Indicators

### Role Badges

- **Team Leader**: 👑 Crown icon + Amber/Gold color
- **Agent**: 👤 User icon + Blue color

### Team Leader Info

- Shows 👥 Users icon + Team Leader name
- If no team leader: shows "—"

---

## 🔧 Technical Details

### Database Schema

```sql
-- New columns added to sales_agents table
role text NOT NULL DEFAULT 'agent' 
  CHECK (role IN ('agent', 'team_leader'))
  
team_leader_id uuid REFERENCES sales_agents(id) 
  ON DELETE SET NULL
```

### TypeScript Types

```typescript
export type SalesAgent = {
  id: string;
  user_id: string;
  full_name: string;
  phone?: string | null;
  role: 'agent' | 'team_leader';           // ✨ NEW
  team_leader_id?: string | null;          // ✨ NEW
  team_id?: string | null;                 // deprecated
  is_active: boolean;
  created_at: string;
};
```

### Component Updates

**Updated Files:**
- ✅ `lib/types.ts` - Added role and team_leader_id
- ✅ `components/crm/agent-form-dialog.tsx` - Added role selector and team leader dropdown
- ✅ `components/crm/agents-table.tsx` - Added role and team leader columns
- ✅ `app/crm/sales/page.tsx` - Passes team leaders to form

---

## 📝 Usage Examples

### Example 1: Create a Team Leader

```
Name: Sarah Johnson
Phone: +20 100 123 4567
Role: Team Leader ← Select this
Team Leader: (hidden because she's a team leader)
Status: ✅ Active
```

### Example 2: Create an Agent under Sarah

```
Name: Mike Peters
Phone: +20 100 987 6543
Role: Agent ← Select this
Team Leader: Sarah Johnson ← Select from dropdown
Status: ✅ Active
```

### Example 3: Agent without Team Leader

```
Name: Lisa Chen
Phone: +20 100 555 1234
Role: Agent ← Select this
Team Leader: No team leader ← Select this option
Status: ✅ Active
```

---

## 🔍 Filtering & Search

The search and filter functionality works with all fields including role:

- Search by **name**, **phone**, or **role**
- Filter by **status** (All / Active / Inactive)
- Team Leaders and Agents appear in the same table

---

## ⚠️ Important Notes

### 1. **Migration is Required**
Run the SQL migration **before** using the new features. Existing agents will default to role "agent".

### 2. **Deleting Team Leaders**
If you delete a team leader, their agents will have `team_leader_id` set to `NULL` automatically (no data loss).

### 3. **Editing Roles**
You can change an agent's role from Agent to Team Leader and vice versa. The form automatically adjusts.

### 4. **Team Leader Dropdown**
Only shows **active** team leaders. If you deactivate a team leader, they won't appear in the dropdown for new agent assignments (but existing assignments remain).

---

## 🎯 Best Practices

### 1. **Create Team Leaders First**
Before adding agents, create at least one team leader so agents can be assigned properly.

### 2. **Use Meaningful Names**
Name team leaders clearly (e.g., "Sarah Johnson - Team A Lead") for easy identification.

### 3. **Keep Team Leaders Active**
Don't deactivate team leaders unless you're restructuring teams.

### 4. **Review Assignments Regularly**
Check the table to ensure all agents have the correct team leader assigned.

---

## 📈 Future Enhancements

Potential features to add:

- **Team-based filtering**: Filter agents by team leader
- **Team performance reports**: Aggregate KPIs by team
- **Team leader dashboard**: See all agents under each team leader
- **Team hierarchy view**: Visual org chart
- **Bulk assignment**: Assign multiple agents to a team leader at once

---

## 🆘 Troubleshooting

### Problem: "Team Leader dropdown is empty"

**Solution**: Create a team leader first. The dropdown only shows users with role "Team Leader".

### Problem: "Can't save agent with team leader"

**Solution**: Make sure you've run the database migration. Check Supabase SQL Editor for errors.

### Problem: "Existing agents don't have roles"

**Solution**: Run this SQL to update existing agents:

```sql
UPDATE public.sales_agents 
SET role = 'agent' 
WHERE role IS NULL;
```

### Problem: "Team leader shows as '—' in table"

**Solution**: The team_leader_id might be referencing a deleted or non-existent agent. Edit the agent and reassign to an active team leader.

---

## ✅ Migration Checklist

- [ ] Run `migration-add-role-and-team-leader.sql` in Supabase SQL Editor
- [ ] Refresh your application
- [ ] Create a test team leader
- [ ] Create a test agent assigned to that team leader
- [ ] Verify the table shows role and team leader correctly
- [ ] Test editing agents (changing role, changing team leader)
- [ ] Test deleting a team leader (agents should remain, team_leader_id becomes null)

---

## 🎉 That's It!

Your Agents module now has a full role and team hierarchy system! 

**Questions or issues?** Check the console for errors or inspect the Supabase table directly.

