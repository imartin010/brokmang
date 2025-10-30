# 👥 User Account Types Guide

## Overview

Brokmang. now supports two account types with different access levels:
- **CEO / Business Owner**: Full access to all features including financial tools
- **Team Leader / Sales Manager**: Access to sales performance and KPI tools only

---

## 🎯 Account Types

### CEO / Business Owner
**Full Access** - All features unlocked:
- ✅ Break-Even Analysis
- ✅ Financial Reports & Planning
- ✅ Sales Performance & KPIs
- ✅ AI Smart Insights
- ✅ Agent Management
- ✅ Full Organization Settings
- ✅ Team Management
- ✅ Audit Logs

### Team Leader / Sales Manager
**Sales-Focused Access** - Performance tools only:
- ❌ Break-Even Analysis (Restricted)
- ❌ Analysis History (Restricted)
- ✅ Sales Performance Tracking
- ✅ KPI Monitoring & Scores
- ✅ Agent Daily Logs
- ✅ AI Smart Insights
- ✅ Team Performance Reports
- ✅ Agent Management
- ✅ Limited Org Settings

---

## 🚀 Setup Process

### Step 1: Run Database Migration

Execute the SQL script in Supabase Dashboard:

```sql
-- File: supabase/add-user-type.sql
```

1. Go to Supabase Dashboard → SQL Editor
2. Copy & paste the script
3. Click Run

This creates:
- `user_type` column in `sales_agents` table
- Helper function `get_user_type()`
- Database index for performance

### Step 2: Deploy Code

The code changes are already in place:
- User type selection component
- Account type page
- API routes for saving type
- Auth callback redirect
- Navigation filtering
- Page-level access control

### Step 3: Test the Flow

1. Create a new account
2. Confirm email
3. See account type selection screen
4. Choose CEO or Team Leader
5. Access appropriate features

---

## 📋 User Journey

### New User Signup Flow

```
1. Sign Up (email/password)
   ↓
2. Email Confirmation
   ↓
3. Account Type Selection ← NEW!
   ↓
4. Dashboard (with appropriate access)
```

### Account Type Selection Screen

Beautiful UI with two cards:
- **CEO Card**: Purple gradient, crown icon
- **Team Leader Card**: Blue gradient, users icon

Each shows:
- Title & description
- List of available features
- Visual selection indicator

---

## 🔒 Access Control

### Frontend (Navigation)

**Navbar automatically hides restricted items:**

```typescript
// CEO sees:
- Home
- Dashboard
- Break-Even Analysis ✓
- Analysis History ✓
- Reports
- AI Insights

// Team Leader sees:
- Home
- Dashboard
- Reports
- AI Insights
```

### Page-Level Protection

**Restricted pages show access denied screen:**

`/analyze` and `/history` check user type:
- CEO → Full access
- Team Leader → Blocked with friendly message

**Access Denied Screen includes:**
- Lock icon
- Clear explanation
- Alternative action buttons

### Backend (API)

All API routes respect user type:
- RLS policies enforce data isolation
- User type stored in database
- Service role for admin operations

---

## 🛠️ Technical Details

### Database Schema

```sql
-- New column in sales_agents
user_type user_account_type NULL DEFAULT NULL

-- Enum type
CREATE TYPE user_account_type AS ENUM ('ceo', 'team_leader');
```

### TypeScript Types

```typescript
export type UserAccountType = 'ceo' | 'team_leader';

export type SalesAgent = {
  ...
  user_type?: UserAccountType | null;
  ...
};
```

### Zustand Store

```typescript
interface AuthSlice {
  userAccountType: UserAccountType | null;
  setUserAccountType: (type: UserAccountType | null) => void;
  isCEO: () => boolean;
  isTeamLeader: () => boolean;
  hasFinancialAccess: () => boolean;
}
```

### API Endpoints

**POST** `/api/user/set-type`
- Sets user account type
- Validates type value
- Updates database

**GET** `/api/user/set-type?user_id=xxx`
- Fetches current user type
- Returns null if not set

---

## 🎨 UI/UX Features

### Selection Screen
- ✨ Animated cards with hover effects
- 🎯 Clear visual selection indicator
- 📱 Responsive (mobile-friendly)
- 🌙 Dark mode support
- ⚡ Instant feedback

### Access Denied Screen
- 🔒 Friendly lock icon
- 📝 Clear explanation of restrictions
- 🎯 Alternative action buttons
- 🎨 Consistent with app design

