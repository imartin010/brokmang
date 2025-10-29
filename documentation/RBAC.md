# 🔐 Role-Based Access Control (RBAC) - Brokmang. v1.1

## Overview

Brokmang. v1.1 implements a comprehensive role-based access control system with five distinct roles, 40+ granular permissions, and database-level security enforcement through Supabase Row-Level Security (RLS) policies.

**Security Philosophy:** Security enforced at the database level first, with application-level checks as secondary validation.

---

## 🎭 Roles

### Role Hierarchy
```
OWNER (Level 100)
  ├── Full organizational control
  ├── Cannot be removed by others
  └── Can manage all roles

ADMIN (Level 80)
  ├── Organizational management
  ├── Can manage TEAM_LEADER, ACCOUNTANT, AGENT
  └── Cannot change owner

TEAM_LEADER (Level 60)
  ├── Team management
  ├── Manage own team's agents
  └── View-only for org settings

ACCOUNTANT (Level 40)
  ├── Financial access
  ├── Read/write finance settings
  └── Generate reports

AGENT (Level 20)
  ├── Limited access
  ├── Manage own daily logs
  └── View own performance
```

---

## 🎯 Role Descriptions

### 1. OWNER
**Who:** Organization founder/creator

**Capabilities:**
- Full control over organization
- Manage all members (invite, remove, change roles)
- Configure branding (logo, colors)
- Delete organization
- Manage API tokens
- View audit logs
- All ADMIN capabilities

**Restrictions:**
- Cannot be removed by other members
- Cannot transfer ownership (current implementation)

**Use Cases:**
- CEO / Founder
- Business owner
- Primary decision maker

---

### 2. ADMIN
**Who:** Senior managers, operations leads

**Capabilities:**
- Manage organization settings
- Invite and remove members (except owner)
- Change roles (TEAM_LEADER, ACCOUNTANT, AGENT only)
- Create/edit branches, teams, agents
- Configure KPI & finance settings
- Generate and export reports
- Manage API tokens
- View audit logs
- All TEAM_LEADER capabilities

**Restrictions:**
- Cannot delete organization
- Cannot change owner's role
- Cannot remove owner

**Use Cases:**
- General Manager
- Operations Director
- Senior Administrator

---

### 3. TEAM_LEADER
**Who:** Sales team managers

**Capabilities:**
- View organization structure
- Manage own team (edit team settings)
- Create/edit agents in own team
- Create/update daily logs for team members
- View KPI & finance settings (read-only)
- Generate reports for own team
- View team performance

**Restrictions:**
- Cannot create/edit other teams
- Cannot manage finance settings
- Cannot invite members
- Cannot view audit logs
- Cannot manage API tokens

**Use Cases:**
- Sales Team Leader
- Regional Manager
- Team Supervisor

---

### 4. ACCOUNTANT
**Who:** Financial managers

**Capabilities:**
- View all organization data (read-only)
- Read/write finance settings
- Read/write KPI settings
- Generate and export all reports
- View branches, teams, agents (read-only)
- View daily logs and scores (read-only)

**Restrictions:**
- Cannot create/edit agents, teams, branches
- Cannot create daily logs
- Cannot manage members
- Cannot view audit logs
- Cannot manage API tokens

**Use Cases:**
- Financial Controller
- Accountant
- Finance Manager

---

### 5. AGENT
**Who:** Individual sales representatives

**Capabilities:**
- Create/edit own daily logs
- View own performance data
- View own reports

**Restrictions:**
- Cannot view other agents' data
- Cannot edit organization settings
- Cannot manage any resources
- No access to reports, audit logs, settings

**Use Cases:**
- Sales Agent
- Sales Representative
- Individual Contributor

---

## 🔑 Permissions Matrix

### Organization Permissions

| Permission | OWNER | ADMIN | TEAM_LEADER | ACCOUNTANT | AGENT |
|-----------|-------|-------|-------------|------------|-------|
| `org:read` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `org:update` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `org:delete` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `org:manage_members` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `org:manage_branding` | ✅ | ❌ | ❌ | ❌ | ❌ |

