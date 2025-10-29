# 🚀 Quick Start: GitHub + Vercel Setup

**5-minute guide to get your app deployed!**

---

## ⚡ **Quick Steps**

### 1️⃣ **Create GitHub Repository**

```bash
# Go to GitHub and create a new repository:
# https://github.com/new
# - Name: brokmang (or your choice)
# - Visibility: Private (recommended)
# - DO NOT initialize with README

# Then connect your local repo:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

---

### 2️⃣ **Connect to Vercel**

1. Go to [vercel.com](https://vercel.com) and **"Continue with GitHub"**
2. Click **"Add New..."** → **"Project"**
3. Find your `brokmang` repo and click **"Import"**

---

### 3️⃣ **Add Environment Variables**

⚠️ **BEFORE clicking "Deploy"**, add these in Vercel:

| Variable | Where to Get It |
|----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role key |

📝 **Check all 3 environments**: Production ✅ Preview ✅ Development ✅

---

### 4️⃣ **Deploy!**

Click **"Deploy"** and wait ~2 minutes 🎉

---

## ✅ **You're Done!**

Your app will be live at: `https://your-project.vercel.app`

**Every push to `main` = automatic production deployment!**

---

## 📖 **Full Guide**

See `VERCEL_DEPLOYMENT.md` for detailed instructions and troubleshooting.

---

## 🔐 **Get Your Supabase Keys**

1. Go to [app.supabase.com](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ (secret!)

---

**Need help?** Check `VERCEL_DEPLOYMENT.md` or Vercel logs.

