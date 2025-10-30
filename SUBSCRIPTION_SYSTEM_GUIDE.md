# 💳 AI Subscription System Guide

## Overview

Brokmang. now has a **paid subscription system** for AI features. Users can access the platform for free, but AI Smart Insights require a monthly subscription.

### Pricing
- **Team Leader / Sales Manager**: 50 EGP/month
- **CEO / Business Owner**: 100 EGP/month

### Payment Method
- **InstaPay** (Egyptian payment system)
- Manual admin validation
- 31-day subscription period

---

## 🚀 Quick Setup

### Step 1: Run Database Migration

```bash
# In Supabase Dashboard → SQL Editor
# Copy & paste: supabase/subscription-system.sql
# Click Run
```

This creates:
- `subscriptions` table
- `subscription_payments` table
- Helper functions
- RLS policies
- Admin views

### Step 2: Add QR Code Image

1. Place `IMG_30FF121DDFA3-1.jpeg` in the `public/` folder
2. This QR code will be shown in the payment modal

### Step 3: Configure Cron Secret

Add to Vercel environment variables:
```
CRON_SECRET=your-secure-random-string
```

### Step 4: Deploy Code

```bash
git add -A
git commit -m "feat: Add AI subscription system"
git push origin main
```

### Step 5: Set Up Cron Job

**Option A: Vercel Cron** (Recommended)
1. Go to Vercel Dashboard → Your Project → Settings → Cron Jobs
2. Add new cron:
   - Path: `/api/cron/subscription-check`
   - Schedule: `0 0 * * *` (Daily at midnight)
   - Add header: `Authorization: Bearer YOUR_CRON_SECRET`

**Option B: External Cron** (e.g., cron-job.org)
1. Set up daily job to call:
   ```
   POST https://your-domain.com/api/cron/subscription-check
   Header: Authorization: Bearer YOUR_CRON_SECRET
   ```

---

## 📋 User Flow

### New User Wants AI

```
1. Visit /insights
   ↓
2. See paywall (locked AI features)
   ↓
3. Click "Subscribe Now - XX EGP/month"
   ↓
4. Payment modal opens
   ↓
5. Click "Open InstaPay" or scan QR code
   ↓
6. Send payment via InstaPay
   ↓
7. Enter payment reference/transaction ID
   ↓
8. Upload screenshot (optional)
   ↓
9. Submit payment
   ↓
10. See "Payment Pending" status
    ↓
11. Admin validates payment
    ↓
12. User receives notification
    ↓
13. AI features activated for 31 days
```

### Admin Validates Payment

```
1. Receive notification: "New Payment to Validate"
   ↓
2. Go to admin panel
   ↓
3. View pending subscriptions
   ↓
4. Check payment reference/screenshot
   ↓
5. Approve or Reject
   ↓
6. User receives notification
   ↓
7. AI features activate (if approved)
```

### Subscription Expires

```
Day 26 (5 days before):
  ↓
Renewal reminder notification sent
  ↓
Day 31:
  ↓
Subscription expires
  ↓
AI features disabled
  ↓
Expiry notification sent
  ↓
User sees paywall again
```

---

## 🔒 Access Control

### Free Features (Always Available)
- ✅ Dashboard
- ✅ Sales Performance & KPIs
- ✅ Agent Management
- ✅ Daily Logs
- ✅ Reports
- ✅ Break-Even Analysis (CEO only)
- ✅ Team Management

### Paid Features (Subscription Required)
- 💳 **AI Smart Insights** - Main paid feature
- 💳 Future AI features can be added

---

## 🎯 Database Schema

### subscriptions Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | User who subscribed |
| org_id | UUID | Organization (optional) |
| user_type | ENUM | 'ceo' or 'team_leader' |
| status | ENUM | 'pending_payment', 'active', 'expired', 'cancelled' |
| amount_egp | INTEGER | 50 or 100 |
| payment_reference | TEXT | Transaction ID |
| payment_screenshot_url | TEXT | Screenshot URL |
| payment_submitted_at | TIMESTAMP | When submitted |
| validated_by | UUID | Admin who validated |
| validated_at | TIMESTAMP | When validated |
| admin_notes | TEXT | Admin comments |
| start_date | TIMESTAMP | Subscription start |
| end_date | TIMESTAMP | Subscription end (31 days) |
| created_at | TIMESTAMP | Record created |