### Branches Permissions

| Permission | OWNER | ADMIN | TEAM_LEADER | ACCOUNTANT | AGENT |
|-----------|-------|-------|-------------|------------|-------|
| `branches:read` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `branches:create` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `branches:update` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `branches:delete` | ✅ | ✅ | ❌ | ❌ | ❌ |

### Teams Permissions

| Permission | OWNER | ADMIN | TEAM_LEADER | ACCOUNTANT | AGENT |
|-----------|-------|-------|-------------|------------|-------|
| `teams:read` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `teams:create` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `teams:update` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `teams:delete` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `teams:manage_own` | ✅ | ✅ | ✅ | ❌ | ❌ |

### Agents Permissions

| Permission | OWNER | ADMIN | TEAM_LEADER | ACCOUNTANT | AGENT |
|-----------|-------|-------|-------------|------------|-------|
| `agents:read` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `agents:create` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `agents:update` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `agents:delete` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `agents:manage_own_team` | ✅ | ✅ | ✅ | ❌ | ❌ |

### Daily Logs Permissions

| Permission | OWNER | ADMIN | TEAM_LEADER | ACCOUNTANT | AGENT |
|-----------|-------|-------|-------------|------------|-------|
| `logs:read` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `logs:create` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `logs:update` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `logs:delete` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `logs:create_own` | ✅ | ✅ | ✅ | ❌ | ✅ |
| `logs:read_own` | ✅ | ✅ | ✅ | ❌ | ✅ |

### Finance & Settings Permissions

| Permission | OWNER | ADMIN | TEAM_LEADER | ACCOUNTANT | AGENT |
|-----------|-------|-------|-------------|------------|-------|
| `kpi_settings:read` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `kpi_settings:update` | ✅ | ✅ | ❌ | ✅ | ❌ |
| `finance:read` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `finance:update` | ✅ | ✅ | ❌ | ✅ | ❌ |

### Reports & Insights Permissions

| Permission | OWNER | ADMIN | TEAM_LEADER | ACCOUNTANT | AGENT |
|-----------|-------|-------|-------------|------------|-------|
| `reports:read` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `reports:generate` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `reports:export` | ✅ | ✅ | ❌ | ✅ | ❌ |

### System Permissions

| Permission | OWNER | ADMIN | TEAM_LEADER | ACCOUNTANT | AGENT |
|-----------|-------|-------|-------------|------------|-------|
| `notifications:read_own` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `notifications:manage` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `audit:read` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `api_tokens:read` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `api_tokens:manage` | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## 🗄️ Database RLS Policies

### Policy Pattern

All tables follow this pattern:
```sql
-- Example: sales_agents table
CREATE POLICY "agents_select_org_member"
  ON public.sales_agents FOR SELECT
  USING (
    org_id IN (SELECT auth.user_org_ids())
  );
```

**Key Components:**
1. **Org Isolation:** Check `org_id` matches user's membership
2. **Role Check:** Validate user's role via helper function
3. **Resource Ownership:** Additional checks for owned resources (e.g., own logs)

### Helper Functions

#### `auth.user_org_ids()`
Returns all organization IDs the current user belongs to.

```sql
CREATE FUNCTION auth.user_org_ids()
RETURNS SETOF UUID AS $$
  SELECT org_id FROM public.memberships WHERE user_id = auth.uid();
$$ LANGUAGE SQL STABLE;
```

#### `get_user_role_in_org(user_id, org_id)`
Returns user's role in specific organization.

```sql
SELECT get_user_role_in_org(auth.uid(), 'org-uuid-here');
-- Returns: 'OWNER' | 'ADMIN' | 'TEAM_LEADER' | 'ACCOUNTANT' | 'AGENT' | NULL
```

#### `user_has_org_permission(user_id, org_id, required_role)`
Checks if user has at least the required role level.

```sql
SELECT user_has_org_permission(auth.uid(), 'org-uuid', 'ADMIN');
-- Returns: TRUE if user is OWNER or ADMIN
```

