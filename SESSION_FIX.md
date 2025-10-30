# 🔧 Session Not Persisting - Complete Fix

## ❌ The Problem

After signing in:
1. ✅ Sign in successful
2. ❌ Redirected to home page
3. ❌ Click any page → redirected back to auth
4. ❌ Session not persisting (like you're not signed in)

## 🎯 Root Causes

1. **Middleware matcher too broad** - Checking every request
2. **Auth redirect wrong** - Going to `/` instead of `/dashboard`
3. **Cookies not persisting** - Session lost between requests

---

## ✅ **The Fix (Already Applied)**

### 1. Fixed Middleware
- ✅ Added explicit public routes
- ✅ Better route handling
- ✅ Won't block home page

### 2. Fixed Auth Redirects  
- ✅ Sign in → `/dashboard` (not `/`)
- ✅ Sign up → `/dashboard` (not `/`)

### 3. Test It Now

1. **Clear ALL cookies:**
   - Chrome: Settings → Privacy → Clear browsing data
   - Check "Cookies and other site data"
   - Time range: "All time"
   - Click "Clear data"

2. **Close and reopen browser** (important!)

3. **Go to:** `localhost:3000/auth`

4. **Sign in with your credentials**

5. **Should redirect to dashboard and STAY there** ✅

---

## 🧪 If Still Not Working

### Step 1: Check Supabase Session

Open browser console (F12) and run:

```javascript
// Check if session exists
const { data, error } = await supabase.auth.getSession();
console.log('Session:', data);
console.log('User:', data.session?.user);

// If no session, something is wrong with auth
if (!data.session) {
  console.error('❌ No session found!');
}
```

### Step 2: Check Cookies

In Chrome DevTools:
1. **Application tab**
2. **Cookies** → `localhost:3000`
3. **Should see:**
   - `sb-eamywkblubazqmepaxmm-auth-token`
   - `sb-eamywkblubazqmepaxmm-auth-token-code-verifier`

**If cookies are missing:** Session isn't being saved!

### Step 3: Manual Sign In Test

In browser console:

```javascript
// Try signing in directly
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'your-email@example.com',
  password: 'your-password'
});

console.log('Sign in result:', { data, error });

// Check session immediately after
const { data: session } = await supabase.auth.getSession();
console.log('Session after sign in:', session);
```

---

## 🔧 Nuclear Option: Reset Everything

If nothing works, do this:

### 1. Clear Everything

```bash
# In terminal
cd "/Users/martin2/Desktop/Brokerage Management"

# Stop dev server
# Press Ctrl+C

# Clear Next.js cache
rm -rf .next

# Restart
npm run dev
```

### 2. Clear Browser

- **Chrome:** Settings → Privacy → Clear ALL browsing data
- **Select:** Cookies, cached images, site data
- **Time:** All time
- **Close and reopen** browser

### 3. Try Again

1. Go to `localhost:3000/auth`
2. Sign in
3. Should work now

---

## 🐛 Common Issues & Fixes

### Issue 1: "No session" after sign in

**Cause:** Supabase client not storing session

**Fix:**
```typescript
// In lib/supabase-browser.ts
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true, // Make sure this is true!
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  }
);
```

### Issue 2: Cookies not being set

**Cause:** Localhost cookie issues or HTTPS required

**Fix:** Temporarily disable RLS to test:
```sql
-- TEMPORARY - just for testing!
ALTER TABLE public.sales_agents DISABLE ROW LEVEL SECURITY;
```

**Remember to re-enable:**
```sql
ALTER TABLE public.sales_agents ENABLE ROW LEVEL SECURITY;
```

### Issue 3: Middleware blocking everything

**Cause:** Matcher too broad

**Fix:** Check `middleware.ts` config:
```typescript
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

This should EXCLUDE:
- Static files
- Images
- Favicon
- API routes (if you have any)

---

## 📝 Debug Checklist

Run through this:

- [ ] Cleared ALL browser cookies
- [ ] Cleared Next.js cache (`.next` folder)
- [ ] Restarted dev server
- [ ] Closed and reopened browser
- [ ] Supabase cookies appear after sign in
- [ ] Session persists after page refresh
- [ ] Can access `/dashboard` without redirect
- [ ] Middleware allows public routes
- [ ] Auth redirects to `/dashboard` (not `/`)

---

## 🎯 Expected Behavior

```
1. Go to localhost:3000/auth
   ↓
2. Enter email/password, click Sign In
   ↓
3. See "Sign in successful!" message
   ↓
4. Wait 1 second
   ↓
5. Redirect to /dashboard ✅
   ↓
6. If no role: redirect to /select-account-type
   ↓
7. Select CEO or Team Leader
   ↓
8. Redirect to /dashboard with role ✅
   ↓
9. Dashboard shows and session persists ✅
```

---

## 🚨 Last Resort: Check Supabase Dashboard

1. **Go to:** Supabase Dashboard
2. **Authentication** → **Users**
3. **Check:** Your user exists
4. **Check:** Email is confirmed (green checkmark)
5. **If not confirmed:** Confirm it manually

---

## ✅ Success Indicators

After fixing, you should see:

1. **Sign in works** - No errors
2. **Redirect to dashboard** - Not home page
3. **Session persists** - Can refresh page without re-auth
4. **Cookies exist** - Check DevTools Application tab
5. **User shows in Supabase** - Auth → Users shows logged-in user

---

**Status:** Fixes applied, test now!

**Next Steps:**
1. Clear cookies
2. Restart browser
3. Sign in
4. Should work!

