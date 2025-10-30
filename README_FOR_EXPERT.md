# 🎯 START HERE - Expert Quick Reference

## The Issue in 10 Seconds

**Application stuck** due to PostgreSQL RLS infinite recursion on `sales_agents` table.

**Error:** `42P17: infinite recursion detected in policy for relation "sales_agents"`

**Fix:** Run `EXPERT_QUICK_FIX.sql` in Supabase SQL Editor

---

## 📂 Files to Review (In Order)

### 1. **`FOR_EXPERT.md`** (2 min read)
Quick overview and file references

### 2. **`EXPERT_QUICK_FIX.sql`** (30 sec to run)
Complete fix in single transaction with verification

### 3. **`TECHNICAL_ISSUE_REPORT.md`** (10 min read)
Comprehensive technical analysis:
- Complete error details
- Database schema
- Migration history
- Root cause analysis
- All diagnostic queries
- Frontend code state

### 4. **`ISSUE_SUMMARY_FOR_EXPERT.txt`** (1 min read)
Plain text summary for quick reference

---

## ⚡ If You Have 5 Minutes

1. **Read:** `FOR_EXPERT.md` (overview)
2. **Run:** `EXPERT_QUICK_FIX.sql` (the fix)
3. **Verify:** Check output says "✅ ALL CHECKS PASSED"
4. **Test:** User should be able to sign in now

---

## ⚡ If You Have 15 Minutes

1. **Read:** `TECHNICAL_ISSUE_REPORT.md` (full context)
2. **Run diagnostic queries** from report
3. **Understand root cause**
4. **Run:** `EXPERT_QUICK_FIX.sql`
5. **Verify with all test queries**
6. **Guide user through frontend test**

---

## 🎯 What User Needs

**Goal:** Be able to sign up, select role (CEO/Team Leader), and access dashboard

**Current State:** Blocked at database layer - cannot write or read from `sales_agents` table

**After Fix:** Application should work normally

---

## 🔑 Key Database Details

**Table:** `public.sales_agents`
**Supabase Project:** `eamywkblubazqmepaxmm`
**Critical Column:** `user_type` (stores 'ceo' or 'team_leader')
**Auth:** Uses Supabase Auth with auth.users table

**The Flow:**
```
Sign up → auth.users created
       → Select role
       → INSERT into sales_agents (user_id, user_type)
       → Currently BLOCKED by RLS recursion
```

---

## 📞 Questions I Can Answer

**Q:** What migrations were run?
**A:** See "Migration History" section in TECHNICAL_ISSUE_REPORT.md

**Q:** What RLS policies exist now?
**A:** Unknown (likely 5-10 conflicting policies). Run: `SELECT * FROM pg_policies WHERE tablename = 'sales_agents'`

**Q:** Are there duplicates?
**A:** Likely yes. Run: `SELECT user_id, COUNT(*) FROM sales_agents GROUP BY user_id HAVING COUNT(*) > 1`

**Q:** What's the simplest fix?
**A:** Run `EXPERT_QUICK_FIX.sql` - it handles everything

**Q:** Can we just disable RLS?
**A:** Yes for testing, but not recommended for production. To disable: `ALTER TABLE sales_agents DISABLE ROW LEVEL SECURITY`

---

## 🛠️ Tools Needed

- Supabase Dashboard access (SQL Editor)
- 5 minutes of time
- Basic PostgreSQL knowledge

---

## ✅ The Fix Works Because

1. **Removes ALL policies** - No matter how many exist
2. **Uses dynamic SQL** - Catches policies we don't know about
3. **Removes duplicates** - Ensures unique index can be created
4. **Creates simple policies** - Direct `auth.uid() = user_id` comparison (cannot recurse)
5. **Runs in transaction** - Rolls back if anything fails
6. **Verifies success** - Built-in checks ensure it worked

---

## 🎯 Expected Outcome

After running `EXPERT_QUICK_FIX.sql`:

```
✅ All broken policies removed
✅ Duplicate rows cleaned
✅ Unique index created
✅ 3 simple policies active
✅ User can sign up
✅ User can select role
✅ Data saves successfully
✅ Dashboard loads
✅ Application works
```

---

**Bottom Line:** This is a well-understood issue with a clear fix. The SQL script will resolve it in 30 seconds.

Good luck! 🚀

