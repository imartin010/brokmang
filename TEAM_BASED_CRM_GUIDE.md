# 🎯 Team-Based CRM System - Complete Guide

## 📋 Overview

Your CRM system now features a **comprehensive team-based hierarchy** with full performance analytics at every level:

- 📊 Team-level KPI aggregation
- 👥 Individual agent performance tracking
- 📈 Visual charts and graphs
- 🔍 Drill-down navigation from team → agents → detailed analytics

---

## 🚀 Features

### 1. **Team-Based Dashboard** (`/crm/sales`)

**New Layout:**
- Teams displayed as **cards** (2-column grid on desktop)
- Each card shows:
  - 👑 Team Leader info (name, phone)
  - 👤 List of agents with their scores
  - 📊 Team average KPIs (progress bars)
  - 📈 Overall team score
  - 🔗 Click to view team or agent details

**Empty States:**
- No agents → Prompt to add first agent
- No team leaders → Prompt to create team leader
- No scores → Message about adding daily logs

**Unassigned Agents Section:**
- Shows agents without team leaders
- Quick assign button

---

### 2. **Team Detail Page** (`/crm/teams/[teamLeaderId]`)

**What You See:**
- Team leader profile (name, phone, role)
- Team stats cards:
  - Team member count
  - Average score
  - Top performer
  - Current period

**Charts & Analytics:**
1. **Radar Chart** - Team average performance across all KPIs
2. **Bar Chart** - Agent comparison (overall scores)
3. **Agent Cards** - Grid showing each agent with their individual KPIs

**Navigation:**
- Click any agent card → Go to agent detail page
- Back button → Return to teams

---

### 3. **Agent Detail Page** (`/crm/agents/[agentId]`)

**Comprehensive Analytics:**

**Header:**
- Agent profile (name, phone)
- Performance badge (Excellent, Very Good, Good, Fair, Needs Improvement)
- Overall score (large display)
- Team leader info (who they report to)

**Stats Cards:**
- Total calls (month)
- Total meetings (month)
- Total sales (K EGP)
- Total leads (context only)

**Charts & Visualizations:**
1. **Radar Chart** - Performance breakdown across all 5 KPIs
2. **KPI Score Bars** - Color-coded progress bars for each KPI
3. **Daily Activity Trend** - Area chart showing calls, meetings, sales over time
4. **Recent Activity** - List of last 10 daily logs

---

## 📊 KPI System

### 5 Key Performance Indicators:

| KPI | Icon | Color | Description |
|-----|------|-------|-------------|
| **Attendance** | 🎯 Target | Blue | Punctuality and presence |
| **Calls** | 📞 Phone | Green | Call volume performance |
| **Behavior** | ⭐ Star | Purple | Appearance + Ethics |
| **Meetings** | 👥 Users | Cyan | Meeting attendance |
| **Sales** | 💰 DollarSign | Orange | Sales achievement |

**Scoring:**
- Each KPI: 0-100%
- Overall Score: Weighted average
- Color-coded: Green (80+), Blue (60-80), Yellow (40-60), Red (<40)

---

## 🎨 Visual Design

### Team Cards
```
┌─────────────────────────────────────┐
│ 👑 Team Leader Name                  │
│ 📞 Phone                             │
│                     [View Details →] │
├─────────────────────────────────────┤
│ Team Members (3)                     │
│                                      │
│ 👤 Agent 1           85.5% →        │
│ 👤 Agent 2           78.2% →        │
│ 👤 Agent 3           92.1% →        │
│                                      │
│ Team Average Performance             │
│                           87.6%      │
│                                      │
│ 🎯 Attendance  ████████░░  85%      │
│ 📞 Calls       ███████░░░  75%      │
│ 👥 Meetings    ██████████  95%      │
│ 💰 Sales       ████████░░  82%      │
│                                      │
│ [View Detailed Analytics]            │
└─────────────────────────────────────┘
```

