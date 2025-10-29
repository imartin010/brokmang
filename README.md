# Real Estate Brokerage Break-Even Analyzer

A production-ready web application for analyzing real estate brokerage break-even points with detailed financial insights, built with Next.js 15, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Features

- **Interactive Dashboard**: Real-time KPI cards showing cost per seat, total operating costs, net revenue per million, and break-even sales
- **Custom Analysis Tool**: Comprehensive form with all business parameters and instant calculations
- **Scenario Management**: Save, view, export (CSV), and delete analysis scenarios
- **Beautiful UI**: Modern glass-morphism design with light/dark mode toggle
- **Animated Charts**: Interactive pie and line charts using Recharts
- **Secure Authentication**: Supabase Auth with Row Level Security
- **Edge Functions**: Server-side calculations using Supabase Edge Functions (Deno)

## 📊 Business Logic

### Default Configuration
- **All Input Fields**: Start at **0** - Users must enter their own business data
- **Fixed Tax Rates** (Non-editable):
  - Withholding Tax: 5% (0.05)
  - VAT: 14% (0.14)
- **Income Tax**: Default 7% (Editable, range: 7-12%)

### Calculation Formulas

```typescript
cost_per_seat = rent + salary + team_leader_share + others + marketing + sim
total_operating_cost = (cost_per_seat × agents) + franchise_owner_salary
gross_revenue = sales × gross_rate
commissions_total = (agent_comm_per_1m + tl_comm_per_1m) × (sales / 1_000_000)
taxes_total = gross_revenue × (withholding + vat + income_tax)
net_revenue = gross_revenue − commissions_total − taxes_total
net_rev_per_1m = (1_000_000 × gross_rate) − (agent_comm_per_1m + tl_comm_per_1m) − (1_000_000 × gross_rate × (withholding + vat + income_tax))
break_even_sales = total_operating_cost / (net_rev_per_1m / 1_000_000)
```

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Framer Motion (animations)
- **Charts**: Recharts
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Validation**: Zod
- **Icons**: Lucide React

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Supabase CLI (for Edge Functions deployment)

### 1. Clone and Install Dependencies

```bash
cd "Brokerage Management"
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://eamywkblubazqmepaxmm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhbXl3a2JsdWJhenFtZXBheG1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1Njk1MDQsImV4cCI6MjA3NzE0NTUwNH0.cIPNXeNjsLjK76o34KU3uyAMxQcnZ8DSpP6ESRE5GOY
```

### 3. Supabase Database Setup

Run the SQL schema in your Supabase project's SQL Editor:

```bash
# Copy contents of supabase/schema.sql and run in Supabase SQL Editor
# Or use Supabase CLI:
supabase db push
```

The schema creates:
- `break_even_records` table with RLS policies
- Indexes for performance
- Policies for user-specific data access

### 4. Deploy Supabase Edge Function

First, login and link to your Supabase project:

```bash
npx supabase login
npx supabase link --project-ref eamywkblubazqmepaxmm
```

Set the required secrets:

```bash
npx supabase secrets set SUPABASE_URL=https://eamywkblubazqmepaxmm.supabase.co
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhbXl3a2JsdWJhenFtZXBheG1tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTU2OTUwNCwiZXhwIjoyMDc3MTQ1NTA0fQ.wD0a8i9LUSVYvCrzOcyF9hjy5kkXbTda1ViMNCys8eU
```

Deploy the function:

```bash
npx supabase functions deploy calculate --no-verify-jwt
```

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🌐 Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Real Estate Brokerage Break-Even Analyzer"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

Vercel will automatically detect Next.js and configure the build settings.

## 📱 Application Routes

- **`/`** - Dashboard with default parameters and visualizations
- **`/analyze`** - Interactive form for custom analysis
- **`/history`** - Saved scenarios (requires authentication)
- **`/auth`** - Sign in/Sign up page

## 🔒 Security Notes

⚠️ **Important**: The provided "anon key" in the requirements appears to be a `service_role` key. For production:

1. Use the actual `anon` key for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Keep `service_role` key **only** in Supabase Edge Function secrets
3. Never expose `service_role` key in client-side code
4. Consider rotating keys after testing

## 🎨 UI Features

- **Glass-morphism Design**: Modern, translucent card effects
- **Gradient Accents**: Blue to orange gradient (#257CFF → #F45A2A)
- **Dark Mode**: Automatic theme detection with manual toggle
- **Animated Components**: Framer Motion animations for smooth UX
- **Responsive Layout**: Mobile-first design that works on all devices
- **Interactive Charts**: Hover tooltips, legends, and animated transitions

## 📊 Data Export

Export scenarios to CSV format with complete input parameters and calculated results. Perfect for reporting and record-keeping.

## 🧪 Validation

All inputs are validated using Zod schemas:
- Agents: minimum 1
- Team leaders: non-negative
- All costs: non-negative
- Income tax: 7-12% (0.07-0.12)
- Rates: 0-1 (percentages as decimals)

## 📝 License

MIT

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 👤 Author

Built with ❤️ as a production-ready tool for real estate brokerage financial analysis.

---

**Need Help?** Check the [Supabase Docs](https://supabase.com/docs) or [Next.js Docs](https://nextjs.org/docs) for more information.