### Policy Examples

#### 1. Read Access (Org Members)
```sql
CREATE POLICY "branches_select_org_member"
  ON public.branches FOR SELECT
  USING (
    org_id IN (SELECT auth.user_org_ids())
  );
```
**Effect:** All org members can view branches in their orgs.

#### 2. Write Access (Managers Only)
```sql
CREATE POLICY "branches_insert_owner_admin"
  ON public.branches FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.org_id = org_id
        AND m.user_id = auth.uid()
        AND m.role IN ('OWNER', 'ADMIN')
    )
  );
```
**Effect:** Only OWNER and ADMIN can create branches.

#### 3. Own Resource Access (Agents)
```sql
CREATE POLICY "daily_logs_insert_agent_manager"
  ON public.agent_daily_logs FOR INSERT
  WITH CHECK (
    -- Managers can insert any
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.org_id = org_id
        AND m.user_id = auth.uid()
        AND m.role IN ('OWNER', 'ADMIN', 'TEAM_LEADER')
    )
    OR
    -- Agents can insert their own
    EXISTS (
      SELECT 1 FROM public.sales_agents sa
      WHERE sa.id = agent_id
        AND sa.user_ref = auth.uid()
        AND sa.org_id = org_id
    )
  );
```
**Effect:** Managers can create any log; agents can create only their own.

#### 4. Service Role Only
```sql
CREATE POLICY "monthly_scores_insert_service_role"
  ON public.agent_monthly_scores FOR INSERT
  WITH CHECK (auth.role() = 'service_role');
```
**Effect:** Only system (Edge Functions) can insert monthly scores.

#### 5. Append-Only (Audit Logs)
```sql
-- Insert policy
CREATE POLICY "system_logs_insert_authenticated"
  ON public.system_logs FOR INSERT
  WITH CHECK (auth.role() IN ('authenticated', 'service_role'));

-- No update or delete policies
```
**Effect:** Anyone can append to audit log, but cannot modify or delete entries.

---

## 🔧 Implementation Guide

### Frontend Usage

#### Check Permission in Component
```typescript
import { hasPermission } from '@/lib/rbac';
import { useAuth } from '@/lib/zustand/authSlice';

function AgentForm() {
  const { userRole } = useAuth();
  
  const canCreateAgent = hasPermission(userRole, 'agents:create');
  
  if (!canCreateAgent) {
    return <div>You don't have permission to create agents.</div>;
  }
  
  return <form>...</form>;
}
```

#### Role-Based UI Rendering
```typescript
import { hasRoleLevel } from '@/lib/rbac';

function Navbar() {
  const { userRole } = useAuth();
  
  return (
    <nav>
      <Link href="/crm/sales">Agents</Link>
      {hasRoleLevel(userRole, 'ADMIN') && (
        <Link href="/org/settings">Org Settings</Link>
      )}
      {hasRoleLevel(userRole, 'OWNER') && (
        <Link href="/audit">Audit Logs</Link>
      )}
    </nav>
  );
}
```

### Backend Usage (API Routes)

#### Validate Permission
```typescript
import { requirePermissions } from '@/lib/rbac';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  // Get user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });
  
  // Get user's role in org
  const { data: membership } = await supabase
    .from('memberships')
    .select('role')
    .eq('user_id', user.id)
    .eq('org_id', orgId)
    .single();
  
  if (!membership) return new Response('Not a member', { status: 403 });
  
  // Validate permission
  try {
    requirePermissions(membership.role, ['agents:create']);
  } catch (error) {
    return new Response(error.message, { status: 403 });
  }
  
  // Proceed with creation...
}
```

#### Role-Based Data Filtering
```typescript
import { hasPermission } from '@/lib/rbac';

export async function GET(request: Request) {
  // ... auth checks ...
  
  let query = supabase
    .from('agent_daily_logs')
    .select('*')
    .eq('org_id', orgId);
  
  // Agents can only see their own logs
  if (membership.role === 'AGENT') {
    const { data: agent } = await supabase
      .from('sales_agents')
      .select('id')
      .eq('user_ref', user.id)
      .single();
    
    if (agent) {
      query = query.eq('agent_id', agent.id);
    }
  }
  // Managers see all logs (no additional filtering)
  
  const { data, error } = await query;
  // ...
}
```

