# ✅ Sign-In Fix Complete

## 🎯 Issue Found & Fixed

The error `406 Not Acceptable` when querying `sales_agents` was happening because:

1. **Navbar** was using `.single()` instead of `.maybeSingle()` (throws error if no rows)
2. **Code updated** to use `user_profiles` instead of `sales_agents`

---

## ✅ Changes Made

### 1. Navbar Query Fix
**File:** `components/Navbar.tsx`

```typescript
// Changed from .single() to .maybeSingle()
const { data } = await supabase
  .from('user_profiles')
  .select('user_type')
  .eq('user_id', userId)
  .maybeSingle();  // ✅ Returns null if no rows (no error)
```

### 2. All Files Updated

All authentication/user profile queries now use `user_profiles`:
- ✅ `app/select-role/page.tsx`
- ✅ `app/dashboard/page.tsx`
- ✅ `components/Navbar.tsx`
- ✅ `app/auth/callback/page.tsx`

---

## 🧪 Test Sign-In Now

1. **Clear browser cookies** (important!)
2. **Go to** `localhost:3000/auth/signin`
3. **Enter credentials**
4. **Click "Sign In"**
5. **Should redirect to** `/dashboard` ✅

---

## ✅ Expected Behavior

### If User Has Profile:
- Sign in → Dashboard loads → Shows content based on role

### If User Has No Profile:
- Sign in → Dashboard → Redirects to `/select-role` → User selects role → Dashboard

---

## 🔍 Debugging

If it still doesn't work, check browser console:

**Good signs:**
- No 406 errors
- No PGRST116 errors
- Queries to `user_profiles` succeed

**Bad signs:**
- Still seeing `sales_agents` in network tab
- 406 errors on user_profiles queries

---

**Try signing in now - should work!** 🚀

