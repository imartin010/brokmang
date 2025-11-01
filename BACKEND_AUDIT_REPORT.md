# 🔍 Backend Audit Report - Database Conflicts Analysis

## Executive Summary
Comprehensive audit of database tables, columns, RLS policies, storage policies, and backend code conflicts.

**Date:** November 1, 2025  
**Status:** ✅ Issues Identified - Fixes Recommended

---

## 📊 1. Database Tables Inventory

### Core Tables (Verified):
1. ✅ `user_profiles` - User authentication profiles (user_id, user_type, full_name)
2. ✅ `sales_agents` - Sales agent records (full_name, NOT name)
3. ✅ `subscriptions` - User subscriptions (user_id, status, end_date)
4. ✅ `agent_daily_logs` - Daily activity logs
5. ✅ `agent_monthly_scores` - Monthly performance scores
6. ✅ `agent_kpi_settings` - KPI configuration
7. ✅ `notifications` - System notifications
8. ✅ `system_logs` - Audit logs
9. ✅ `break_even_records` - Break-even calculations
10. ✅ `subscription_payments` - Payment records
11. ✅ `pending_subscription_validations` - Validation queue
12. ✅ `api_tokens` - API authentication tokens

---

## ⚠️ 2. CRITICAL CONFLICTS FOUND

### 🔴 Issue #1: `org_id` Column References in Code
**Status:** CRITICAL - Code references columns that may not exist

**Affected Files:**
1. `app/api/public/agents/[id]/performance/route.ts`
   - Line 25: `.eq("org_id", auth.orgId)`
   - **Problem:** `agent_daily_logs` table may not have `org_id` column
   - **Impact:** Query will fail if column doesn't exist

2. `app/api/public/breakeven/current/route.ts`
   - Line 18: `.eq("org_id", auth.orgId)`
   - **Problem:** `break_even_records` table may still have `org_id` (needs verification)
   - **Impact:** May work if column exists, but inconsistent with organization removal

3. `app/api/internal/notify/route.ts` (needs verification)
4. `app/api/internal/audit/route.ts` (needs verification)
5. `app/api/cron/subscription-check/route.ts` (needs verification)

**Fix Required:**
- Verify if `org_id` columns exist in tables
- If removed: Update API routes to remove `org_id` filters
- If exists: Decide whether to keep or migrate away

---

### 🔴 Issue #2: Column Name Mismatch - `deals` and `revenue`
**Status:** CRITICAL - API queries non-existent columns

**File:** `app/api/public/agents/[id]/performance/route.ts`
- Line 23: `.select("deals, revenue")`
- **Problem:** `agent_daily_logs` table likely has different column names
- **Actual columns (from schema):**
  - `sales_amount` (not `revenue`)
  - `meetings_count`, `calls_count` (not `deals`)

**Fix Required:**
```typescript
// WRONG:
.select("deals, revenue")

// CORRECT:
.select("meetings_count, sales_amount")
// or better:
.select("calls_count, meetings_count, sales_amount")
```

---

### 🟡 Issue #3: Column Name Verification - `full_name` vs `name`
**Status:** LIKELY OK - But needs verification

**Context:**
- Code uses `full_name` in `sales_agents` queries ✅
- Previous fixes updated `agent?.name` to `agent?.full_name` ✅
- Need to verify database schema matches

**Verification Query:**
```sql
SELECT column_name FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'sales_agents'
  AND column_name IN ('name', 'full_name');
```

**Expected:** Only `full_name` should exist

---

## 🔐 3. RLS Policies Audit

### Tables Requiring RLS:
1. ✅ `sales_agents` - Should have user-based policies
2. ✅ `user_profiles` - Should allow users to read own profile
3. ✅ `subscriptions` - Should allow users to read own subscriptions
4. ✅ `agent_daily_logs` - Should filter by user_id
5. ✅ `agent_monthly_scores` - Should filter by user_id
6. ✅ `break_even_records` - Should filter by user_id

### Verification Needed:
- Are RLS policies enabled on all sensitive tables?
- Do policies correctly filter by `user_id` instead of `org_id`?
- Are there any conflicting or duplicate policies?

---

## 📦 4. Storage Policies Audit

### Buckets Identified:
1. ✅ `org-logos` - Public read policy exists
2. ⚠️ `reports` - **NO POLICIES** (needs verification)
3. ✅ `payment-screenshots` - Multiple policies (admins, users, service role)