---

## 📋 Common Scenarios

### Scenario 1: Owner Invites Admin
```typescript
// Owner action
const membership = {
  org_id: currentOrgId,
  user_id: newUserId,
  role: 'ADMIN'
};

// RLS Policy Check:
// ✅ user is OWNER of org (can manage members)
// ✅ target role is ADMIN (OWNER can assign ADMIN)
```

### Scenario 2: Admin Tries to Invite OWNER
```typescript
// Admin action
const membership = {
  org_id: currentOrgId,
  user_id: newUserId,
  role: 'OWNER' // ❌ INVALID
};

// Application Logic:
const canManage = canManageRole('ADMIN', 'OWNER');
// Returns FALSE → throws error

// Admin cannot create another OWNER
```

### Scenario 3: Team Leader Creates Agent in Own Team
```typescript
// Team Leader action
const agent = {
  org_id: currentOrgId,
  team_id: myTeamId,
  full_name: 'John Doe',
  role: 'AGENT'
};

// RLS Policy Check:
// ✅ user is TEAM_LEADER in org
// ✅ team_id is user's own team
// ✅ agent role is AGENT (not TEAM_LEADER)
```

### Scenario 4: Agent Tries to View Other Agent's Logs
```typescript
// Agent action
const { data } = await supabase
  .from('agent_daily_logs')
  .select('*')
  .eq('org_id', currentOrgId);

// RLS Policy:
// ✅ org_id matches (org isolation)
// ❌ agent_id doesn't match current user's agent record
// Result: Empty array (no access)
```

### Scenario 5: Accountant Updates Finance Settings
```typescript
// Accountant action
const update = {
  rent_per_seat: 5000,
  salary_per_seat: 8500
};

await supabase
  .from('org_finance_settings')
  .update(update)
  .eq('org_id', currentOrgId);

// RLS Policy Check:
// ✅ user is ACCOUNTANT (has finance:update permission)
// ✅ org_id matches
// Result: SUCCESS
```

---

## 🧪 Testing RBAC

### Manual Testing Checklist

#### 1. Organization Access
- [ ] OWNER can view/edit org
- [ ] ADMIN can view/edit org
- [ ] ADMIN cannot delete org
- [ ] TEAM_LEADER can view org (read-only)
- [ ] ACCOUNTANT can view org (read-only)
- [ ] AGENT cannot view org

#### 2. Member Management
- [ ] OWNER can invite all roles
- [ ] ADMIN can invite TL, ACCOUNTANT, AGENT
- [ ] ADMIN cannot invite ADMIN or OWNER
- [ ] TL, ACCOUNTANT, AGENT cannot invite anyone

#### 3. Branch/Team Management
- [ ] OWNER/ADMIN can create/edit/delete branches
- [ ] OWNER/ADMIN can create/edit/delete teams
- [ ] TEAM_LEADER can edit own team only
- [ ] ACCOUNTANT cannot create branches/teams
- [ ] AGENT cannot access branches/teams

#### 4. Agent Management
- [ ] OWNER/ADMIN can create/edit any agent
- [ ] TEAM_LEADER can create agents in own team
- [ ] TEAM_LEADER can edit agents in own team
- [ ] ACCOUNTANT can view agents (read-only)
- [ ] AGENT cannot access agent management

#### 5. Daily Logs
- [ ] Managers can create logs for any agent
- [ ] AGENT can create own logs only
- [ ] AGENT cannot view other agents' logs
- [ ] All managers can view all logs
- [ ] ACCOUNTANT can view logs (read-only)

#### 6. Finance Settings
- [ ] OWNER/ADMIN/ACCOUNTANT can edit finance settings
- [ ] TEAM_LEADER can view finance settings (read-only)
- [ ] AGENT cannot access finance settings