### subscription_payments Table

Audit trail of all payment attempts.

---

## 🔧 API Endpoints

### POST `/api/subscription/create`

Create subscription request after payment.

**Request:**
```json
{
  "user_id": "uuid",
  "org_id": "uuid (optional)",
  "user_type": "ceo" | "team_leader",
  "payment_reference": "TXN12345",
  "payment_screenshot_url": "optional-url"
}
```

**Response:**
```json
{
  "success": true,
  "subscription": { ... },
  "message": "Payment submitted successfully"
}
```

### GET `/api/subscription/status?user_id=uuid`

Check if user has active subscription.

**Response:**
```json
{
  "has_subscription": true,
  "subscription": {
    "id": "uuid",
    "user_type": "ceo",
    "amount_egp": 100,
    "start_date": "2024-11-01",
    "end_date": "2024-12-02",
    "days_remaining": 25
  }
}
```

### POST `/api/subscription/validate`

Admin approves/rejects payment.

**Request:**
```json
{
  "subscription_id": "uuid",
  "admin_user_id": "uuid",
  "action": "approve" | "reject",
  "admin_notes": "optional comment"
}
```

### GET `/api/cron/subscription-check`

Cron job endpoint (requires authorization header).

**Response:**
```json
{
  "success": true,
  "results": {
    "reminders_sent": 3,
    "subscriptions_expired": 2,
    "errors": []
  }
}
```

---

## 🔔 Notifications

### Automatic Notifications

| Event | Title | Sent To |
|-------|-------|---------|
| Payment Submitted | 💳 Payment Submitted | User |
| Pending Validation | 🔔 New Payment to Validate | Admins |
| Payment Approved | ✅ AI Features Activated! | User |
| Payment Rejected | ❌ Payment Not Validated | User |
| 5 Days Before Expiry | ⏰ AI Subscription Expiring in 5 Days | User |
| Subscription Expired | 🔒 AI Features Disabled | User |

### Notification Flow

All notifications are created in the `notifications` table and appear in the NotificationCenter component in the navbar.

---

## 👨‍💼 Admin Panel

### View Pending Validations

```sql
SELECT * FROM pending_subscription_validations;
```

Returns all subscriptions awaiting validation with user email, org name, amount, and submission time.

### View Active Subscriptions

```sql
SELECT * FROM active_subscriptions;
```

Returns all active subscriptions with days remaining.

### View Expiring Soon

```sql
SELECT * FROM expiring_soon_subscriptions;
```

Returns subscriptions expiring within 5 days that need renewal reminders.

### Manual Validation (SQL)

```sql
-- Approve subscription
UPDATE subscriptions
SET status = 'active',
    validated_by = 'admin-user-id',
    validated_at = NOW(),
    start_date = NOW(),
    end_date = NOW() + INTERVAL '31 days'
WHERE id = 'subscription-id';
```

---

## 🧪 Testing

### Test 1: Subscribe as Team Leader

1. Sign up new user
2. Select "Team Leader" account type
3. Go to `/insights`
4. See paywall showing 50 EGP
5. Click "Subscribe Now"
6. Payment modal opens
7. Enter fake transaction ID: "TEST12345"
8. Submit payment
9. See "Payment Pending" status

### Test 2: Admin Approve Payment

1. Sign in as admin
2. Check `pending_subscription_validations` view
3. Call `/api/subscription/validate`:
   ```json
   {
     "subscription_id": "from-step-1",
     "admin_user_id": "admin-id",
     "action": "approve",
     "admin_notes": "Test approval"
   }
   ```
4. User should receive "AI Activated" notification
5. User can now access AI features

### Test 3: Expiry Notification

Manually update subscription end_date to 4 days from now:
```sql
UPDATE subscriptions
SET end_date = NOW() + INTERVAL '4 days'
WHERE id = 'test-subscription-id';
```

