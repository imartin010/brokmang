# 📋 CHANGELOG - Brokmang. v1.1

## Version 1.1.0 - Phase-2: Multi-Tenant Enterprise Edition

**Release Date:** TBD (In Development)  
**Status:** 🚧 Foundation Complete, Features In Progress

---

## 🎯 Overview

Phase-2 transforms Brokmang. from a single-user SaaS into a comprehensive multi-tenant enterprise platform with role-based access control, onboarding wizard, notifications, reports, insights, and public API.

### Key Goals
1. **Multi-Tenancy:** Organizations → Branches → Teams → Agents hierarchy
2. **RBAC:** Five roles with granular permissions
3. **Onboarding:** Guided wizard for first-time setup
4. **Notifications:** Smart alerts and reminders
5. **Reports:** PDF export with custom templates
6. **Insights:** AI-powered performance analytics
7. **Audit:** Immutable action trail
8. **Branding:** Custom logo and colors per org
9. **Public API:** Token-based external integrations
10. **Testing:** Automated test suite

---

## 🗄️ DATABASE CHANGES

### New Tables

#### 1. `organizations` ✅
Multi-tenant parent entity.

**Columns:**
- `id` - UUID primary key
- `name` - Organization name (2-100 chars)
- `slug` - Unique URL-friendly identifier
- `branding` - JSONB: {logoUrl, primaryColor, secondaryColor}
- `settings` - JSONB: {twoFA, currency, timezone}
- `owner_id` - References auth.users(id)
- `created_at`, `updated_at`

**Indexes:**
- `owner_id`
- `slug` (unique)

**Triggers:**
- Auto-create owner membership on insert
- Auto-create finance settings on insert

#### 2. `memberships` ✅
User-to-organization mapping with roles.

**Columns:**
- `id` - UUID primary key
- `org_id` - References organizations(id)
- `user_id` - References auth.users(id)
- `role` - Enum: OWNER, ADMIN, TEAM_LEADER, ACCOUNTANT, AGENT
- `created_at`, `updated_at`

**Constraints:**
- Unique(org_id, user_id)

#### 3. `branches` ✅
Physical office locations.

**Columns:**
- `id` - UUID primary key
- `org_id` - References organizations(id)
- `name` - Branch name
- `address` - Optional address
- `meta` - JSONB for additional data
- `is_active` - Boolean flag
- `created_at`, `updated_at`

#### 4. `teams` ✅
Sales teams within branches.

**Columns:**
- `id` - UUID primary key
- `org_id` - References organizations(id)
- `branch_id` - References branches(id) (nullable)
- `name` - Team name
- `team_leader_id` - References sales_agents(id) (nullable)
- `is_active` - Boolean flag
- `created_at`, `updated_at`

#### 5. `org_finance_settings` ✅
Organization-level financial configuration.

**Columns:**
- `id` - UUID primary key
- `org_id` - References organizations(id) (unique)
- `rent_per_seat`, `salary_per_seat`, `marketing_per_seat`, `tl_share_per_seat`, `others_per_seat`, `sim_per_seat` - Numeric costs
- `owner_salary` - Numeric
- `gross_rate` - Numeric (default 0.0400)
- `agent_comm_per_1m`, `tl_comm_per_1m` - Numeric commissions
- `taxes` - JSONB: {withholding, vat, income_min, income_max, income_current}
- `created_at`, `updated_at`

#### 6. `notifications` ✅
In-app notification system.

**Columns:**
- `id` - UUID primary key
- `org_id` - References organizations(id)
- `user_id` - References auth.users(id) (nullable for org-wide)
- `type` - Enum: MISSED_LOG, KPI_ALERT, TAX_REMINDER, SYSTEM, BREAK_EVEN_WARNING
- `title` - Notification title
- `message` - Notification body
- `payload` - JSONB additional data
- `is_read` - Boolean flag
- `action_url` - Optional link
- `created_at`

**Indexes:**
- `(org_id, user_id)`
- `(org_id, user_id, is_read)` where `is_read = FALSE`