### Performance Badges
- **90%+**: Green "Excellent"
- **80-89%**: Blue "Very Good"
- **70-79%**: Cyan "Good"
- **60-69%**: Yellow "Fair"
- **<60%**: Red "Needs Improvement"

---

## 🔄 Navigation Flow

```
/crm/sales (Team Dashboard)
    │
    ├─→ Click Team Card → /crm/teams/[teamLeaderId]
    │                           │
    │                           └─→ Click Agent Card → /crm/agents/[agentId]
    │
    └─→ Click Agent Name → /crm/agents/[agentId]
```

---

## 📈 Chart Types

### 1. **Radar Chart** (Pentagon)
- Shows all 5 KPIs at once
- Used in: Team detail, Agent detail
- Great for: Holistic performance view

### 2. **Bar Chart**
- Compare agents side-by-side
- Used in: Team detail
- Great for: Team competition view

### 3. **Area Chart**
- Show daily trends over time
- Used in: Agent detail
- Great for: Tracking progress

### 4. **Progress Bars**
- Individual KPI scores
- Used in: All pages
- Great for: Quick visual reference

---

## 🎯 Use Cases

### For Managers

**1. Team Overview**
- Go to `/crm/sales`
- See all teams at a glance
- Identify underperforming teams
- Compare team averages

**2. Team Deep Dive**
- Click on a team card
- See team radar chart
- Compare agents in the team
- Identify top/bottom performers

**3. Agent Coaching**
- Click on an agent
- See detailed performance breakdown
- Review daily activity trends
- Check recent logs

---

### For Team Leaders

**1. Check Your Team**
- Your team card shows on `/crm/sales`
- See your agents' scores
- Monitor team average

**2. Review Agent Performance**
- Click any agent in your team
- See their full analytics
- Identify areas for improvement

---

### For Admins

**1. Assign Agents to Teams**
- Use the "Unassigned Agents" section
- Click "Assign" button
- Select team leader in the form

**2. Add New Team Leaders**
- Click "Add Agent"
- Select role: "Team Leader"
- Create team leader first

**3. Add Agents to Teams**
- Click "Add Agent"
- Select role: "Agent"
- Choose team leader from dropdown

---

## 🔧 Technical Details

### File Structure

```
/app/crm/
├── sales/
│   └── page.tsx              # Team dashboard (main view)
├── teams/
│   └── [teamLeaderId]/
│       └── page.tsx          # Team detail page
└── agents/
    └── [agentId]/
        └── page.tsx          # Agent detail page

/components/crm/
├── team-card.tsx             # Team card component
├── agent-form-dialog.tsx     # Agent create/edit form
└── agents-table.tsx          # Legacy table view
```

### Data Flow

```javascript
// Load teams
teams = teamLeaders.map(leader => ({
  leader,
  agents: agents.filter(a => a.team_leader_id === leader.id)
}));

// Load scores (current month)
const now = new Date();
scores = await supabase
  .from("agent_monthly_scores")
  .select("*")
  .eq("year", now.getFullYear())
  .eq("month", now.getMonth() + 1);

// Calculate team average
avgScore = teamScores.reduce((sum, s) => sum + s.score, 0) / teamScores.length;
```

### Database Queries

**Team Dashboard:**
- `sales_agents` - All agents and team leaders
- `agent_monthly_scores` - Current month scores

**Team Detail Page:**
- `sales_agents` - Team leader + agents
- `agent_monthly_scores` - Scores for all team members

**Agent Detail Page:**
- `sales_agents` - Agent + team leader
- `agent_monthly_scores` - Agent's monthly score
- `agent_daily_logs` - All logs for current month

---

## 📊 Performance Calculation

### Team Average
```javascript
const teamAgentIds = agents.map(a => a.id);
const teamScores = scores.filter(s => teamAgentIds.includes(s.agent_id));

const avgScore = teamScores.reduce((sum, s) => sum + Number(s.score), 0) / teamScores.length;

const avgAttendance = teamScores.reduce((sum, s) => sum + s.kpis.attendance_month, 0) / teamScores.length;
// ... same for other KPIs
```

