# Quick Start Guide

Get the Real Estate Brokerage Break-Even Analyzer running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works!)

## 🚀 Quick Setup (5 minutes)

### 1. Install Dependencies (1 min)

```bash
cd "Brokerage Management"
npm install
```

### 2. Set Up Supabase (2 mins)

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for it to finish setting up
3. In Supabase dashboard, go to SQL Editor
4. Copy & paste the contents of `supabase/schema.sql` and run it

### 3. Configure Environment (1 min)

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Get your Supabase credentials:
   - In Supabase: Settings → API
   - Copy "Project URL" and "anon public" key

3. Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Deploy Edge Function (1 min)

```bash
# Login to Supabase
npx supabase login

# Link to your project
npx supabase link --project-ref your-project-ref

# Set secrets (get service_role key from Supabase Settings → API)
npx supabase secrets set SUPABASE_URL=https://your-project.supabase.co
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Deploy function
npx supabase functions deploy calculate --no-verify-jwt
```

### 5. Run the App!

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## What You Can Do

### Without Signing In
- ✅ View the Dashboard with default calculations
- ✅ Use the Analyze tool to customize parameters
- ✅ See real-time calculations and charts

### After Signing In (Create account on /auth page)
- ✅ Save scenarios to your account
- ✅ View your saved scenarios in History
- ✅ Export scenarios to CSV
- ✅ Delete old scenarios

## Test It Out

### Try the Dashboard
1. Go to `/` (home page)
2. See KPI cards with default calculations
3. Explore the cost breakdown and tax sensitivity charts

### Customize Analysis
1. Go to `/analyze`
2. Adjust any parameters:
   - Number of agents
   - Costs per agent
   - Commission rates
   - Tax rates (7-12% for income tax)
3. Click "Calculate"
4. See updated results and charts

### Save Scenarios (requires auth)
1. Create an account at `/auth`
2. Go to `/analyze` and make calculations
3. Click "Save Scenario"
4. View saved scenarios at `/history`

## Default Business Parameters

The app comes pre-configured with realistic defaults:

| Parameter | Default Value |
|-----------|--------------|
| Agents | 20 |
| Team Leaders | 3 |
| Rent per Agent | 4,500 EGP |
| Salary per Agent | 8,000 EGP |
| Marketing per Agent | 13,000 EGP |
| Owner Salary | 200,000 EGP |
| Gross Revenue Rate | 4% |
| Agent Commission/1M | 5,000 EGP |
| TL Commission/1M | 2,500 EGP |

## Key Calculations

The app calculates:
- **Cost Per Seat**: Monthly cost per agent
- **Total Operating Cost**: All monthly expenses
- **Net Revenue Per 1M**: Profit per 1M EGP in sales
- **Break-Even Sales**: Sales needed to cover costs

## Troubleshooting

### Build Fails
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Edge Function Errors
```bash
# Check function logs
npx supabase functions logs calculate

# Verify secrets
npx supabase secrets list

# Redeploy
npx supabase functions deploy calculate --no-verify-jwt
```

### Auth Not Working
- Check that your Supabase URL and anon key are correct
- Verify the SQL schema was run successfully
- Make sure email confirmation is disabled in Supabase Auth settings (for testing)

### Environment Variables Missing
- Make sure `.env.local` exists and has both variables
- Restart the dev server after changing env vars
- For production, set env vars in Vercel dashboard

## Next Steps

1. **Customize**: Adjust default values in `lib/schemas.ts`
2. **Deploy**: Follow `DEPLOYMENT.md` for production deployment
3. **Extend**: Add new features (see `CONTRIBUTING.md`)

## Need Help?

- 📖 Full docs: See `README.md`
- 🚀 Deployment: See `DEPLOYMENT.md`
- 🤝 Contributing: See `CONTRIBUTING.md`
- 💬 Issues: Open a GitHub issue

## Production Checklist

Before deploying to production:
- [ ] Set up your own Supabase project
- [ ] Update environment variables
- [ ] Deploy Edge Function
- [ ] Test all features
- [ ] Enable email confirmations in Supabase
- [ ] Set up custom domain (optional)
- [ ] Enable Vercel analytics (optional)

Enjoy building with the Break-Even Analyzer! 🎉

