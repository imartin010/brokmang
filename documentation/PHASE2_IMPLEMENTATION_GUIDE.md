# 🚀 Brokmang. Phase-2 Implementation Guide

## Quick Summary

**What's Been Done:** Foundation Layer (Database, Types, RBAC, Documentation) ✅  
**What's Next:** Infrastructure → Features → Testing → Deploy  
**Estimated Time to Complete:** 15-19 hours of focused development

---

## 📊 Current Status

### ✅ COMPLETED (24% - Foundation Layer)

1. **Database Schema** (`supabase/schema-v1_1.sql`)
   - 9 new tables (organizations, memberships, branches, teams, etc.)
   - Updated 5 existing tables with org_id
   - Helper functions and triggers
   - Complete with indexes and constraints

2. **RLS Policies** (`supabase/rls-v1_1.sql`)
   - Comprehensive security policies for all tables
   - Role-based access control at database level
   - Org-level isolation enforced
   - Service role for system operations

3. **TypeScript Types** (`lib/types.ts`)
   - 25+ new type definitions
   - Extended existing types with multi-tenant fields
   - API response types
   - Comprehensive coverage

4. **RBAC Utilities** (`lib/rbac.ts`)
   - 5 roles with hierarchy
   - 40+ granular permissions
   - Helper functions for permission checks
   - Role management utilities

5. **Documentation**
   - `CHANGELOG_1.1.md` - Complete changelog
   - `RBAC.md` - Comprehensive RBAC guide
   - `PHASE2_PROGRESS.md` - Progress tracker
   - This guide

### 🔴 REMAINING (76%)

- Infrastructure Layer (2 tasks)
- Feature Layer (8 tasks)
- Testing (2 tasks)
- Documentation (4 tasks)
- Deployment (2 tasks)

---

## 📝 Implementation Checklist

### Phase A: Complete Infrastructure (Priority 1)

#### [ ] 1. Zustand State Management
**Time Estimate:** 2 hours

**Files to Create:**
```
lib/zustand/
├── authSlice.ts
├── orgSlice.ts
├── onboardingSlice.ts
├── notificationsSlice.ts
├── reportsSlice.ts
├── insightsSlice.ts
└── store.ts
```

**Key Features:**
- Persist to localStorage
- Current org context
- User role and permissions
- Realtime subscription hooks

**Example Structure:**
```typescript
// lib/zustand/authSlice.ts
import { StateCreator } from 'zustand';

export interface AuthSlice {
  user: User | null;
  currentOrgId: string | null;
  userRole: UserRole | null;
  loading: boolean;
  setUser: (user: User) => void;
  setCurrentOrg: (orgId: string, role: UserRole) => void;
  signOut: () => void;
}

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  user: null,
  currentOrgId: null,
  userRole: null,
  loading: true,
  setUser: (user) => set({ user }),
  setCurrentOrg: (orgId, role) => set({ currentOrgId: orgId, userRole: role }),
  signOut: () => set({ user: null, currentOrgId: null, userRole: null }),
});
```

#### [ ] 2. Sentry Integration
**Time Estimate:** 1 hour

**Files to Create:**
- `lib/sentry.ts`
- Update `app/layout.tsx`
- `sentry.client.config.ts`
- `sentry.server.config.ts`

**Steps:**
1. Install: `npm install @sentry/nextjs`
2. Run: `npx @sentry/wizard@latest -i nextjs`
3. Add DSN to `.env.local`
4. Configure error boundaries

---

### Phase B: Build Core Features (Priority 2)

#### [ ] 3. Onboarding Wizard
**Time Estimate:** 4 hours

**Route:** `/onboarding`

**Files to Create:**
```
app/onboarding/
├── page.tsx (main wizard container)
├── steps/
│   ├── 1-organization.tsx
│   ├── 2-branches.tsx
│   ├── 3-teams.tsx
│   ├── 4-agents.tsx
│   ├── 5-kpi-settings.tsx
│   ├── 6-finance-settings.tsx
│   └── 7-review.tsx
├── components/
│   ├── step-indicator.tsx
│   ├── step-navigation.tsx
│   └── success-screen.tsx
└── actions.ts (server actions)
```

