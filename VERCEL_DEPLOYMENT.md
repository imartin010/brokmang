# 🚀 Vercel Deployment Guide

Complete step-by-step guide to deploy Brokmang. to Vercel with GitHub integration.

---

## 📋 **Prerequisites**

✅ Node.js 18+ installed locally  
✅ GitHub account  
✅ Vercel account ([sign up here](https://vercel.com/signup))  
✅ Supabase project set up with database schema deployed  

---

## 🎯 **Step 1: Initialize Git Repository**

### 1.1 Initialize Git

```bash
git init
```

### 1.2 Create Initial Commit

```bash
git add .
git commit -m "Initial commit: Brokmang. Phase-2 complete"
```

---

## 🐙 **Step 2: Create GitHub Repository**

### 2.1 Create Repository on GitHub

1. Go to [github.com](https://github.com) and sign in
2. Click **"New repository"** (or go to https://github.com/new)
3. Repository settings:
   - **Name**: `brokmang` (or your preferred name)
   - **Description**: `Real Estate Brokerage Management SaaS - Multi-tenant platform`
   - **Visibility**: 
     - ✅ **Private** (recommended for SaaS projects)
     - ⚠️ **Public** (if you want it open-source)
   - **Initialize**: ❌ DO NOT check "Add a README" (we already have one)
4. Click **"Create repository"**

### 2.2 Connect Local Repository to GitHub

GitHub will show you commands. Run these (replace `YOUR_USERNAME` and `YOUR_REPO_NAME`):

```bash
# Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Rename main branch (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

**Example:**
```bash
git remote add origin https://github.com/johndoe/brokmang.git
git branch -M main
git push -u origin main
```

---

## ⚡ **Step 3: Connect to Vercel**

### 3.1 Sign In to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"** or **"Log In"**
3. **Choose "Continue with GitHub"** (recommended for automatic deployments)

### 3.2 Import Your GitHub Repository

1. In Vercel dashboard, click **"Add New..."** → **"Project"**
2. You'll see a list of your GitHub repositories
3. Find and click **"Import"** next to your `brokmang` repository
4. Vercel will auto-detect Next.js configuration ✅

### 3.3 Configure Project Settings

#### **Project Name**
- Auto-filled: `brokmang`
- You can change it if desired

#### **Framework Preset**
- Should auto-detect: **"Next.js"** ✅
- **Root Directory**: `./` (leave as default)

#### **Build Settings**
- **Build Command**: `npm run build` (auto-filled)
- **Output Directory**: `.next` (auto-filled)
- **Install Command**: `npm install` (auto-filled)

⚠️ **DO NOT click "Deploy" yet!** We need to add environment variables first.

---

## 🔐 **Step 4: Configure Environment Variables**

### 4.1 Get Your Supabase Credentials

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy these values:

#### **Frontend Variables** (safe to expose)
- **Project URL**: `https://xxxxx.supabase.co`
- **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

#### **Backend Variable** (secret!)
- **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
  - ⚠️ **IMPORTANT**: This should NEVER be exposed in frontend code!
  - It's only used in server-side API routes

### 4.2 Add Variables to Vercel

In the Vercel import screen (before deploying):

1. Scroll down to **"Environment Variables"** section
2. Click **"Add"** for each variable:

   | Variable Name | Value | Environment |
   |--------------|-------|-------------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | ✅ Production<br>✅ Preview<br>✅ Development |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` (anon key) | ✅ Production<br>✅ Preview<br>✅ Development |
   | `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...` (service_role key) | ✅ Production<br>✅ Preview<br>✅ Development |

   **How to add:**
   - Click **"Add Another"** for each variable
   - Enter variable name
   - Paste the value
   - Check all three environments (Production, Preview, Development)
   - Click **"Save"**

### 4.3 Optional: Add Sentry (if configured)

If you've set up Sentry error tracking:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `NEXT_PUBLIC_SENTRY_DSN` | `https://xxx@sentry.io/xxx` | ✅ Production<br>✅ Preview |

---

## 🚀 **Step 5: Deploy!**

1. After adding all environment variables
2. Click **"Deploy"** button
3. Vercel will:
   - Clone your repository
   - Install dependencies (`npm install`)
   - Build the app (`npm run build`)
   - Deploy to production

4. **Wait ~2-3 minutes** for build to complete

---

## ✅ **Step 6: Verify Deployment**

### 6.1 Check Build Logs

1. In Vercel dashboard, click on your deployment
2. Check **"Build Logs"** for any errors
3. Look for: ✅ **"Build Completed"**

### 6.2 Visit Your Live Site

1. Vercel provides a URL: `https://brokmang.vercel.app` (or your custom name)
2. Click it to open your deployed app
3. Test key features:
   - ✅ Home page loads
   - ✅ Sign up/login works
   - ✅ Dashboard loads data from Supabase
   - ✅ Onboarding wizard works

### 6.3 Test Environment Variables

Your app should:
- ✅ Connect to Supabase (check Network tab in browser DevTools)
- ✅ Authenticate users successfully
- ✅ Load data from database

---

## 🔄 **Step 7: Automatic Deployments (Already Set Up!)**

Vercel automatically sets up:

### **Automatic Deployments**
- **Every push to `main` branch** → Deploys to **Production**
- **Every pull request** → Creates a **Preview** deployment
- **Every commit** → Triggers a new deployment

### **How It Works**

1. Make changes locally
2. Commit and push:
   ```bash
   git add .
   git commit -m "Fix notification bug"
   git push origin main
   ```
3. Vercel automatically:
   - Detects the push
   - Clones latest code
   - Builds and deploys
   - Updates your production URL

4. You'll receive an email when deployment completes! 📧

---

## 🌐 **Step 8: Custom Domain (Optional)**

### 8.1 Add Custom Domain in Vercel

1. In Vercel dashboard, go to your project
2. Click **"Settings"** → **"Domains"**
3. Enter your domain: `brokmang.com` (or any domain you own)
4. Click **"Add"**

### 8.2 Configure DNS

Vercel will show you DNS records to add:

1. Go to your domain registrar (e.g., Namecheap, GoDaddy)
2. Add DNS records:
   - **Type**: `A` or `CNAME`
   - **Name**: `@` or `www`
   - **Value**: Provided by Vercel
3. Wait 24-48 hours for DNS propagation

---

## 📊 **Step 9: Monitor Your Deployment**

### 9.1 Vercel Dashboard

- **Overview**: See deployment history, visits, bandwidth
- **Analytics**: Track page views, visitors (requires upgrade)
- **Logs**: View server logs and errors
- **Functions**: Monitor Edge Functions (if used)

### 9.2 Check for Errors

1. Go to **"Deployments"** tab
2. Click on a deployment
3. Check **"Functions"** tab for API route logs
4. Check browser console for frontend errors

---

## 🔧 **Troubleshooting**

### ❌ **Build Fails**

**Error**: `Module not found` or `Type errors`

**Solution**:
1. Check build logs in Vercel dashboard
2. Fix TypeScript/lint errors locally:
   ```bash
   npm run type-check
   npm run lint
   ```
3. Commit and push again

---

### ❌ **404 Errors**

**Error**: Pages not found or API routes return 404

**Solution**:
1. Check `next.config.ts` for routing issues
2. Verify file paths match Next.js App Router conventions
3. Check Vercel build logs for route detection

---

### ❌ **Supabase Connection Failed**

**Error**: `Failed to fetch` or database errors

**Solution**:
1. ✅ Verify environment variables are set in Vercel:
   - Go to **Settings** → **Environment Variables**
   - Ensure all three environments have the variables
2. ✅ Check Supabase URL is correct (no trailing slash)
3. ✅ Verify anon key is correct (not service_role key)
4. ✅ Check Supabase dashboard → API → CORS settings (should allow your Vercel domain)

---

### ❌ **Authentication Not Working**

**Error**: Can't sign up or log in

**Solution**:
1. Check Supabase Auth settings:
   - Supabase Dashboard → Authentication → Providers
   - Ensure Email provider is enabled
2. Verify RLS policies are enabled:
   - Supabase Dashboard → Database → Policies
3. Check Supabase logs:
   - Dashboard → Logs → Auth Logs

---

### ❌ **API Routes Return 500**

**Error**: Server-side routes fail

**Solution**:
1. Check `SUPABASE_SERVICE_ROLE_KEY` is set correctly
2. Verify API route code doesn't expose service_role key to frontend
3. Check Vercel Function logs:
   - Deployment → Functions tab → Logs

---

## 📝 **Environment Variables Reference**

### **Required for Production**

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

### **Optional**

```env
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

## 🎯 **Quick Deploy Checklist**

- [ ] ✅ Git repository initialized
- [ ] ✅ Code pushed to GitHub
- [ ] ✅ Vercel account created
- [ ] ✅ Repository imported to Vercel
- [ ] ✅ Environment variables added (all 3)
- [ ] ✅ Build completed successfully
- [ ] ✅ Site accessible at Vercel URL
- [ ] ✅ Authentication works
- [ ] ✅ Database connection works
- [ ] ✅ Custom domain configured (optional)

---

## 🔗 **Useful Links**

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Vercel Docs**: https://vercel.com/docs
- **Supabase Dashboard**: https://app.supabase.com
- **GitHub Repository**: https://github.com/YOUR_USERNAME/brokmang

---

## 📞 **Need Help?**

1. Check Vercel build logs
2. Check Supabase dashboard logs
3. Review this guide section by section
4. Check Vercel documentation: https://vercel.com/docs

---

**🎉 Congratulations! Your app is now live on Vercel!**

Every push to `main` will automatically deploy to production.