#### 7. `system_logs` ✅
Immutable audit trail.

**Columns:**
- `id` - BIGSERIAL primary key
- `org_id` - UUID
- `user_id` - UUID (nullable)
- `action` - Text (e.g., 'AGENT_CREATED')
- `entity` - Text (table/entity name)
- `entity_id` - Text
- `diff` - JSONB: {before, after}
- `metadata` - JSONB
- `ip_address` - INET
- `user_agent` - Text
- `created_at`

**Indexes:**
- `(org_id, created_at DESC)`

**Note:** Append-only (no update/delete policies)

#### 8. `api_tokens` ✅
Organization API tokens for public API.

**Columns:**
- `id` - UUID primary key
- `org_id` - References organizations(id)
- `name` - Token name
- `token_hash` - Bcrypt hash (plain shown once)
- `scopes` - Text[] (e.g., ['reports:read', 'performance:read'])
- `last_used_at` - Nullable timestamp
- `expires_at` - Nullable timestamp
- `is_active` - Boolean flag
- `created_by` - References auth.users(id)
- `created_at`

#### 9. `onboarding_state` ✅
Track first-time user onboarding.

**Columns:**
- `id` - UUID primary key
- `user_id` - References auth.users(id) (unique)
- `org_id` - References organizations(id) (nullable)
- `current_step` - Text (default 'organization')
- `completed_steps` - Text[]
- `is_completed` - Boolean flag
- `data` - JSONB (draft data)
- `created_at`, `updated_at`

### Modified Tables

#### `sales_agents` ✅
Added multi-tenant columns:
- `org_id` - References organizations(id)
- `branch_id` - References branches(id)
- `team_id` - References teams(id) (replaces team_leader_id)
- `user_ref` - References auth.users(id) (optional account link)

**Migration Note:** Old `team_leader_id` column removed; hierarchy now managed via `teams` table.

#### `agent_kpi_settings` ✅
Added:
- `org_id` - References organizations(id)

#### `agent_daily_logs` ✅
Added:
- `org_id` - References organizations(id)

#### `agent_monthly_scores` ✅
Added:
- `org_id` - References organizations(id)

#### `break_even_records` ✅
Added:
- `org_id` - References organizations(id)

---

## 🔒 SECURITY & RLS

### Enabled RLS on All Tables ✅
All new and existing tables now have Row-Level Security enabled.

### Policy Pattern ✅
- **Org Isolation:** All policies check `org_id IN (SELECT auth.user_org_ids())`
- **Role-Based:** Policies respect role hierarchy (OWNER > ADMIN > TEAM_LEADER > ACCOUNTANT > AGENT)
- **Service Role:** System operations (monthly scores, notifications) use service role
- **Append-Only:** Audit logs cannot be updated or deleted

### Key Policies
- **organizations:** Select by membership, update by owner
- **memberships:** Managed by owner/admin
- **branches/teams:** Managed by owner/admin
- **sales_agents:** All members view, managers create/update
- **daily_logs:** Agents create own, managers create any
- **monthly_scores:** Service role only (read-only for users)
- **notifications:** Users read own + org-wide
- **audit_logs:** Owner/admin read-only, all can append

See `supabase/rls-v1_1.sql` for complete policies.

---

## 🎨 FRONTEND CHANGES

### New Routes (To Be Implemented)

#### `/onboarding` 🔴
7-step wizard for first-time setup:
1. Organization details
2. Branches
3. Teams
4. Agents
5. KPI settings
6. Finance settings
7. Review & confirm

#### `/org` 🔴
- Org switcher dropdown
- Settings (General, Branding, Security, Members)
- Logo upload
- Color customization
- 2FA toggle
- Member management

#### `/notifications` 🔴
- Notification center (page & dropdown)
- Tabs: All, Alerts, System
- Mark as read/unread
- Pagination
- Realtime updates

#### `/reports` 🔴
- Report template cards
- Generate PDF modal
- Report history
- Download/email options

