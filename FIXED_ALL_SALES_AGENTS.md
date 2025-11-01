# ✅ FIXED - All `sales_agents` Queries Updated

## Files Fixed:

1. ✅ `lib/data/getUserType.ts` - Changed to `user_profiles` + `maybeSingle()`
2. ✅ `app/api/user/set-type/route.ts` - POST endpoint: Changed to `user_profiles` + upsert
3. ✅ `app/api/user/set-type/route.ts` - GET endpoint: Changed to `user_profiles` + `maybeSingle()`
4. ✅ `components/navbar.tsx` - Changed to `user_profiles` + `maybeSingle()`

## The Issue

The Navbar was loading on **every page** (it's in the layout), and it was querying `sales_agents?select=user_type&user_id=eq.XXX` which:
- Returns 406 because RLS policies don't allow this query
- Table doesn't have `user_type` for new users
- Should be using `user_profiles` table instead

## What Changed

All queries now:
- Use `user_profiles` table ✅
- Use `.maybeSingle()` instead of `.single()` ✅ (handles missing rows gracefully)
- Properly handle null/undefined results ✅

## Next Steps

1. **Restart your dev server** (important!)
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

2. **Clear browser cache** OR use Incognito window

3. **Test sign-in** - should work now! ✅

---

**All code is fixed. The issue was the Navbar querying `sales_agents` on every page load.**