**Key Features:**
- 7-step wizard with progress indicator
- Draft state saved to localStorage
- Final submission creates all entities
- Creates first break-even snapshot
- Success celebration screen

**Logic Flow:**
1. User signs up → redirect to /onboarding
2. Complete steps 1-7
3. On submit: Create org → branches → teams → agents → settings
4. Create owner membership automatically
5. Mark onboarding complete
6. Redirect to dashboard

#### [ ] 4. Org Switcher & Settings
**Time Estimate:** 3 hours

**Routes:** 
- `/org` (switcher)
- `/org/settings` (settings tabs)

**Files to Create:**
```
components/
├── org-switcher.tsx (navbar dropdown)
└── org-settings/
    ├── general-tab.tsx
    ├── branding-tab.tsx
    ├── security-tab.tsx
    └── members-tab.tsx

app/org/
├── page.tsx (org list/switcher)
└── settings/
    └── page.tsx (settings tabs)
```

**Features:**
- Dropdown in navbar showing current org
- Switch between user's orgs
- Settings tabs:
  - General: Name, slug
  - Branding: Logo upload, colors
  - Security: 2FA toggle
  - Members: Invite, remove, change roles

**Implementation:**
- Logo upload to Supabase Storage bucket: `org-logos`
- Color picker with live preview
- CSS vars injection for custom branding
- Member invitation via email

#### [ ] 5. Notifications System
**Time Estimate:** 3 hours

**Route:** `/notifications`

**Files to Create:**
```
app/notifications/page.tsx
components/notifications/
├── notification-center.tsx (dropdown)
├── notification-card.tsx
├── notification-list.tsx
└── notification-badge.tsx

app/api/internal/notify/route.ts
supabase/functions/check_missed_logs/index.ts
```

**Features:**
- Notification center (page + dropdown)
- Tabs: All, Alerts, System
- Mark as read/unread
- Real-time updates via Supabase Realtime
- Badge with unread count

**Triggers:**
- Edge Function cron (20:00 daily): Check missed logs
- On KPI calculation: Alert if below threshold
- Monthly (1st, 09:00): Tax reminder

**Realtime:**
```typescript
useEffect(() => {
  const channel = supabase
    .channel('notifications')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`
    }, (payload) => {
      // Add new notification to state
    })
    .subscribe();
    
  return () => supabase.removeChannel(channel);
}, [userId]);
```

#### [ ] 6. Reports Center with PDF
**Time Estimate:** 4 hours

**Route:** `/reports`

**Files to Create:**
```
app/reports/page.tsx
components/reports/
├── report-template-card.tsx
├── generate-report-modal.tsx
├── report-history-list.tsx
└── pdf-download-button.tsx

supabase/functions/generate_pdf_report/
├── index.ts
├── templates/
│   ├── monthly-performance.ts
│   ├── financial-summary.ts
│   └── team-report.ts
└── utils/
    ├── pdf-generator.ts
    └── data-fetchers.ts
```

**Edge Function Stack:**
- Deno runtime
- Use `@react-pdf/renderer` or `puppeteer` (Deno-compatible)
- Fetch data from Supabase
- Generate PDF
- Upload to Storage: `reports/{org_id}/{yyyy-mm}/`
- Return public URL

**Templates:**
1. **Monthly Performance:** All agents, KPIs, scores
2. **Financial Summary:** Break-even, costs, projections
3. **Team Report:** Team-specific performance

#### [ ] 7. Smart Insights
**Time Estimate:** 3 hours

**Route:** `/insights`

**Files to Create:**
```
app/insights/page.tsx
components/insights/
├── insight-card.tsx
├── insight-list.tsx
└── refresh-button.tsx

supabase/functions/compute_insights/
├── index.ts
├── analyzers/
│   ├── performance-drop.ts
│   ├── break-even-warning.ts
│   ├── top-performers.ts
│   └── underperformers.ts
└── utils/
    └── confidence-scorer.ts