#### `/insights` 🔴
- Smart insights cards
- Performance drop detection
- Break-even warnings
- Top performers
- Action links

#### `/audit` 🔴
Owner/admin only:
- Audit log table
- Filter by user, entity, date
- Diff viewer
- CSV export

### Modified Routes

#### Existing CRM Routes
All `/crm/*` routes now org-scoped:
- `/crm/sales` - Team management
- `/crm/logs` - Daily logging
- `/crm/settings` - KPI config
- `/crm/report` - Performance

**Changes:**
- Load data filtered by current org
- Display org switcher in navbar
- Show only org-specific agents/teams

---

## 🧱 NEW COMPONENTS

### Core Components (To Be Implemented)

#### `components/org-switcher.tsx` 🔴
Dropdown to switch between user's orgs.

#### `components/org-settings/branding-form.tsx` 🔴
Upload logo, pick colors.

#### `components/org-settings/member-manager.tsx` 🔴
Invite, remove, change roles.

#### `components/notifications/notification-center.tsx` 🔴
Dropdown with recent notifications.

#### `components/notifications/notification-card.tsx` 🔴
Individual notification display.

#### `components/reports/report-template-card.tsx` 🔴
Report template selector.

#### `components/reports/report-history.tsx` 🔴
List of generated reports.

#### `components/insights/insight-card.tsx` 🔴
Smart insight display with confidence score.

#### `components/onboarding/step-indicator.tsx` 🔴
Progress bar for wizard.

#### `components/onboarding/organization-form.tsx` 🔴
Step 1 form.

#### `components/onboarding/branches-form.tsx` 🔴
Multi-entry form for branches.

(And more...)

---

## 🔧 NEW UTILITIES

### `lib/rbac.ts` ✅
Role-based access control utilities.

**Functions:**
- `hasPermission(role, permission)` - Check specific permission
- `hasRoleLevel(role, requiredRole)` - Check hierarchy
- `canManageRole(managerRole, targetRole)` - Validate role management
- `requirePermissions(role, permissions[])` - Throw if unauthorized
- `canAccessResource(context, resource, permission)` - Resource validation

**Permissions:** 40+ granular permissions defined

### `lib/zustand/*` 🔴
State management slices (to be implemented):
- `authSlice.ts` - User & org context
- `orgSlice.ts` - Current org, list
- `onboardingSlice.ts` - Wizard state
- `notificationsSlice.ts` - Notifications
- `reportsSlice.ts` - Report history
- `insightsSlice.ts` - Cached insights

### `lib/sentry.ts` 🔴
Error tracking integration (to be implemented).

### `lib/audit-logger.ts` 🔴
Audit log wrapper for mutations (to be implemented).

---

## 🌐 API CHANGES

### New Internal Routes (To Be Implemented)

#### `POST /api/internal/notify` 🔴
Create notifications.

**Body:**
```json
{
  "org_id": "uuid",
  "user_id": "uuid", // optional
  "type": "MISSED_LOG",
  "title": "string",
  "message": "string",
  "payload": {},
  "action_url": "string"
}
```

#### `POST /api/internal/audit` 🔴
Log audit entry.

**Body:**
```json
{
  "org_id": "uuid",
  "action": "AGENT_UPDATED",
  "entity": "sales_agents",
  "entity_id": "uuid",
  "diff": {"before": {}, "after": {}},
  "metadata": {}
}
```

#### `POST /api/internal/insights` 🔴
Compute insights for org.

**Body:**
```json
{
  "org_id": "uuid",
  "date_range": "last_60_days"
}
```

**Response:**
```json
{
  "insights": [
    {
      "type": "performance_drop",
      "title": "...",
      "confidence": 85,
      "reasons": ["...", "..."],
      "data": {}
    }
  ]
}
```

### New Public API Routes (To Be Implemented)

All require `X-Brokmang-Key` header with valid API token.

#### `GET /api/public/reports/:month` 🔴
Get report for specific month.