Run cron job manually:
```bash
curl -X POST https://your-domain.com/api/cron/subscription-check \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Check that renewal reminder notification was sent.

### Test 4: Auto-Expiry

Set subscription end_date to yesterday:
```sql
UPDATE subscriptions
SET end_date = NOW() - INTERVAL '1 day'
WHERE id = 'test-subscription-id';
```

Run cron job. Verify:
- Status changed to 'expired'
- Expiry notification sent
- User sees paywall again

---

## 🛠️ Customization

### Change Subscription Duration

Default is 31 days. To change:

1. Update in validation API (`app/api/subscription/validate/route.ts`):
```typescript
const end_date = new Date(start_date.getTime() + 31 * 24 * 60 * 60 * 1000); // Change 31
```

2. Update in cron job reminder check (`app/api/cron/subscription-check/route.ts`):
```typescript
fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5); // Days before expiry
```

### Change Pricing

1. Update amounts in validation logic
2. Update UI in payment modal
3. Update database records if needed

### Add More Payment Methods

1. Add new payment method to modal
2. Update database enum if needed
3. Add validation logic for new method

---

## 🐛 Troubleshooting

### Issue: User can't see payment modal

**Solution**: Check that QR code image exists in `public/IMG_30FF121DDFA3-1.jpeg`

### Issue: Admin can't validate payments

**Solution**: Verify admin has `owner` or `admin` role in `memberships` table

### Issue: Cron job not running

**Solution**: 
1. Check Vercel Cron Jobs configuration
2. Verify `CRON_SECRET` environment variable is set
3. Check cron job logs in Vercel Dashboard

### Issue: Notifications not appearing

**Solution**:
1. Check `notifications` table for records
2. Verify `NotificationCenter` component is in navbar
3. Check browser console for errors

### Issue: Subscription shows as expired but user paid

**Solution**: Admin needs to manually re-approve:
```sql
UPDATE subscriptions
SET status = 'active',
    end_date = NOW() + INTERVAL '31 days'
WHERE user_id = 'user-id';
```

---

## 📊 Analytics & Reporting

### Revenue Tracking

```sql
-- Total revenue this month
SELECT SUM(amount_egp) as total_revenue
FROM subscriptions
WHERE status = 'active'
AND DATE_TRUNC('month', start_date) = DATE_TRUNC('month', NOW());
```

### Active Subscribers

```sql
-- Count by user type
SELECT user_type, COUNT(*) as count
FROM subscriptions
WHERE status = 'active'
AND end_date > NOW()
GROUP BY user_type;
```

### Conversion Rate

```sql
-- % of users who subscribed
SELECT 
  (SELECT COUNT(DISTINCT user_id) FROM subscriptions WHERE status IN ('active', 'expired'))::FLOAT /
  (SELECT COUNT(*) FROM auth.users)::FLOAT * 100 
  as conversion_rate_percent;
```

### Churn Rate

```sql
-- Users who didn't renew
SELECT COUNT(*) as churned_users
FROM subscriptions
WHERE status = 'expired'
AND end_date < NOW() - INTERVAL '7 days'
AND user_id NOT IN (
  SELECT user_id FROM subscriptions
  WHERE status = 'active'
);
```

---

## 🔐 Security

### Payment Validation
- ✅ Admin-only validation via RLS policies
- ✅ Service role for cron jobs
- ✅ Authorization header for cron endpoint
- ✅ No direct payment processing (InstaPay handles it)

### Data Protection
- ✅ RLS policies on all subscription tables
- ✅ Users can only view their own subscriptions
- ✅ Admin permissions required for validation
- ✅ Audit trail in payment history

### Best Practices
- 🔒 Never expose `SUPABASE_SERVICE_ROLE_KEY`
- 🔒 Keep `CRON_SECRET` secure
- 🔒 Use HTTPS only for payment screenshots
- 🔒 Regularly audit admin accounts

---

## ✅ Launch Checklist

- [ ] Database migration run
- [ ] QR code image in public folder
- [ ] Cron secret configured
- [ ] Cron job set up (Vercel or external)
- [ ] Tested payment submission
- [ ] Tested admin validation
- [ ] Tested subscription expiry
- [ ] Tested renewal reminders
- [ ] All notifications working
- [ ] Admin panel accessible
- [ ] Documentation shared with team
- [ ] Payment process documented for users

---

## 🎉 You're Ready!

Your AI subscription system is now complete with:
- ✅ Beautiful paywall UI
- ✅ InstaPay payment integration
- ✅ Admin validation workflow
- ✅ Automatic expiry management
- ✅ Renewal reminder system
- ✅ Comprehensive notifications
- ✅ Revenue tracking

Users can now subscribe to unlock AI features! 🚀

---

*Generated: October 30, 2025*
*Brokmang. v1.2 - AI Subscription System*

