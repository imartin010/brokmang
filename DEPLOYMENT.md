# Deployment Guide

## Prerequisites

Before deploying, ensure you have:
- A Supabase project set up
- Node.js 18+ installed locally
- Supabase CLI installed (`npm i -g supabase`)
- A GitHub account
- A Vercel account

## Step-by-Step Deployment

### 1. Supabase Setup

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully provisioned
3. Note your project reference ID from the project URL

#### Set Up Database
1. Navigate to SQL Editor in your Supabase dashboard
2. Copy the contents of `supabase/schema.sql`
3. Paste and run the SQL in the SQL Editor
4. Verify the `break_even_records` table was created in the Table Editor

#### Get Your API Keys
1. Go to Project Settings → API
2. Copy your:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - `anon` `public` key (NOT the service_role key for frontend!)

### 2. Deploy Edge Function

#### Login to Supabase CLI
```bash
npx supabase login
```

#### Link to Your Project
```bash
npx supabase link --project-ref your-project-ref
```

Replace `your-project-ref` with your actual project reference ID.

#### Set Edge Function Secrets
```bash
# Set the Supabase URL
npx supabase secrets set SUPABASE_URL=https://your-project-ref.supabase.co

# Set the service role key (find in Project Settings → API → service_role key)
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

⚠️ **Important**: The service_role key should ONLY be used in Edge Functions (server-side). Never expose it in your frontend code!

#### Deploy the Function
```bash
npx supabase functions deploy calculate --no-verify-jwt
```

Verify deployment:
```bash
npx supabase functions list
```

### 3. Local Development Setup

#### Clone and Install
```bash
cd "Brokerage Management"
npm install
```

#### Configure Environment Variables
1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Edit `.env.local` with your actual Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
```

#### Run Locally
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended)

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit: Brokerage Break-Even Analyzer"
git branch -M main
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure the project:
   - Framework Preset: Next.js (auto-detected)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   
6. Add Environment Variables:
   - Click "Environment Variables"
   - Add:
     ```
     NEXT_PUBLIC_SUPABASE_URL = https://your-project-ref.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key
     ```
   - Make sure these are set for Production, Preview, and Development

7. Click "Deploy"

#### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# Deploy to production
vercel --prod
```

### 5. Post-Deployment Verification

1. **Test the deployed app**:
   - Visit your Vercel URL
   - Try creating an account (Auth page)
   - Test the calculation on the Analyze page
   - Save a scenario and check the History page

2. **Verify Edge Function**:
   ```bash
   curl -X POST https://your-project-ref.supabase.co/functions/v1/calculate \
     -H "Content-Type: application/json" \
     -d '{
       "agents": 20,
       "team_leaders": 3,
       "rent": 4500,
       "salary": 8000,
       "team_leader_share": 3000,
       "others": 1200,
       "marketing": 13000,
       "sim": 750,
       "franchise_owner_salary": 200000,
       "gross_rate": 0.04,
       "agent_comm_per_1m": 5000,
       "tl_comm_per_1m": 2500,
       "withholding": 0.05,
       "vat": 0.14,
       "income_tax": 0.1
     }'
   ```

3. **Check Supabase Logs**:
   - Go to Supabase Dashboard → Edge Functions → Logs
   - Verify function executions are successful

### 6. Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Click Settings → Domains
3. Add your custom domain
4. Follow Vercel's instructions to configure DNS

## Environment Variables Reference

### Frontend (Next.js) - .env.local
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...  # anon/public key only!
```

### Backend (Edge Functions) - Supabase Secrets
```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...  # service_role key - server only!
```

## Troubleshooting

### Edge Function Not Working
- Check Edge Function logs in Supabase dashboard
- Verify secrets are set: `npx supabase secrets list`
- Re-deploy: `npx supabase functions deploy calculate --no-verify-jwt`

### Build Fails on Vercel
- Check environment variables are set correctly
- Ensure both env vars are added to Vercel
- Check build logs for specific errors

### Auth Not Working
- Verify Supabase URL and anon key are correct
- Check Supabase Auth settings (email confirmations, etc.)
- Verify RLS policies are enabled on tables

### Database Errors
- Verify SQL schema was run successfully
- Check RLS policies in Supabase dashboard
- Test queries in SQL Editor

## Monitoring

### Vercel Analytics
1. In Vercel dashboard, go to Analytics
2. Enable Web Analytics for performance monitoring

### Supabase Monitoring
1. Check Database → Logs for database queries
2. Check Edge Functions → Logs for function executions
3. Monitor Auth → Users for sign-ups

## Security Checklist

- [ ] Service role key is ONLY in Edge Function secrets
- [ ] Anon key is used for frontend
- [ ] RLS policies are enabled on all tables
- [ ] Environment variables are not committed to git
- [ ] .env.local is in .gitignore
- [ ] Auth email confirmation is enabled (optional)

## Performance Optimization

1. **Enable Vercel Edge Cache**:
   - Static pages are automatically cached
   - API routes cache at edge

2. **Database Indexes**:
   - Indexes on user_id and created_at are already added in schema

3. **Image Optimization**:
   - Next.js automatically optimizes images

## Need Help?

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Discord](https://discord.supabase.com)