**Response:**
```json
{
  "success": true,
  "data": {
    "month": "2025-01",
    "template": "monthly_performance",
    "file_url": "https://...",
    "generated_at": "2025-01-28T..."
  }
}
```

#### `GET /api/public/agents/:id/performance` 🔴
Get agent performance data.

#### `GET /api/public/breakeven/current` 🔴
Get current break-even analysis.

---

## ⚡ EDGE FUNCTIONS

### `generate_pdf_report` 🔴
Generate PDF reports from templates.

**Runtime:** Deno  
**Input:**
```typescript
{
  org_id: string;
  template: 'monthly_performance' | 'financial_summary' | 'team_report';
  month: string; // YYYY-MM
  filters?: {
    branch_id?: string;
    team_id?: string;
    agent_ids?: string[];
  };
}
```

**Output:**
- Uploads PDF to Supabase Storage: `reports/{org_id}/{yyyy-mm}/report_{timestamp}.pdf`
- Returns public URL

**Libraries:** react-pdf or puppeteer (Deno-compatible)

### `compute_insights` 🔴
Analyze performance data and generate insights.

**Runtime:** Deno  
**Input:**
```typescript
{
  org_id: string;
  date_range?: string; // default 'last_60_days'
}
```

**Logic:**
- Load last 60 days of logs & scores
- Detect performance drops (vs previous month)
- Identify underperformers (bottom 20%)
- Find break-even warnings (rolling trend)
- Highlight top performers (top 10%)
- Calculate confidence scores

**Output:**
```typescript
{
  insights: Insight[];
  generated_at: string;
}
```

### Scheduled Functions 🔴

#### `check_missed_logs` (Cron: 20:00 daily)
- Check agents missing today's log
- Create MISSED_LOG notifications

#### `monthly_tax_reminder` (Cron: 1st of month, 09:00)
- Create TAX_REMINDER notifications for accountants

---

## 🎨 DESIGN SYSTEM UPDATES

### Custom Branding 🔴
Organizations can customize:
- Logo (uploaded to Supabase Storage)
- Primary color (gradient start)
- Secondary color (gradient end)

**Implementation:**
```typescript
// Inject CSS vars from org.branding
:root {
  --color-primary: #257CFF; // or org custom
  --color-secondary: #F45A2A; // or org custom
}
```

