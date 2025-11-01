# Organization Removal - Summary

This document tracks the removal of the organization system from Brokmang.

## Completed ✅

1. ✅ Created SQL migration script: `supabase/remove-organizations.sql`
2. ✅ Removed OrgSlice from Zustand store
3. ✅ Removed organization context from AuthSlice
4. ✅ Deleted `components/org-switcher.tsx`
5. ✅ Deleted `app/org/settings/page.tsx`
6. ✅ Removed OrgSwitcher from navbar
7. ✅ Updated `app/insights/page.tsx` to remove org_id checks
8. ✅ Updated `app/api/insights/generate/route.ts` to work without org_id

## Remaining Work 🔄

### Database
- [ ] Run `supabase/remove-organizations.sql` on production database
- [ ] Update RLS policies to remove organization checks (create simplified version)

### Frontend Pages
- [ ] Update `app/onboarding/page.tsx` - Remove organization creation, simplify flow
- [ ] Update `app/onboarding/steps/1-organization.tsx` - Remove or repurpose
- [ ] Update `app/analyze/page.tsx` - Remove org_id references
- [ ] Update `app/audit/page.tsx` - Remove org_id checks
- [ ] Update `app/reports/page.tsx` - Check for org_id references
- [ ] Update `app/dashboard/page.tsx` - Check for org_id references

### API Routes
- [ ] Update all API routes that use org_id
- [ ] Update subscription routes to remove org_id
- [ ] Update notification routes
- [ ] Update audit routes

### Components
- [ ] Delete `components/org-settings/*` directory
- [ ] Update `components/subscription-payment-modal.tsx` to remove orgId prop
- [ ] Update notification components

### Types
- [ ] Remove Organization types from `lib/types.ts`
- [ ] Update all type definitions

### Other
- [ ] Update middleware.ts if it checks for organizations
- [ ] Update any utility functions that reference organizations

## SQL Migration Required

Run the migration script to remove organization-related database structures:

```sql
-- Run this file:
supabase/remove-organizations.sql
```

This will:
- Drop organization tables (organizations, memberships, branches, teams, etc.)
- Remove org_id columns from all tables
- Drop organization-related functions
- Remove organization-related indexes

## Important Notes

⚠️ **Data Loss Warning**: This migration will DELETE all organization, membership, branch, and team data. Make sure to backup your database before running.

⚠️ **Breaking Changes**: All features that depended on organization context will need to be updated to work with user_id only.

⚠️ **RLS Policies**: After removing organizations, RLS policies need to be simplified to use user_id-based access control instead of org_id-based isolation.