### Navigation
- 🎯 Conditional link rendering
- ⚡ Real-time type detection
- 🔄 Auto-updates on type change
- 📊 Clean, organized menu

---

## 🧪 Testing Scenarios

### Test 1: New CEO Signup
1. Sign up with new email
2. Confirm email
3. Select "CEO / Business Owner"
4. Verify you can access `/analyze`
5. Verify navbar shows all links

### Test 2: New Team Leader Signup
1. Sign up with new email
2. Confirm email
3. Select "Team Leader / Sales Manager"
4. Try to access `/analyze` → See access denied
5. Verify navbar hides financial links

### Test 3: Existing Users
1. Existing users see type = null
2. Redirected to selection on next login
3. After selection, full access granted

---

## 📝 Configuration

### Default Behavior
- New users: Must select type
- Existing users: NULL → prompted to select
- No type set: Redirected to selection page

### Customization

**Change available features:**

Edit `components/user-type-selector.tsx`:

```typescript
const userTypes = [
  {
    type: "ceo",
    features: [
      "Your custom features here...",
    ],
  },
  //...
];
```

**Add new account type:**

1. Update enum in SQL
2. Add to TypeScript types
3. Update selector component
4. Add access control logic

---

## 🔄 Migration for Existing Users

### Option 1: Auto-Assign (Recommended for small teams)

```sql
-- Set all existing users as CEO
UPDATE sales_agents
SET user_type = 'ceo'
WHERE user_type IS NULL;
```

### Option 2: Prompt on Login (Recommended for large teams)

Leave as-is. Users will be prompted on next login to select their type.

### Option 3: Manual Assignment

```sql
-- Set specific user as team leader
UPDATE sales_agents
SET user_type = 'team_leader'
WHERE user_id = 'specific-user-id';
```

---

## 🚨 Troubleshooting

### Issue: User not redirected to selection page

**Solution**: Check auth callback logic

```typescript
// In app/auth/callback/page.tsx
if (!agent?.user_type) {
  router.push("/select-account-type");
}
```

### Issue: Navbar still shows restricted links

**Solution**: Verify user type is loaded in store

```typescript
// Check in browser console
useAuth.getState().userAccountType // Should be 'ceo' or 'team_leader'
```

### Issue: Access denied screen not showing

**Solution**: Ensure page-level protection is active

```typescript
if (!hasFinancialAccess() && userAccountType === "team_leader") {
  // Show access denied
}
```

---

## 📊 Analytics & Insights

### Track User Types

```sql
-- Count by type
SELECT user_type, COUNT(*) 
FROM sales_agents 
WHERE is_active = true
GROUP BY user_type;
```

### Monitor Access Patterns

```sql
-- Find users without type
SELECT user_id, name, created_at
FROM sales_agents
WHERE user_type IS NULL;
```

---

## 🎯 Best Practices

1. **Assign Appropriate Types**
   - CEOs: Business owners, executives
   - Team Leaders: Managers, supervisors

2. **Review Periodically**
   - Audit user types quarterly
   - Update as roles change
   - Remove inactive users

3. **Communicate Clearly**
   - Explain access differences
   - Provide alternatives (Reports instead of Analysis)
   - Offer upgrade path if needed

4. **Test Access Control**
   - Verify restrictions work
   - Test from different accounts
   - Check all protected pages

---

## 🔐 Security Considerations

### Data Isolation
- RLS policies enforce separation
- Team leaders can't see financials
- Each type has appropriate permissions

### Audit Trail
- User type changes logged
- Access attempts tracked
- Failed access recorded

### Best Practices
- ✅ Principle of least privilege
- ✅ Role-based access control
- ✅ Regular access reviews
- ✅ Clear permission boundaries

---

## ✅ Success Checklist

- [ ] Database migration completed
- [ ] Code deployed to production
- [ ] Existing users assigned types
- [ ] New signup flow tested
- [ ] Access restrictions verified
- [ ] Navigation filtering confirmed
- [ ] Team informed of changes
- [ ] Documentation shared

---

## 🎉 You're Ready!

Your Brokmang. platform now supports:
- ✅ Flexible account types
- ✅ Granular access control
- ✅ Beautiful selection experience
- ✅ Secure page protection
- ✅ Conditional navigation

Both CEOs and Team Leaders can now use the platform with appropriate access levels! 🚀

---

*Generated: October 30, 2025*
*Brokmang. v1.2 - User Account Types*