app/api/internal/insights/route.ts
```

**Analytics:**
- **Performance Drop:** Compare last 30 days vs previous 30 days
- **Break-Even Warning:** Rolling trend suggests deficit
- **Top Performers:** Top 10% agents
- **Underperformers:** Bottom 20% agents

**Confidence Scoring:**
```typescript
function calculateConfidence(dataPoints: number, variance: number): number {
  // More data points → higher confidence
  // Lower variance → higher confidence
  const dataScore = Math.min(dataPoints / 30, 1) * 50;
  const varianceScore = (1 - Math.min(variance, 1)) * 50;
  return Math.round(dataScore + varianceScore);
}
```

#### [ ] 8. Audit Logging
**Time Estimate:** 2 hours

**Route:** `/audit`

**Files to Create:**
```
app/audit/page.tsx
components/audit/
├── audit-log-table.tsx
├── audit-log-filters.tsx
└── diff-viewer.tsx

lib/audit-logger.ts
app/api/internal/audit/route.ts
```

**Wrapper Pattern:**
```typescript
// lib/audit-logger.ts
export async function withAudit<T>(
  action: string,
  entity: string,
  entityId: string,
  operation: () => Promise<T>,
  options?: { before?: any }
): Promise<T> {
  const before = options?.before;
  const result = await operation();
  
  await fetch('/api/internal/audit', {
    method: 'POST',
    body: JSON.stringify({
      action,
      entity,
      entity_id: entityId,
      diff: { before, after: result }
    })
  });
  
  return result;
}

