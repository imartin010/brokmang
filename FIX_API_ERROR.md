# 🔧 **Fix: 500 Error on Calculate API**

The `/api/calculate` route is failing. Here's how to fix it:

---

## 🎯 **Most Likely Issues**

1. ❌ **Environment variable `NEXT_PUBLIC_SUPABASE_URL` not set in Vercel**
2. ❌ **Supabase Edge Function not deployed**
3. ❌ **Wrong Supabase URL in environment variables**

---

## ✅ **Step 1: Verify Vercel Environment Variables**

1. Go to **Vercel Dashboard** → Your project → **Settings** → **Environment Variables**
2. Check if these are set:
   - ✅ `NEXT_PUBLIC_SUPABASE_URL`
   - ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - ✅ `SUPABASE_SERVICE_ROLE_KEY`

### **If Missing, Add Them:**

1. Click **"Add"** button
2. For each variable:
   - **Key**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)
   - **Environments**: ✅ Check **Production**, **Preview**, and **Development**
3. Repeat for all 3 variables
4. **Redeploy** your project (or wait for auto-deploy on next push)

---

## ✅ **Step 2: Deploy Supabase Edge Function**

The API route calls a Supabase Edge Function. Make sure it's deployed:

### **Check if Function Exists:**

1. Go to **Supabase Dashboard** → Your project
2. Navigate to **Edge Functions** in the sidebar
3. Check if `calculate` function is listed

### **If Missing, Deploy It:**

1. Make sure you have Supabase CLI installed:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   npx supabase login
   ```

3. Link to your project:
   ```bash
   npx supabase link --project-ref YOUR_PROJECT_REF
   ```
   
   Find your project ref in Supabase Dashboard → Settings → General

4. Set secrets (if not already set):
   ```bash
   npx supabase secrets set SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
   ```

5. Deploy the function:
   ```bash
   npx supabase functions deploy calculate --no-verify-jwt
   ```

---

## ✅ **Step 3: Test the Fix**

After updating environment variables:

1. **Redeploy** your Vercel project:
   - Option A: Push a commit to trigger auto-deploy
   - Option B: Go to Vercel → Deployments → Click "..." → "Redeploy"

2. **Wait for deployment to complete** (~2 minutes)

3. **Test the calculate API:**
   - Go to `https://www.brokmang.com/analyze`
   - Fill in the form
   - Click "Calculate"
   - Check browser console for errors

---

## 🔍 **Step 4: Check Vercel Function Logs**

If it still fails:

1. Go to **Vercel Dashboard** → Your project → **Logs**
2. Filter by **"Functions"**
3. Look for errors when calling `/api/calculate`
4. The logs will show:
   - Missing environment variables
   - Edge function connection errors
   - Detailed error messages

---

## 🎯 **Quick Fix Checklist**

- [ ] Check Vercel → Settings → Environment Variables
- [ ] Verify `NEXT_PUBLIC_SUPABASE_URL` is set
- [ ] Verify Edge Function is deployed in Supabase
- [ ] Redeploy Vercel project
- [ ] Test `/analyze` page again

---

## 💡 **Alternative: Use Local Calculation (Temporary)**

If Edge Function deployment is complex, we can make the calculation run directly in the API route instead of calling the Edge Function. Let me know if you want this option!

---

**After setting environment variables and redeploying, the 500 error should be fixed! 🚀**

