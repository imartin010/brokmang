# 📘 Brokmang. - Complete Website Documentation

## 🎯 What is Brokmang?

**Brokmang.** is a comprehensive, production-ready **Real Estate Brokerage Management Platform** designed to help real estate brokerages manage their operations, analyze financial performance, track sales team performance, and make data-driven business decisions.

**Version:** 1.1.0-beta (Phase-2)  
**Status:** 🟢 Production-Ready  
**Built with:** Next.js 15, TypeScript, Supabase, Tailwind CSS

---

## 🏢 Core Purpose

Brokmang helps real estate brokerages:
1. **Understand their financial health** through break-even analysis
2. **Manage sales teams** and track agent performance
3. **Monitor KPIs** and generate performance reports
4. **Make informed decisions** with AI-powered insights
5. **Scale operations** with multi-tenant architecture

---

## 📦 Main Features & Modules

### 1. 💰 Financial Break-Even Analysis

**What it does:** Calculates exactly how much sales revenue a brokerage needs to cover all operating costs and break even.

**Key Features:**
- **Real-time KPI Dashboard** - Shows cost per seat, total operating costs, net revenue per 1M EGP, and break-even sales amount
- **Interactive Calculator** - Adjust parameters and see results instantly:
  - Number of agents and team leaders
  - Rent, salaries, marketing costs
  - Commission rates
  - Tax calculations (withholding, VAT, income tax)
- **Visual Charts** - Pie charts showing revenue distribution and line charts for tax sensitivity analysis
- **Scenario Management** - Save different financial scenarios, compare them, and export to CSV
- **Historical Analysis** - View all saved scenarios with timestamps

**Who uses it:** CEOs and owners to understand financial requirements and plan budgets

**Routes:**
- `/` - Landing page with overview
- `/analyze` - Interactive break-even calculator
- `/history` - View all saved financial scenarios

---

### 2. 👥 Sales Team Management (CRM Module)

**What it does:** Manages sales agents, tracks their daily performance, and calculates monthly performance scores automatically.

**Key Features:**

#### Agent Management
- Add, edit, and manage sales agents and team leaders
- Organize agents into teams and branches
- Activate/deactivate agents
- View agent profiles with performance history

#### Daily Performance Logging
- Record daily activities for each agent:
  - Check-in/check-out times (attendance)
  - Number of calls made
  - Number of leads generated (context only, not scored)
  - Number of meetings conducted
  - Sales amount (EGP)
  - Appearance score (0-10)
  - Ethics score (0-10)
  - Notes and observations

#### Automated Performance Scoring
- **5 KPI Categories** with configurable weights:
  1. **Attendance (25%)** - Based on check-in/out times vs workday schedule
  2. **Calls (25%)** - Daily calls vs target (default: 120 calls/day)
  3. **Behavior (20%)** - Appearance + ethics scores average
  4. **Meetings (15%)** - Daily meetings vs target (default: 2 meetings/day)
  5. **Sales (15%)** - Monthly sales vs target (default: 2M EGP/month)
- **Monthly Score (0-100)** calculated automatically
- Performance leaderboards and rankings
- Detailed agent performance pages with charts

#### KPI Configuration
- Customize targets and weights per organization
- Set workday hours (default: 9:30 AM - 6:30 PM)
- Adjust commission rates

**Who uses it:** Team leaders, managers, and owners to track team performance

**Routes:**
- `/crm/sales` - Manage agents and teams
- `/crm/logs` - Log daily agent activities
- `/crm/report` - View performance reports and calculate monthly scores
- `/crm/agents/[agentId]` - Individual agent performance dashboard
- `/crm/teams/[teamLeaderId]` - Team performance overview
- `/crm/settings` - Configure KPI targets and weights

---

### 3. 🏢 Multi-Tenant Organization Management

**What it does:** Allows multiple brokerage organizations to use the platform with complete data isolation.

**Key Features:**
- **Organization Hierarchy:**
  - Organizations → Branches → Teams → Agents
- **Complete Data Isolation** - Each organization only sees their own data
- **Organization Switching** - Users with multiple memberships can switch between organizations
- **Per-Organization Settings:**
  - Financial settings (rent per seat, salaries, commissions, tax rates)
  - KPI targets and weights
  - Branding customization
  - Member management

**Who uses it:** All users (each organization has isolated data)

**Routes:**
- `/onboarding` - 7-step wizard to set up new organization
- `/org/settings` - Manage organization settings, branding, and members

---

### 4. 🔐 Role-Based Access Control (RBAC)

**What it does:** Controls what each user can see and do based on their role in the organization.

**5 User Roles:**

1. **OWNER** 👑
   - Full access to everything
   - Manage organization settings
   - Validate subscription payments
   - View audit logs

2. **ADMIN** 🛡️
   - Manage members and teams
   - View all reports and data
   - Validate subscription payments
   - Cannot delete organization