### Individual KPIs
See `CRM_MODULE_DOCUMENTATION.md` for detailed scoring formulas.

---

## 🎨 Color Scheme

| Element | Color | Usage |
|---------|-------|-------|
| Team Leader | Amber/Gold | Crown icon, borders |
| Agent | Blue | User icon, cards |
| Attendance | Blue | Progress bars, charts |
| Calls | Green | Progress bars, charts |
| Behavior | Purple | Progress bars, charts |
| Meetings | Cyan | Progress bars, charts |
| Sales | Orange | Progress bars, charts |

---

## 📱 Responsive Design

- **Desktop (1024px+)**: 2-column grid for teams
- **Tablet (768px-1023px)**: 2-column grid (stacked on smaller)
- **Mobile (<768px)**: 1-column stack

All charts are responsive using `ResponsiveContainer` from Recharts.

---

## 🚀 Quick Start

### Step 1: Create Team Leaders
```
1. Go to /crm/sales
2. Click "Add Agent"
3. Name: "John Smith"
4. Role: "Team Leader"
5. Save
```

### Step 2: Create Agents
```
1. Click "Add Agent" again
2. Name: "Jane Doe"
3. Role: "Agent"
4. Team Leader: Select "John Smith"
5. Save
```

### Step 3: Add Daily Logs
```
1. Go to /crm/logs
2. Select agent
3. Fill in performance data
4. Save log
```

### Step 4: Calculate Scores
```
1. Go to /crm/report
2. Select month/year
3. Click "Calculate Scores"
4. Wait for success message
```

### Step 5: View Analytics
```
1. Go to /crm/sales
2. See your teams with KPIs
3. Click team card → See team analytics
4. Click agent → See detailed agent analytics
```

---

## 💡 Tips & Best Practices

### 1. **Organize by Team Leader First**
Create team leaders before adding agents to ensure proper hierarchy.

### 2. **Regular Daily Logs**
Add daily logs consistently for accurate KPI tracking.

### 3. **Monthly Score Calculation**
Calculate scores at the end of each month to see team/agent rankings.

### 4. **Review Team Performance Weekly**
Use team detail pages to monitor progress and identify issues early.

### 5. **Individual Coaching**
Use agent detail pages for one-on-one performance reviews.

### 6. **Compare Agents Fairly**
Use the bar chart on team detail pages to see side-by-side comparisons.

### 7. **Track Trends**
Use the daily activity chart to spot patterns and improvements.

---

## 🐛 Troubleshooting

### Team cards showing no data?
**Solution**: Calculate monthly scores first (`/crm/report` → Calculate Scores)

### Agent not showing in team?
**Solution**: Check that `team_leader_id` is set correctly (edit agent → select team leader)

### Scores showing 0%?
**Solution**: Add daily logs for the current month

### Charts not displaying?
**Solution**: Ensure monthly scores are calculated and data exists

### Unassigned agents?
**Solution**: Edit agent and select a team leader from the dropdown

---

## 📚 Related Documentation

- `CRM_MODULE_DOCUMENTATION.md` - Full CRM system docs
- `AGENTS_ROLE_AND_TEAM_LEADER_GUIDE.md` - Role & team setup
- `CRM_QUICKSTART.md` - Quick setup guide

---

## 🎉 Summary

You now have a **complete team-based CRM system** with:

✅ **Team Dashboard** - See all teams at a glance with KPIs
✅ **Team Detail Pages** - Deep dive into team performance
✅ **Agent Detail Pages** - Individual performance analytics
✅ **Visual Charts** - Radar, bar, area, and progress charts
✅ **Smart Navigation** - Drill down from teams → agents → details
✅ **Real-time KPIs** - Current month performance tracking
✅ **Responsive Design** - Works on all devices
✅ **Beautiful UI** - Color-coded, intuitive interface

**Ready to manage your sales teams like a pro!** 🚀

