# 📚 Sales Performance Module - Documentation Index

Complete documentation for the CRM / Sales Performance module.

---

## 🚀 Getting Started

### New Users Start Here

1. **[CRM_README.md](./CRM_README.md)** ⭐ START HERE
   - Quick overview
   - 5-minute setup guide
   - First-time workflow
   - Troubleshooting basics
   - Verification checklist

2. **[CRM_QUICKSTART.md](./CRM_QUICKSTART.md)**
   - Detailed step-by-step setup
   - Prerequisites checklist
   - Common issues and fixes
   - Default values reference
   - Next steps after setup

3. **[setup-crm.sh](./setup-crm.sh)**
   - Automated setup script
   - Interactive installation
   - Dependency checks
   - Database and Edge Function setup guide

---

## 📖 Complete Documentation

### Comprehensive Guides

4. **[CRM_MODULE_DOCUMENTATION.md](./CRM_MODULE_DOCUMENTATION.md)** 📘 FULL DOCS
   - **40+ pages** of detailed documentation
   - Complete feature overview
   - Database schema with SQL
   - Scoring logic with formulas
   - API reference
   - UI guide for all pages
   - Setup instructions
   - Edge cases and validation
   - TypeScript types reference
   - Troubleshooting guide
   - Security details (RLS)
   - File structure
   - Future enhancements

### Implementation Details

5. **[CRM_MODULE_SUMMARY.md](./CRM_MODULE_SUMMARY.md)** 📊 SUMMARY
   - Implementation overview
   - Completed deliverables checklist
   - File structure tree
   - UI/UX features
   - Security features
   - Scoring algorithm breakdown
   - Testing checklist
   - Deployment checklist
   - Key learnings
   - Statistics (LOC, files created, etc.)

### Architecture & Design

6. **[CRM_ARCHITECTURE.md](./CRM_ARCHITECTURE.md)** 🏗️ ARCHITECTURE
   - System architecture diagram
   - Data flow diagrams
   - Component hierarchy
   - Database relationships (ERD)
   - Security layers
   - Edge Function architecture
   - Scoring algorithm flowchart
   - UI state management
   - API integration points
   - Timezone handling
   - Performance considerations
   - Deployment architecture

### Customization

7. **[CRM_CUSTOMIZATION_GUIDE.md](./CRM_CUSTOMIZATION_GUIDE.md)** 🎨 CUSTOMIZE
   - Change KPI weights
   - Adjust targets
   - Add new KPI components
   - Exclude weekends
   - Change timezone
   - Add team management
   - Add performance history
   - Add PDF export
   - Add email notifications
   - Customize behavior scores
   - Bulk import logs
   - Change scoring scale
   - Add comments/feedback
   - Real-time updates
   - Example: Weekly scoring

---

## 📁 Code Files

### Database

- **[supabase/crm-schema.sql](./supabase/crm-schema.sql)**
  - Complete database schema
  - 4 tables with RLS policies
  - Indexes and constraints
  - Helper functions

### Edge Function

- **[supabase/functions/calculate_agent_scores/index.ts](./supabase/functions/calculate_agent_scores/index.ts)**
  - Score calculation logic
  - Timezone handling
  - KPI calculations
  - Error handling

### Frontend Pages

- **[app/crm/sales/page.tsx](./app/crm/sales/page.tsx)**
  - Agent management page
  - Add/edit/delete agents

- **[app/crm/logs/page.tsx](./app/crm/logs/page.tsx)**
  - Daily logging page
  - Performance metrics form

- **[app/crm/settings/page.tsx](./app/crm/settings/page.tsx)**
  - KPI configuration page
  - Targets and weights

- **[app/crm/report/page.tsx](./app/crm/report/page.tsx)**
  - Performance reports page
  - Leaderboard and charts

### API Routes

- **[app/api/crm/calculate-scores/route.ts](./app/api/crm/calculate-scores/route.ts)**
  - API route for score calculation
  - Calls Edge Function

### Components

#### CRM-Specific

- **[components/crm/agent-form-dialog.tsx](./components/crm/agent-form-dialog.tsx)**
  - Agent add/edit modal