3. **TEAM_LEADER** 👥
   - Manage their own team members
   - View team performance data
   - Log daily activities for team members
   - Cannot access financial analysis (break-even tool)

4. **ACCOUNTANT** 📊
   - View financial data and reports
   - Update financial settings
   - Cannot manage agents or teams

5. **AGENT** 📝
   - View own performance data
   - Cannot see other agents' data
   - Limited access to reports

**40+ Granular Permissions** control access to:
- Organizations, branches, teams
- Agents and daily logs
- Financial data
- Reports and insights
- Subscriptions
- Audit logs

**Who uses it:** All users (access is automatically restricted based on role)

---

### 5. 🔔 Notification System

**What it does:** Sends real-time notifications for important events and alerts.

**Notification Types:**
- **MISSED_LOG** - Agent hasn't logged daily activity
- **KPI_ALERT** - Performance metrics below target
- **TAX_REMINDER** - Tax deadline reminders
- **BREAK_EVEN_WARNING** - Financial thresholds reached
- **SYSTEM** - General system notifications (subscriptions, validations, etc.)

**Features:**
- Real-time updates via Supabase subscriptions
- Notification badge showing unread count
- Dropdown in navbar for quick access
- Full notification center page
- Mark as read/unread
- Filter by type
- Delete notifications

**Who uses it:** All users receive relevant notifications

**Routes:**
- `/notifications` - Full notification center

---

### 6. 🤖 AI-Powered Smart Insights

**What it does:** Uses OpenAI GPT-4o-mini to analyze performance data and provide actionable insights.

**Key Features:**
- **Real-time AI Analysis** of:
  - Agent performance trends
  - Month-over-month changes
  - Top and bottom performers
  - Break-even and financial targets
  - Daily activity patterns
- **Confidence Scores** (0-100%) for each insight
- **Actionable Recommendations** with specific reasons
- **Early Warnings** for performance drops
- **Top Performer Identification**

**Subscription Required:**
- CEO Plan: 100 EGP/month
- Team Leader Plan: 50 EGP/month
- Payment via InstaPay
- Admin validation required

**Who uses it:** CEOs and team leaders (requires active subscription)

**Routes:**
- `/insights` - AI Smart Insights dashboard

---

### 7. 📊 Reports & Analytics

**What it does:** Generates comprehensive reports for analysis and decision-making.

**Report Types:**
- **Monthly Performance Report** - Agent and team performance summary
- **Financial Summary Report** - Financial metrics and break-even analysis
- **Team Report** - Team-level performance comparisons

**Features:**
- Generate reports by month
- Filter by branch, team, or agent
- View report history
- PDF export (planned)

**Who uses it:** Managers, owners, and accountants

**Routes:**
- `/reports` - Reports center

---

### 8. 📜 Audit Trail & Compliance

**What it does:** Tracks all system actions for compliance and security auditing.

**Features:**
- **Immutable Logs** - Cannot be edited or deleted
- **40+ Action Types** tracked:
  - Agent creation/deletion
  - Daily log entries
  - Settings changes
  - Member additions/removals
- **Before/After Diffs** - See exactly what changed
- **Metadata Capture:**
  - User who performed action
  - Timestamp
  - IP address
  - User agent
  - Organization context

**Who uses it:** Owners and admins for compliance auditing

**Routes:**
- `/audit` - Audit logs viewer (owner/admin only)

---

### 9. 💳 Subscription Management

**What it does:** Manages AI feature subscriptions with payment validation.

**Features:**
- **User Subscription:**
  - Submit payment via InstaPay
  - Upload payment screenshot
  - Reference transaction ID
- **Admin Validation:**
  - View pending payments
  - Review payment screenshots
  - Approve or reject payments
  - Add admin notes
- **Automatic Activation:**
  - 31-day subscription period
  - Email notifications
  - Status tracking

**Who uses it:**
- Users: Subscribe to AI features
- Admins/Owners: Validate payments

**Routes:**
- `/admin/subscriptions` - Admin payment validation panel
- Modal accessed from `/insights` page

---

### 10. 👤 User Account Management

**What it does:** Manages user accounts, authentication, and profiles.

**Features:**
- **Account Types:**
  - CEO - Full access including financial tools
  - Team Leader - Team management focused
- **Authentication:**
  - Email/password sign up
  - Email confirmation
  - Password reset
  - Secure session management
- **User Profiles:**
  - Store user type and full name
  - Organization memberships
  - Role assignments

**Routes:**
- `/auth/signin` - Sign in page
- `/auth/signup` - Sign up page
- `/auth/reset-password` - Password reset
- `/select-role` - Choose account type (CEO or Team Leader)

---

## 🔄 User Workflows

### First-Time User (New Brokerage)

1. **Sign Up** → Create account with email/password
2. **Email Confirmation** → Verify email address
3. **Select Role** → Choose CEO or Team Leader account type
4. **Onboarding Wizard** (7 steps):
   - Step 1: Create organization (name, slug)
   - Step 2: Add branches (office locations)
   - Step 3: Create teams
   - Step 4: Add agents and team leaders
   - Step 5: Configure KPI settings (targets, weights)
   - Step 6: Set financial settings (costs, commissions, taxes)
   - Step 7: Review and confirm