#### 7. Reports
- [ ] All roles can view reports
- [ ] AGENT sees own reports only
- [ ] TEAM_LEADER sees team reports
- [ ] Managers see all reports
- [ ] OWNER/ADMIN/ACCOUNTANT can export

#### 8. Audit Logs
- [ ] OWNER/ADMIN can view audit logs
- [ ] TL, ACCOUNTANT, AGENT cannot view audit logs

#### 9. API Tokens
- [ ] OWNER/ADMIN can create/manage tokens
- [ ] TL, ACCOUNTANT, AGENT cannot access tokens

### Automated Tests

```typescript
// Example Jest test
describe('RBAC', () => {
  describe('hasPermission', () => {
    it('OWNER has all permissions', () => {
      expect(hasPermission('OWNER', 'org:delete')).toBe(true);
      expect(hasPermission('OWNER', 'agents:create')).toBe(true);
    });
    
    it('AGENT has limited permissions', () => {
      expect(hasPermission('AGENT', 'logs:create_own')).toBe(true);
      expect(hasPermission('AGENT', 'logs:create')).toBe(false);
      expect(hasPermission('AGENT', 'agents:create')).toBe(false);
    });
    
    it('TEAM_LEADER can manage own team', () => {
      expect(hasPermission('TEAM_LEADER', 'teams:manage_own')).toBe(true);
      expect(hasPermission('TEAM_LEADER', 'teams:delete')).toBe(false);
    });
  });
  
  describe('canManageRole', () => {
    it('OWNER can manage all roles', () => {
      expect(canManageRole('OWNER', 'ADMIN')).toBe(true);
      expect(canManageRole('OWNER', 'AGENT')).toBe(true);
    });
    
    it('ADMIN cannot manage OWNER', () => {
      expect(canManageRole('ADMIN', 'OWNER')).toBe(false);
      expect(canManageRole('ADMIN', 'AGENT')).toBe(true);
    });
  });
});
```

---

## 🚨 Security Best Practices

### 1. Always Enforce at Database Level
```sql
-- ❌ BAD: Only application-level check
if (userRole !== 'OWNER') throw new Error('Unauthorized');

-- ✅ GOOD: RLS policy at database level
CREATE POLICY "..." ON table USING (org_id IN (SELECT auth.user_org_ids()));
```

### 2. Validate Org Context
```typescript
// ✅ Always check org membership
const { data: membership } = await supabase
  .from('memberships')
  .select('role')
  .eq('user_id', userId)
  .eq('org_id', orgId)
  .single();

if (!membership) throw new Error('Not a member of this organization');
```

### 3. Use Service Role Sparingly
```typescript
// ❌ BAD: Using service role for user operations
const supabase = createClient(url, SERVICE_ROLE_KEY);

// ✅ GOOD: Use authenticated client, let RLS handle it
const supabase = createServerClient(request);
```

### 4. Audit All Privilege Escalations
```typescript
// ✅ Log when roles are changed
await auditLog({
  action: 'ROLE_CHANGED',
  entity: 'memberships',
  entity_id: membershipId,
  diff: {
    before: { role: 'AGENT' },
    after: { role: 'TEAM_LEADER' }
  }
});
```

### 5. Test with Different Roles
```typescript
// ✅ Integration tests for each role
describe('Agent API', () => {
  it('as OWNER', async () => { /* ... */ });
  it('as ADMIN', async () => { /* ... */ });
  it('as TEAM_LEADER', async () => { /* ... */ });
  it('as ACCOUNTANT', async () => { /* ... */ });
  it('as AGENT', async () => { /* ... */ });
});
```

---

## 📚 Additional Resources

- **RLS Policies:** `supabase/rls-v1_1.sql`
- **RBAC Utilities:** `lib/rbac.ts`
- **Membership Management:** `/org/settings/members`
- **Audit Logs:** `/audit` (OWNER/ADMIN only)

---

**Version:** 1.0  
**Last Updated:** January 2025  
**Status:** Foundation Complete