- **[components/crm/agents-table.tsx](./components/crm/agents-table.tsx)**
  - Agent listing table

- **[components/crm/daily-log-form.tsx](./components/crm/daily-log-form.tsx)**
  - Daily performance log form

- **[components/crm/leaderboard.tsx](./components/crm/leaderboard.tsx)**
  - Performance leaderboard

- **[components/crm/kpi-overview-cards.tsx](./components/crm/kpi-overview-cards.tsx)**
  - KPI summary cards

#### UI Components

- **[components/ui/dialog.tsx](./components/ui/dialog.tsx)**
- **[components/ui/select.tsx](./components/ui/select.tsx)**
- **[components/ui/table.tsx](./components/ui/table.tsx)**
- **[components/ui/tooltip.tsx](./components/ui/tooltip.tsx)**

### Types

- **[lib/types.ts](./lib/types.ts)**
  - TypeScript type definitions
  - Extended with CRM types

### Navigation

- **[components/navbar.tsx](./components/navbar.tsx)**
  - Updated with CRM links

---

## 🎯 Quick Reference by Task

### I want to...

#### Set up the module for the first time
→ Read: [CRM_README.md](./CRM_README.md)  
→ Run: `./setup-crm.sh`

#### Understand the scoring algorithm
→ Read: [CRM_MODULE_DOCUMENTATION.md](./CRM_MODULE_DOCUMENTATION.md) (Scoring Logic section)  
→ View diagram: [CRM_ARCHITECTURE.md](./CRM_ARCHITECTURE.md) (Scoring Algorithm Flowchart)

#### Customize KPI weights or targets
→ Read: [CRM_CUSTOMIZATION_GUIDE.md](./CRM_CUSTOMIZATION_GUIDE.md) (Section 1-2)  
→ Or: Use Settings page in UI

#### Add a new KPI component
→ Read: [CRM_CUSTOMIZATION_GUIDE.md](./CRM_CUSTOMIZATION_GUIDE.md) (Section 4)

#### Understand the architecture
→ Read: [CRM_ARCHITECTURE.md](./CRM_ARCHITECTURE.md)

#### Troubleshoot an issue
→ Read: [CRM_README.md](./CRM_README.md) (Troubleshooting section)  
→ Or: [CRM_MODULE_DOCUMENTATION.md](./CRM_MODULE_DOCUMENTATION.md) (Troubleshooting section)

#### Deploy to production
→ Read: [CRM_MODULE_SUMMARY.md](./CRM_MODULE_SUMMARY.md) (Deployment Checklist)

#### Export data
→ Use Export CSV button on Report page  
→ For PDF: Read [CRM_CUSTOMIZATION_GUIDE.md](./CRM_CUSTOMIZATION_GUIDE.md) (Section 9)

#### Change timezone
→ Read: [CRM_CUSTOMIZATION_GUIDE.md](./CRM_CUSTOMIZATION_GUIDE.md) (Section 6)

#### Exclude weekends from calculations
→ Read: [CRM_CUSTOMIZATION_GUIDE.md](./CRM_CUSTOMIZATION_GUIDE.md) (Section 5)

#### Understand database schema
→ Read: [CRM_MODULE_DOCUMENTATION.md](./CRM_MODULE_DOCUMENTATION.md) (Database Schema section)  
→ View: [supabase/crm-schema.sql](./supabase/crm-schema.sql)  
→ Diagram: [CRM_ARCHITECTURE.md](./CRM_ARCHITECTURE.md) (Database Relationships)

#### Learn about security
→ Read: [CRM_MODULE_DOCUMENTATION.md](./CRM_MODULE_DOCUMENTATION.md) (Row-Level Security)  
→ Or: [CRM_MODULE_SUMMARY.md](./CRM_MODULE_SUMMARY.md) (Security Features)  
→ Diagram: [CRM_ARCHITECTURE.md](./CRM_ARCHITECTURE.md) (Security Layers)

#### See what was built
→ Read: [CRM_MODULE_SUMMARY.md](./CRM_MODULE_SUMMARY.md) (Completed Deliverables)

---

## 📊 Documentation Statistics