5. **Dashboard** → Start using the platform

### Daily Usage (Team Leader)

1. **Log Daily Activities** → Record agent check-ins, calls, meetings, sales
2. **View Team Performance** → See how team is performing
3. **Generate Reports** → Create monthly performance reports
4. **View Insights** → Get AI-powered recommendations (if subscribed)

### Daily Usage (CEO/Owner)

1. **Financial Analysis** → Calculate break-even points for business planning
2. **Monitor Performance** → View agent and team performance
3. **Validate Subscriptions** → Approve AI feature payments
4. **View Reports** → Generate and export business reports
5. **Review Audit Logs** → Check system activity for compliance

### Monthly Workflow (Manager)

1. **Review Daily Logs** → Ensure all agents logged activities
2. **Calculate Monthly Scores** → Generate performance scores for the month
3. **View Reports** → Analyze team performance trends
4. **Identify Top Performers** → Reward high-performing agents
5. **Address Underperformers** → Provide coaching and support

---

## 🗺️ Complete Route Map

### Public/Auth Routes
- `/` - Landing page
- `/auth/signin` - Sign in
- `/auth/signup` - Sign up
- `/auth/reset-password` - Password reset
- `/auth/callback` - Email confirmation callback
- `/select-role` - Choose account type

### Main Application Routes
- `/dashboard` - Role-based dashboard (CEO or Team Leader)
- `/onboarding` - 7-step organization setup wizard

### Financial Analysis Routes
- `/analyze` - Break-even calculator (CEO only)
- `/history` - Saved financial scenarios (CEO only)

### CRM/Sales Routes
- `/crm/sales` - Agent and team management
- `/crm/logs` - Daily activity logging
- `/crm/report` - Performance reports and score calculation
- `/crm/agents/[agentId]` - Individual agent dashboard
- `/crm/teams/[teamLeaderId]` - Team performance overview
- `/crm/settings` - KPI configuration

### Organization Routes
- `/org/settings` - Organization settings, branding, members

### Feature Routes
- `/insights` - AI Smart Insights (requires subscription)
- `/reports` - Reports center
- `/notifications` - Notification center
- `/audit` - Audit logs (owner/admin only)

### Admin Routes
- `/admin/subscriptions` - Subscription payment validation

---

## 🎯 Business Value

### For Brokerage Owners/CEOs
- **Financial Clarity** - Understand exact break-even requirements
- **Performance Visibility** - See which agents and teams are performing
- **Data-Driven Decisions** - Make informed choices based on real data
- **Scalability** - Manage multiple branches and teams
- **Compliance** - Complete audit trail for regulations

### For Team Leaders
- **Team Management** - Track and manage team members efficiently
- **Performance Monitoring** - See how team members are performing
- **Automated Scoring** - No manual calculations needed
- **Insights** - AI-powered recommendations (with subscription)

### For Sales Agents
- **Self-Service** - View own performance data
- **Transparency** - Understand how performance is measured
- **Goal Tracking** - See progress toward targets

### For Accountants
- **Financial Data Access** - View all financial metrics
- **Report Generation** - Create reports for management
- **Compliance** - Access audit trails

---

## 🔒 Security & Privacy

- **Row-Level Security (RLS)** - Database-level access control
- **JWT Authentication** - Secure token-based auth
- **Multi-Tenant Isolation** - Complete data separation between organizations
- **Role-Based Permissions** - Granular access control
- **Audit Logging** - Track all system changes
- **HTTPS Only** - Secure data transmission

---

## 📱 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 15 (App Router) | React-based UI with SSR |
| **Language** | TypeScript | Type-safe development |
| **Styling** | Tailwind CSS | Modern, responsive design |
| **UI Components** | shadcn/ui + Framer Motion | Components & animations |
| **Charts** | Recharts | Data visualization |
| **Backend** | Supabase | BaaS platform |
| **Database** | PostgreSQL | Data persistence |
| **Auth** | Supabase Auth + RLS | Secure authentication |
| **AI** | OpenAI GPT-4o-mini | Smart insights |
| **State** | Zustand | Client-side state management |
| **Validation** | Zod | Runtime validation |

---

## 🚀 Getting Started

### For End Users
1. Visit the website
2. Click "Sign Up" and create an account
3. Verify your email
4. Select your role (CEO or Team Leader)
5. Complete the onboarding wizard
6. Start using the platform!

### For Developers
See `README.md` for installation and setup instructions.

---

## 📞 Support & Contact

For questions or support, refer to:
- `README.md` - Technical documentation
- `QUICKSTART.md` - Quick start guide
- `DEPLOYMENT.md` - Deployment instructions

---

**Built with ❤️ for Real Estate Brokerages**

*Last Updated: January 2025*