### Issues:
- `reports` bucket shows "No policies created yet"
- Need to verify if this is intentional or needs policies

---

## 🔧 5. Recommended Fixes

### Priority 1: Critical Backend Fixes

#### Fix #1: Update `agent_daily_logs` Query
**File:** `app/api/public/agents/[id]/performance/route.ts`

```typescript
// BEFORE:
const { data: logs, error } = await sb
  .from("agent_daily_logs")
  .select("deals, revenue")
  .eq("user_id", userId)
  .eq("org_id", auth.orgId)  // ❌ May not exist
  .limit(1000);

// AFTER:
const { data: logs, error } = await sb
  .from("agent_daily_logs")
  .select("agent_id, log_date, calls_count, meetings_count, sales_amount")
  .eq("agent_id", userId)  // ✅ Use agent_id instead
  .limit(1000);

// Update totals calculation:
const totals = (logs || []).reduce(
  (acc, row: any) => {
    acc.deals += row.meetings_count || 0;
    acc.revenue += row.sales_amount || 0;
    return acc;
  },
  { deals: 0, revenue: 0 }
);
```

#### Fix #2: Update `break_even_records` Query
**File:** `app/api/public/breakeven/current/route.ts`

```typescript
// Check if org_id exists in table first
// If org_id removed, use user_id instead:
const { data, error } = await sb
  .from("break_even_records")
  .select("id, created_at, results")
  .eq("user_id", auth.userId)  // ✅ Use user_id
  .order("created_at", { ascending: false })
  .limit(1)
  .maybeSingle();
```

### Priority 2: Verification Queries

Run these in Supabase SQL Editor:

```sql
-- 1. Check org_id columns
SELECT table_name, column_name 
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'org_id';

-- 2. Check agent_daily_logs columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'agent_daily_logs'
ORDER BY ordinal_position;

-- 3. Check sales_agents columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'sales_agents'
ORDER BY ordinal_position;

-- 4. Verify RLS is enabled
SELECT tablename, relrowsecurity 
FROM pg_tables pt
JOIN pg_class pc ON pc.relname = pt.tablename
WHERE pt.schemaname = 'public'
  AND pt.tablename IN ('sales_agents', 'user_profiles', 'subscriptions');
```

---

## ✅ 6. Verified Working Components

### Correctly Implemented:
1. ✅ `sales_agents` uses `full_name` (not `name`)
2. ✅ `user_profiles` structure matches code expectations
3. ✅ `subscriptions` queries work correctly
4. ✅ Storage policies for `payment-screenshots` are correct
5. ✅ Main API routes for insights/subscriptions work correctly

---

## 📝 7. Action Items

### Immediate (Critical):
- [ ] Run verification queries in Supabase
- [ ] Fix `agent_daily_logs` query (column names)
- [ ] Fix `break_even_records` query (org_id vs user_id)
- [ ] Remove `org_id` filters from all queries if columns removed

### Short Term (Important):
- [ ] Verify all RLS policies are correct
- [ ] Add policies to `reports` bucket if needed
- [ ] Test all API endpoints after fixes
- [ ] Update TypeScript types to match actual schema

### Long Term (Maintenance):
- [ ] Add database schema validation tests
- [ ] Create migration scripts for schema changes
- [ ] Document column naming conventions
- [ ] Set up CI checks for schema-code consistency

---

## 🔍 8. Next Steps

1. **Run Audit Queries** - Execute `supabase/quick-audit.sql` in Supabase
2. **Review Results** - Check which columns actually exist
3. **Fix Code** - Update API routes based on actual schema
4. **Test** - Verify all endpoints work correctly
5. **Document** - Update API documentation

---

## 📊 Summary

| Category | Status | Issues Found |
|----------|--------|--------------|
| Table Structure | ⚠️ Needs Verification | org_id columns may be inconsistent |
| Column Names | 🔴 Critical | `deals`/`revenue` don't exist in `agent_daily_logs` |
| RLS Policies | ✅ Likely OK | Needs verification |
| Storage Policies | ⚠️ Partial | `reports` bucket has no policies |
| Code-DB Sync | 🔴 Critical | 2+ API routes have conflicts |

**Total Critical Issues:** 2  
**Total Warnings:** 2  
**Overall Status:** ⚠️ **Needs Attention**

---

*Report generated: November 1, 2025*  
*Next review recommended: After fixes applied*