// Usage
await withAudit('AGENT_UPDATED', 'sales_agents', agentId, async () => {
  return await supabase
    .from('sales_agents')
    .update(updates)
    .eq('id', agentId);
}, { before: oldAgent });
```

#### [ ] 9. Public API
**Time Estimate:** 3 hours

**Routes:** `/api/public/*`

**Files to Create:**
```
app/api/public/
├── reports/[month]/route.ts
├── agents/[id]/performance/route.ts
└── breakeven/current/route.ts

lib/api-token-validator.ts
components/org-settings/api-tokens.tsx
```

**Token Management:**
- Create in `/org/settings` (Tokens tab)
- Generate random token, hash with bcrypt
- Show plain token once
- Store hash in `api_tokens` table

**Validation Middleware:**
```typescript
// lib/api-token-validator.ts
export async function validateApiToken(request: Request) {
  const token = request.headers.get('X-Brokmang-Key');
  if (!token) throw new Error('Missing API key');
  
  const { data } = await supabase
    .from('api_tokens')
    .select('org_id, scopes, is_active')
    .eq('token_hash', hashToken(token))
    .single();
    
  if (!data || !data.is_active) throw new Error('Invalid API key');
  
  return { orgId: data.org_id, scopes: data.scopes };
}
```

#### [ ] 10. Custom Branding
**Time Estimate:** 1 hour

**Implementation:**
- In `/org/settings/branding`
- Upload logo to Supabase Storage
- Pick primary/secondary colors
- Save to `organizations.branding`

**CSS Injection:**
```typescript
// app/layout.tsx
export default function RootLayout({ children }: { children: ReactNode }) {
  const { currentOrg } = useOrg();
  
  const brandingStyle = currentOrg?.branding ? `
    :root {
      --color-primary: ${currentOrg.branding.primaryColor || '#257CFF'};
      --color-secondary: ${currentOrg.branding.secondaryColor || '#F45A2A'};
    }
  ` : '';
  
  return (
    <html>
      <head>
        {brandingStyle && <style>{brandingStyle}</style>}
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

### Phase C: Testing (Priority 3)

#### [ ] 11. Jest Unit Tests
**Time Estimate:** 2 hours

**Files to Create:**
```
tests/unit/
├── rbac.test.ts
├── break-even.test.ts
├── kpi-scoring.test.ts
└── utils.test.ts

jest.config.js
```

**Test Coverage:**
- RBAC permission checks
- Break-even calculation logic
- KPI scoring algorithm
- Weight sum validation
- Date/time utilities

**Run:** `npm test`

#### [ ] 12. Playwright E2E Tests
**Time Estimate:** 2 hours

**Files to Create:**
```
tests/e2e/
├── onboarding.spec.ts
├── notifications.spec.ts
├── reports.spec.ts
└── org-switcher.spec.ts

playwright.config.ts
```

**Scenarios:**
1. Complete onboarding flow
2. Create and read notifications
3. Generate report
4. Switch organizations

**Run:** `npm run test:e2e`

---

### Phase D: Final Polish (Priority 4)

#### [ ] 13. Additional Documentation
**Time Estimate:** 2 hours

**Files to Create:**
- `API_SURFACE.md` - Public API docs
- `ONBOARDING.md` - Wizard user guide
- `NOTIFICATIONS.md` - Notification types
- `MIGRATION_V1_TO_V1.1.md` - Upgrade guide

#### [ ] 14. Demo Seed Script
**Time Estimate:** 1 hour

**File:** `supabase/seed-demo-data.sql`

**Creates:**
- 1 organization ("Demo Brokerage")
- 2 branches (Downtown, Uptown)
- 3 teams
- 20 agents (15 agents, 5 team leaders)
- 45 days of logs
- Settings (KPI + Finance)
- 5 memberships (all roles)

---

## 🗂️ File Structure Overview

```
Brokerage Management/
├── app/
│   ├── onboarding/             # [NEW] 7-step wizard
│   ├── org/                    # [NEW] Switcher & settings
│   ├── notifications/          # [NEW] Notification center
│   ├── reports/                # [NEW] Report generation
│   ├── insights/               # [NEW] Smart analytics
│   ├── audit/                  # [NEW] Audit logs
│   ├── api/
│   │   ├── public/             # [NEW] Public API
│   │   └── internal/           # [NEW] Internal APIs
│   └── crm/                    # [UPDATED] Org-scoped
│
├── components/
│   ├── org-switcher.tsx        # [NEW]
│   ├── org-settings/           # [NEW]
│   ├── notifications/          # [NEW]
│   ├── reports/                # [NEW]
│   ├── insights/               # [NEW]
│   ├── audit/                  # [NEW]
│   └── onboarding/             # [NEW]
│
├── lib/
│   ├── rbac.ts                 # [NEW] ✅
│   ├── audit-logger.ts         # [NEW]
│   ├── api-token-validator.ts # [NEW]
│   ├── sentry.ts               # [NEW]
│   └── zustand/                # [NEW]
│       ├── store.ts
│       ├── authSlice.ts
│       ├── orgSlice.ts
│       ├── onboardingSlice.ts
│       ├── notificationsSlice.ts
│       ├── reportsSlice.ts
│       └── insightsSlice.ts
│
├── supabase/
│   ├── schema-v1_1.sql         # [NEW] ✅
│   ├── rls-v1_1.sql            # [NEW] ✅
│   ├── seed-demo-data.sql      # [NEW]
│   └── functions/
│       ├── generate_pdf_report/    # [NEW]
│       ├── compute_insights/       # [NEW]
│       └── check_missed_logs/      # [NEW]
│
├── tests/
│   ├── unit/                   # [NEW]
│   └── e2e/                    # [NEW]
│
└── documentation/
    ├── CHANGELOG_1.1.md        # [NEW] ✅
    ├── RBAC.md                 # [NEW] ✅
    ├── PHASE2_PROGRESS.md      # [NEW] ✅
    ├── PHASE2_IMPLEMENTATION_GUIDE.md # [NEW] ✅
    ├── API_SURFACE.md          # [NEW]
    ├── ONBOARDING.md           # [NEW]
    ├── NOTIFICATIONS.md        # [NEW]
    └── MIGRATION_V1_TO_V1.1.md # [NEW]
```

---

## 🚀 Quick Start Guide

### Step 1: Database Setup
```bash
# Backup existing database
npx supabase db dump > backup_v1.0.sql

# Run migrations
psql $DATABASE_URL < supabase/schema-v1_1.sql
psql $DATABASE_URL < supabase/rls-v1_1.sql

# Verify
psql $DATABASE_URL -c "SELECT * FROM organizations LIMIT 1;"
```

### Step 2: Install Dependencies
```bash
npm install zustand @sentry/nextjs bcryptjs date-fns @react-pdf/renderer
npm install -D jest @testing-library/react @playwright/test @types/bcryptjs
```

### Step 3: Configure Environment
```bash
# Add to .env.local
SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### Step 4: Create Supabase Storage Buckets
```sql
-- In Supabase Dashboard → Storage
-- Create bucket: org-logos (public read)
-- Create bucket: reports (authenticated read)
```

### Step 5: Start Development
```bash
npm run dev
# Open http://localhost:3000
```

---

## 🧪 Testing Instructions

### Unit Tests
```bash
npm test                  # Run all tests
npm test -- --watch      # Watch mode
npm test -- --coverage   # Coverage report
```

### E2E Tests
```bash
npm run test:e2e         # Run e2e tests
npm run test:e2e:ui      # Interactive UI mode
npm run test:e2e:debug   # Debug mode
```

### Manual Testing Checklist
- [ ] Complete onboarding flow as new user
- [ ] Switch between organizations
- [ ] Test each role's permissions
- [ ] Generate reports
- [ ] View notifications
- [ ] Check audit logs
- [ ] Use public API with token

---

## 📦 Deployment Steps

### Pre-Deployment
- [ ] All tests passing
- [ ] Linter clean
- [ ] Type-check passing
- [ ] Documentation complete

### Database
- [ ] Backup production database
- [ ] Run schema-v1_1.sql
- [ ] Run rls-v1_1.sql
- [ ] Migrate existing data
- [ ] Verify RLS policies

### Supabase
- [ ] Create Storage buckets
- [ ] Enable Realtime on notifications
- [ ] Deploy Edge Functions
- [ ] Set up cron schedules

### Frontend
- [ ] Build successful
- [ ] Deploy to Vercel
- [ ] Set environment variables
- [ ] Verify routes working

### Post-Deployment
- [ ] Smoke test all features
- [ ] Monitor Sentry for errors
- [ ] Check Edge Function logs
- [ ] User acceptance testing

---

## 💡 Pro Tips

### Development
1. **Start with Onboarding** - It's the critical path for all other features
2. **Test RLS Early** - Use different roles in parallel browser sessions
3. **Use Service Role Sparingly** - Only for system operations
4. **Log Everything** - Comprehensive audit trail helps debugging

### State Management
- Use Zustand for client state
- Use Supabase Realtime for live updates
- Persist critical state to localStorage
- Clear state on org switch

### Performance
- Index all foreign keys
- Use RLS policies efficiently (avoid complex sub-queries)
- Cache insights (compute once, store for 24h)
- Lazy load reports list

### Security
- Never expose service role key client-side
- Always validate org membership server-side
- Use parameterized queries (Supabase client handles this)
- Test RLS with each role

---

## 📞 Support & Resources

### Documentation
- `/documentation/` - All guides
- `/supabase/*.sql` - Database schemas
- `/lib/*.ts` - Utility functions

### External Resources
- [Supabase Docs](https://supabase.com/docs)
- [Zustand Docs](https://zustand-demo.pmnd.rs/)
- [Sentry Docs](https://docs.sentry.io/)
- [Playwright Docs](https://playwright.dev/)

---

## 🎯 Success Criteria

### Technical
- ✅ Zero RLS bypass vulnerabilities
- ✅ All tests passing (unit + e2e)
- ✅ < 200ms API response time (p95)
- ✅ < 3s Edge Function execution
- ✅ > 80% test coverage

### Functional
- ✅ Onboarding completion rate > 80%
- ✅ < 10 minutes average onboarding time
- ✅ Multi-tenant isolation verified
- ✅ All 5 roles working correctly
- ✅ Reports generate successfully

### User Experience
- ✅ Intuitive onboarding flow
- ✅ Clear role-based UI
- ✅ Fast page loads
- ✅ Responsive design
- ✅ Helpful error messages

---

## 📊 Progress Tracking

Use `documentation/PHASE2_PROGRESS.md` to track your progress:
- Update status as you complete tasks
- Note any blockers or decisions
- Document any deviations from plan

---

**Ready to Build? Start with Phase A (Infrastructure)! 🚀**

Good luck with the implementation. Refer to the detailed documentation in `/documentation/` for specifics on each component.

---

**Last Updated:** January 2025  
**Version:** 1.0  
**Status:** Ready for Implementation