| Document | Pages | Purpose | Audience |
|----------|-------|---------|----------|
| CRM_README | 2 | Quick start | All users |
| CRM_QUICKSTART | 3 | Setup guide | New users |
| CRM_MODULE_DOCUMENTATION | 40+ | Complete reference | All users |
| CRM_MODULE_SUMMARY | 8 | Implementation overview | Developers |
| CRM_ARCHITECTURE | 12 | Technical design | Developers |
| CRM_CUSTOMIZATION_GUIDE | 10 | Modification guide | Developers |
| setup-crm.sh | 1 | Automated setup | All users |

**Total**: ~76 pages of documentation!

---

## 🎓 Learning Path

### For End Users (Non-Technical)

1. Start with **CRM_README.md**
2. Follow **CRM_QUICKSTART.md** for setup
3. Use the UI pages (refer to documentation as needed)

### For Developers (Technical)

1. Read **CRM_README.md** for overview
2. Review **CRM_MODULE_SUMMARY.md** to see what was built
3. Study **CRM_ARCHITECTURE.md** to understand design
4. Reference **CRM_MODULE_DOCUMENTATION.md** for details
5. Use **CRM_CUSTOMIZATION_GUIDE.md** when modifying

### For DevOps (Deployment)

1. Review **CRM_MODULE_SUMMARY.md** (Deployment Checklist)
2. Run `setup-crm.sh` or follow manual steps
3. Verify all pages load correctly
4. Set up monitoring (Edge Function logs, database)

---

## ⚠️ Important Notes

### Leads Count
**IMPORTANT**: Leads count is tracked for context only and does **NOT** affect scoring calculations. This is clearly marked in the UI with tooltips.

### Timezone
The module uses **Africa/Cairo** timezone by default. To change, see [CRM_CUSTOMIZATION_GUIDE.md](./CRM_CUSTOMIZATION_GUIDE.md).

### Security
All tables use Row-Level Security (RLS). Users can only access their own data.

### Weights
KPI weights must always sum to exactly 100. The UI validates this in real-time.

---

## 🔗 External Resources

### Technologies Used

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Recharts Docs](https://recharts.org)
- [Framer Motion Docs](https://www.framer.com/motion)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs)

### Helpful Links

- [PostgreSQL Date/Time Functions](https://www.postgresql.org/docs/current/functions-datetime.html)
- [RLS in Supabase](https://supabase.com/docs/guides/auth/row-level-security)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [React Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)

---

## 📞 Support

### Troubleshooting Order

1. Check **CRM_README.md** troubleshooting section
2. Review **CRM_MODULE_DOCUMENTATION.md** troubleshooting section
3. Check Supabase Dashboard logs (Edge Functions)
4. Check browser console for errors
5. Verify database schema matches `crm-schema.sql`

### Common Questions

**Q: How do I change the scoring weights?**  
A: Go to `/crm/settings` page in the UI, or see Customization Guide Section 1.

**Q: Why aren't leads affecting the score?**  
A: By design! Leads are context-only. See the ℹ️ tooltip in the logging form.

**Q: Can I add my own KPI?**  
A: Yes! See [CRM_CUSTOMIZATION_GUIDE.md](./CRM_CUSTOMIZATION_GUIDE.md) Section 4.

**Q: How do I exclude weekends?**  
A: See [CRM_CUSTOMIZATION_GUIDE.md](./CRM_CUSTOMIZATION_GUIDE.md) Section 5.

**Q: Can I change from monthly to weekly scoring?**  
A: Yes! See example at end of [CRM_CUSTOMIZATION_GUIDE.md](./CRM_CUSTOMIZATION_GUIDE.md).

---

## 🎉 Conclusion

You now have access to comprehensive documentation covering every aspect of the Sales Performance Module:

✅ **Setup guides** for quick installation  
✅ **Complete documentation** for reference  
✅ **Architecture diagrams** for understanding  
✅ **Customization guides** for modifications  
✅ **Troubleshooting** for problem-solving  

Choose the right document for your needs using the guide above, and happy tracking! 📈

---

**Last Updated**: October 27, 2025  
**Version**: 1.0.0  
**Module**: Sales Performance / CRM  
**Built for**: Brokerage Management Application  
**Timezone**: Africa/Cairo 🇪🇬