**Fallback:** Default gradient (#257CFF → #F45A2A)

### Role Badge Colors ✅
```typescript
OWNER: 'from-purple-500 to-pink-500'
ADMIN: 'from-blue-500 to-cyan-500'
TEAM_LEADER: 'from-amber-500 to-orange-500'
ACCOUNTANT: 'from-green-500 to-emerald-500'
AGENT: 'from-gray-500 to-slate-500'
```

---

## 📦 DEPENDENCIES

### New Dependencies (To Be Installed)

```json
{
  "zustand": "^4.5.0",
  "@sentry/nextjs": "^7.100.0",
  "bcryptjs": "^2.4.3",
  "@types/bcryptjs": "^2.4.6",
  "date-fns": "^3.0.0",
  "react-pdf": "^7.7.0" // or puppeteer alternative
}
```

### Dev Dependencies

```json
{
  "jest": "^29.7.0",
  "@testing-library/react": "^14.1.2",
  "@testing-library/jest-dom": "^6.2.0",
  "@playwright/test": "^1.41.0"
}
```

---

## 🧪 TESTING

### Unit Tests (Jest) 🔴

**Coverage:**
- `lib/rbac.ts` - Permission checks, role hierarchy
- Break-even calculation functions
- KPI scoring algorithm
- Weight sum validation
- Date/time utilities

### E2E Tests (Playwright) 🔴

**Scenarios:**
1. **Onboarding Flow**
   - User signs up
   - Completes 7-step wizard
   - Creates org, branch, team, agent
   - Lands on dashboard

2. **Notifications**
   - Generate missed log notification
   - View in notification center
   - Mark as read
   - Navigate via action link

3. **Reports**
   - Generate monthly performance PDF
   - Download PDF
   - View in history

4. **Org Switcher**
   - User with multiple orgs
   - Switch between orgs
   - Verify data isolation

5. **Member Management**
   - Owner invites admin
   - Admin invites team leader
   - Team leader cannot invite admin (permission denied)

---

## 📚 DOCUMENTATION

### New Documentation Files

#### `CHANGELOG_1.1.md` ✅
This file - comprehensive changelog.

#### `PHASE2_PROGRESS.md` ✅
Implementation progress tracker.

#### `RBAC.md` 🔴
- Role descriptions
- Permission matrix
- Policy examples
- Use cases

#### `API_SURFACE.md` 🔴
- Public API endpoints
- Authentication
- Request/response examples
- Rate limiting
- Error codes

#### `ONBOARDING.md` 🔴
- User guide for onboarding wizard
- Step-by-step instructions
- Screenshots (TODO)

#### `NOTIFICATIONS.md` 🔴
- Notification types
- Trigger conditions
- Configuration

#### `REPORTS_GUIDE.md` 🔴
- Report templates
- Generation process
- Customization

#### `INSIGHTS_GUIDE.md` 🔴
- How insights work
- Confidence scores
- Interpretation

#### `MULTI_TENANT_GUIDE.md` 🔴
- Multi-tenancy concepts
- Organization structure
- Member management

#### `MIGRATION_V1_TO_V1.1.md` 🔴
- Upgrade instructions
- Data migration
- Breaking changes

---

## 🚀 DEPLOYMENT CHECKLIST

### Pre-Deployment

- [ ] Install dependencies (`npm install`)
- [ ] Update `.env.local` with Sentry DSN
- [ ] Configure Supabase Storage buckets
- [ ] Set up Supabase Realtime

### Database Migration

- [ ] Backup existing database
- [ ] Run `supabase/schema-v1_1.sql`
- [ ] Run `supabase/rls-v1_1.sql`
- [ ] Verify RLS policies with test queries
- [ ] Migrate existing data (populate org_id columns)

### Edge Functions

- [ ] Deploy `generate_pdf_report`
- [ ] Deploy `compute_insights`
- [ ] Set up cron schedules (if supported)
- [ ] Verify function execution

### Supabase Configuration

- [ ] Create Storage bucket: `org-logos` (public read)
- [ ] Create Storage bucket: `reports` (authenticated read)
- [ ] Enable Realtime on `notifications` table
- [ ] Set Storage policies

### Testing

- [ ] Run Jest tests (`npm test`)
- [ ] Run Playwright tests (`npm run test:e2e`)
- [ ] Manual testing with multiple roles
- [ ] Verify org isolation

### Post-Deployment

- [ ] Seed demo data (optional)
- [ ] Monitor Sentry for errors
- [ ] Check Edge Function logs
- [ ] User acceptance testing

---

## 🐛 KNOWN ISSUES & LIMITATIONS

### Current Limitations

1. **Onboarding Not Implemented** 🔴
   - First-time users cannot complete setup
   - Must manually create org via database

2. **Notifications Not Active** 🔴
   - No notification triggers yet
   - Center UI not built

3. **Reports Not Available** 🔴
   - PDF generation not implemented
   - Templates pending

4. **Insights Not Computing** 🔴
   - Edge function not deployed
   - UI not built

5. **Public API Not Ready** 🔴
   - Token management not implemented
   - Endpoints not created

### Workarounds (Temporary)

- **Manual Org Creation:** Insert into organizations + memberships tables
- **Use Existing CRM:** v1.0 CRM routes still functional
- **Break-Even Analysis:** Still works (update with org_id manually)

---

## 📈 MIGRATION GUIDE (v1.0 → v1.1)

### Breaking Changes

#### 1. Database Schema
- **`sales_agents`:**
  - Removed `team_leader_id` column
  - Added `org_id`, `branch_id`, `team_id`, `user_ref`

#### 2. API Changes
- All CRM routes now require org context
- Monthly score calculation now service-role only

#### 3. Authentication
- Users must be associated with at least one organization

### Migration Steps

#### Step 1: Run Migrations
```bash
# Backup database first!
supabase db dump > backup_v1.0.sql

# Run migrations
psql $DATABASE_URL < supabase/schema-v1_1.sql
psql $DATABASE_URL < supabase/rls-v1_1.sql
```

#### Step 2: Migrate Existing Data
```sql
-- Create default organization for existing users
INSERT INTO public.organizations (name, slug, owner_id)
SELECT 
  CONCAT(email, '''s Organization'),
  LOWER(REGEXP_REPLACE(email, '[^a-z0-9]', '-', 'g')),
  id
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.memberships m WHERE m.user_id = auth.users.id
);

-- Update sales_agents with default org
UPDATE public.sales_agents sa
SET org_id = (
  SELECT m.org_id 
  FROM public.memberships m 
  WHERE m.user_id = sa.user_id 
  LIMIT 1
)
WHERE org_id IS NULL;

-- Similarly for other tables...
```

#### Step 3: Update Environment
```bash
# Add to .env.local
SENTRY_DSN=your_sentry_dsn
```

#### Step 4: Deploy Edge Functions
```bash
npx supabase functions deploy generate_pdf_report --no-verify-jwt
npx supabase functions deploy compute_insights --no-verify-jwt
```

#### Step 5: Test
- Verify user can sign in
- Check org membership exists
- Test CRM functionality
- Verify RLS isolation

---

## 🎯 SUCCESS METRICS

### User Experience
- [ ] Onboarding completion rate > 80%
- [ ] Average time to complete onboarding < 10 minutes
- [ ] Notification read rate > 60%
- [ ] Report generation < 5 seconds

### Technical
- [ ] Zero RLS bypass vulnerabilities
- [ ] API response time < 200ms (p95)
- [ ] Edge Function execution < 3s
- [ ] Test coverage > 80%

### Business
- [ ] Multi-tenant isolation verified
- [ ] Audit trail complete for all mutations
- [ ] Public API adoption > 20% of orgs

---

## 📞 SUPPORT & FEEDBACK

### Getting Help
- **Documentation:** `/documentation/` folder
- **Issues:** GitHub Issues
- **Questions:** Team Slack channel

### Reporting Bugs
Please include:
- Steps to reproduce
- Expected vs actual behavior
- Browser/environment info
- Screenshots if applicable

---

## 🔮 FUTURE ROADMAP (Post-v1.1)

### v1.2 (Planned)
- Advanced analytics dashboard
- Custom report builder
- Workflow automation
- Email notifications
- Mobile app (React Native)

### v1.3 (Planned)
- Integration marketplace
- Webhook system
- Advanced AI insights
- Collaborative features
- Multi-language support

---

**Version:** 1.1.0  
**Status:** Foundation Complete, Features In Progress  
**Last Updated:** January 2025  
**Contributors:** Phase-2 Implementation Team

---

## 📝 NOTES FOR DEVELOPERS

### Code Organization
- **Multi-tenant isolation:** Always filter by `org_id` from context
- **RLS first:** Security at database level, not application
- **Type safety:** Use Zod schemas for all API routes
- **Error handling:** All errors logged to Sentry
- **Audit everything:** Wrap mutations with audit logger

### Common Patterns

**Loading org context:**
```typescript
const { data: membership } = await supabase
  .from('memberships')
  .select('org_id, role')
  .eq('user_id', userId)
  .single();
```

**Checking permissions:**
```typescript
import { hasPermission } from '@/lib/rbac';

if (!hasPermission(userRole, 'agents:create')) {
  throw new Error('Unauthorized');
}
```

**Creating audit log:**
```typescript
await fetch('/api/internal/audit', {
  method: 'POST',
  body: JSON.stringify({
    org_id: orgId,
    action: 'AGENT_CREATED',
    entity: 'sales_agents',
    entity_id: agentId,
    diff: { after: newAgent }
  })
});
```

---

**🎉 Thank you for contributing to Brokmang. v1.1!**

