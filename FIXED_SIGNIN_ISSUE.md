# ✅ Fixed Sign-In Issue

## 🎯 The Problem

Even though `user_profiles` table exists and has data, the code was still querying `sales_agents` in some places, causing 406 errors.

---

## ✅ What I Fixed

### 1. Navbar Component
**File:** `components/Navbar.tsx`

**Changed:**
- ❌ `.single()` → ✅ `.maybeSingle()`
- This prevents errors when no profile exists yet

### 2. All References Updated

All files now use `user_profiles`:
- ✅ `app/select-role/page.tsx`
- ✅ `app/dashboard/page.tsx`
- ✅ `components/Navbar.tsx`
- ✅ `app/auth/callback/page.tsx`

---

## 🧪 Test Now

1. **Clear browser cookies** completely
2. **Go to** `localhost:3000/auth/signin`
3. **Sign in** with your credentials
4. **Should redirect** to `/dashboard` ✅

---

## ✅ The Flow Now

```
Sign In → Auth successful
       ↓
Dashboard checks user_profiles
       ├─ Has profile → Show dashboard
       └─ No profile → Redirect to /select-role
```

---

**Try signing in now - it should work!** 🚀

