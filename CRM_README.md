# 🎯 Sales Performance Module - README

## Welcome to Your New CRM System!

A complete sales team performance tracking solution has been added to your Brokerage Management app.

---

## 🚀 Quick Start (5 Minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Database
Go to [Supabase Dashboard](https://app.supabase.com) → SQL Editor:
- Copy contents of `supabase/crm-schema.sql`
- Paste and execute

### 3. Deploy Edge Function
```bash
supabase functions deploy calculate_agent_scores
```

Then set environment variables in Supabase Dashboard → Functions:
- `SUPABASE_URL` = Your project URL
- `SUPABASE_SERVICE_ROLE_KEY` = Service role key (Settings → API)

### 4. Start Development Server
```bash
npm run dev
```

### 5. Access CRM
Navigate to: `http://localhost:3000/crm/sales`

---

## 📋 What You Got

### Pages
- `/crm/sales` - Manage sales agents
- `/crm/logs` - Record daily performance
- `/crm/settings` - Configure KPI targets & weights
- `/crm/report` - View performance reports & leaderboard

### Features
✅ Agent management (add/edit/delete)  
✅ Daily performance logging  
✅ Automated monthly score calculation (0-100)  
✅ Performance leaderboard with rankings  
✅ Charts (bar & radar)  
✅ CSV export  
✅ Dark/Light mode  
✅ Fully responsive  
✅ Multi-user support with RLS  

### Important Note
**Leads count is for context only and does NOT affect scoring!**  
Look for the ℹ️ tooltip next to "Leads" in the logging form.

---

## 🎓 First-Time Workflow

### Step 1: Configure Settings
Go to `/crm/settings`:
- Set work hours (default: 09:30 - 18:30)
- Set targets:
  - Calls per day: 120
  - Meetings per day: 2
  - Sales per month: 2,000,000 EGP
- Adjust weights (must sum to 100):
  - Attendance: 25%
  - Calls: 25%
  - Behavior: 20%
  - Meetings: 15%
  - Sales: 15%

### Step 2: Add Agents
Go to `/crm/sales`:
- Click "Add Agent"
- Enter name and phone
- Mark as active
- Save

### Step 3: Log Daily Performance
Go to `/crm/logs`:
- Select agent
- Choose date
- Record:
  - Check-in/out times
  - Calls made
  - Leads (context only!)
  - Meetings held
  - Sales amount (EGP)
  - Appearance score (0-10)
  - Ethics score (0-10)
  - Notes (optional)
- Save

**Tip**: Log daily for best results!

### Step 4: Calculate & View Reports
Go to `/crm/report`:
- Select month/year
- Click "Calculate Scores"
- View:
  - KPI overview cards
  - Performance leaderboard
  - Charts
  - Export CSV

---

## 📊 Scoring Breakdown

Your agents are scored 0-100 based on 5 components:

| Component | Default Weight | Calculation |
|-----------|----------------|-------------|
| Attendance | 25% | Punctuality (late/early penalties) |
| Calls | 25% | Daily calls vs target |
| Behavior | 20% | Appearance + ethics scores |
| Meetings | 15% | Daily meetings vs target |
| Sales | 15% | Monthly sales vs target |

**Note**: Weights are configurable in settings (must sum to 100).

---

## 📚 Documentation

### Comprehensive Guides
- **`CRM_MODULE_DOCUMENTATION.md`** - Full documentation (40+ pages)
- **`CRM_QUICKSTART.md`** - Quick start guide
- **`CRM_MODULE_SUMMARY.md`** - Implementation summary
- **`setup-crm.sh`** - Automated setup script

### Quick Reference

**Database Tables**:
- `sales_agents` - Team members
- `agent_kpi_settings` - Configuration
- `agent_daily_logs` - Daily records
- `agent_monthly_scores` - Calculated scores

**Key Files**:
- Pages: `app/crm/[sales|logs|settings|report]/page.tsx`
- Components: `components/crm/*.tsx`
- Edge Function: `supabase/functions/calculate_agent_scores/index.ts`
- Types: `lib/types.ts`

---

## 🔧 Troubleshooting

### "Failed to calculate scores"
- Check Edge Function deployment
- Verify environment variables in Supabase
- Check Edge Function logs in dashboard

### Weights won't save
- Ensure all weights sum to exactly 100
- Try: 25 + 25 + 20 + 15 + 15 = 100

### No agents showing
- Verify you're signed in
- Check that agents have `is_active = true`

### Charts not rendering
- Calculate scores first
- Ensure at least one agent has logs
- Check browser console for errors

---

## 🎨 Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **UI**: shadcn/ui, Radix UI, Framer Motion
- **Charts**: Recharts
- **Backend**: Supabase (PostgreSQL + RLS + Edge Functions)
- **Auth**: Supabase Auth
- **Timezone**: Africa/Cairo

---

## 🔒 Security

✅ **Row-Level Security** on all tables  
✅ **Multi-tenant safe** (users can only see their data)  
✅ **Authentication required** for all CRM pages  
✅ **Input validation** on frontend and database  
✅ **Type safety** with TypeScript  

---

## 🆘 Need Help?

1. Check documentation files (especially `CRM_QUICKSTART.md`)
2. Review troubleshooting section above
3. Check Supabase Dashboard logs
4. Inspect browser console for errors

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Can access `/crm/sales`
- [ ] Can add an agent
- [ ] Can log daily performance
- [ ] Can configure settings (weights sum to 100)
- [ ] Can calculate scores
- [ ] Leaderboard displays correctly
- [ ] Charts render properly
- [ ] CSV export works
- [ ] Dark/light mode toggle works
- [ ] Mobile view is responsive

---

## 🎉 You're All Set!

Your Sales Performance Module is ready to use. Start by:

1. ✅ Configuring your KPI settings
2. ✅ Adding your sales team
3. ✅ Logging daily performance
4. ✅ Calculating monthly scores
5. ✅ Analyzing team performance

**Happy tracking!** 📈

---

**Built with ❤️ for the Egyptian real estate market** 🇪🇬

**Questions? Check the full documentation in `CRM_MODULE_DOCUMENTATION.md`**

