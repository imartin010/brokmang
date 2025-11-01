# 💳 Subscription System - Setup Guide (No Organizations)

## Overview

The subscription system allows users to pay for AI features (Insights). Payment is handled via InstaPay and validated manually by CEOs.

## System Flow

```
User → Pay via InstaPay → Submit payment → CEO validates → AI features activated for 31 days
```

## Setup Steps

### 1. Run Database Migrations

Run these SQL files in Supabase SQL Editor in this order:

```sql
-- 1. Fix subscriptions schema (remove org_id)
-- File: supabase/fix-subscriptions-schema.sql
```

```sql
-- 2. Create storage bucket for payment screenshots
-- File: supabase/create-payment-screenshots-bucket.sql
```

### 2. Verify Tables Exist

Check in Supabase Dashboard → Database → Tables:

- ✅ `subscriptions` - Main subscription records
- ✅ `subscription_payments` - Payment history audit trail
- ✅ `user_profiles` - For checking if user is CEO

### 3. Verify Storage Bucket

Go to Supabase Dashboard → Storage:

- ✅ Bucket `payment-screenshots` should exist
- ✅ Policies should allow:
  - Users to upload to their own folder
  - CEOs to read all screenshots
  - Users to read their own screenshots

### 4. Test the Flow

#### As a User (Team Leader or CEO):

1. **Go to `/insights`**
   - You should see a paywall if you don't have a subscription

2. **Click "Subscribe Now"**
   - Payment modal opens
   - Shows InstaPay QR code and link

3. **Pay via InstaPay**
   - Click "Open InstaPay" or scan QR code
   - Send payment (50 EGP for Team Leader, 100 EGP for CEO)
   - Get transaction reference

4. **Submit Payment**
   - Enter payment reference
   - Upload screenshot
   - Click "Submit Payment"
   - See "Payment Pending" status

#### As CEO (Admin):

1. **Go to `/admin/subscriptions`**
   - You should see pending payments
   - Only CEOs can access this page

2. **Review Payment**
   - Click on a pending subscription
   - View payment reference and screenshot
   - Add admin notes (optional)

3. **Approve or Reject**
   - Click "Approve" to activate AI features for 31 days
   - Click "Reject" to deny the payment
   - User receives notification either way

## File Structure

### Frontend Files
- `app/insights/page.tsx` - AI Insights page with paywall
- `components/subscription-payment-modal.tsx` - Payment modal
- `app/admin/subscriptions/page.tsx` - Admin validation panel

### API Routes
- `app/api/subscription/create/route.ts` - Create subscription request
- `app/api/subscription/validate/route.ts` - Approve/reject payments
- `app/api/subscription/status/route.ts` - Check subscription status
- `app/api/cron/subscription-check/route.ts` - Daily cron for expiry checks

### Database Files
- `supabase/subscription-system.sql` - Original schema (has org_id)
- `supabase/fix-subscriptions-schema.sql` - **Use this** - removes org_id
- `supabase/create-payment-screenshots-bucket.sql` - Storage bucket setup

## Key Changes from Original

### Removed Organization Dependencies

**Before:**
- Subscriptions belonged to organizations
- Admins were organization owners/admins
- Notifications sent to org admins

**After:**
- Subscriptions belong to users directly
- Admins are CEOs (user_type = 'ceo')
- Notifications sent to all CEOs

### Storage Integration

- Screenshots uploaded to `payment-screenshots` bucket
- Path: `{user_id}/{timestamp}.{ext}`
- Public URLs generated for admin review

### Access Control

**Who can validate payments:**
- ✅ Users with `user_type = 'ceo'` in `user_profiles` table
- ❌ Team leaders cannot validate payments

## Troubleshooting

### "Unauthorized" Error When Validating

**Problem:** Admin can't validate payments

**Solution:**
1. Check if user is CEO: `SELECT user_type FROM user_profiles WHERE user_id = 'YOUR_USER_ID';`
2. If not CEO, update: `UPDATE user_profiles SET user_type = 'ceo' WHERE user_id = 'YOUR_USER_ID';`

### Screenshot Upload Fails

**Problem:** Error when uploading screenshot

**Solutions:**
1. Check bucket exists: Supabase Dashboard → Storage
2. Run: `supabase/create-payment-screenshots-bucket.sql`
3. Check browser console for specific error

### No Pending Payments Showing

**Problem:** Admin panel is empty

**Solutions:**
1. Verify subscriptions exist:
   ```sql
   SELECT * FROM subscriptions WHERE status = 'pending_payment';
   ```

2. Check RLS policies allow CEOs to read:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'subscriptions';
   ```

3. Verify you're logged in as CEO

### "Table organizations does not exist"

**Problem:** Subscription APIs failing

**Solution:**
Run `supabase/fix-subscriptions-schema.sql` to remove org_id references

## Admin Panel Features

### Filters
- **All** - View all subscriptions
- **Pending** - Awaiting validation
- **Active** - Currently active subscriptions  
- **Cancelled** - Rejected or expired

### Subscription Card Shows
- User name
- User type (CEO/Team Leader)
- Amount (50 or 100 EGP)
- Payment reference
- Submission time
- Status badge

### Review Modal Shows
- Full user details
- Payment reference
- Payment screenshot (if uploaded)
- Admin notes field
- Approve/Reject buttons

## Database Schema

### subscriptions Table (Updated)

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,           -- NO org_id
  user_type TEXT NOT NULL,          -- 'ceo' or 'team_leader'
  status TEXT NOT NULL,             -- 'pending_payment', 'active', 'expired', 'cancelled'
  amount_egp INTEGER NOT NULL,      -- 50 or 100
  payment_reference TEXT,
  payment_screenshot_url TEXT,
  payment_submitted_at TIMESTAMPTZ,
  validated_by UUID,
  validated_at TIMESTAMPTZ,
  admin_notes TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  ...notification flags...
  created_at TIMESTAMPTZ
);
```

### Key Points
- ✅ No `org_id` column
- ✅ CEOs can read/update all subscriptions
- ✅ Users can read their own subscriptions
- ✅ Service role (API) can insert/update

## Testing Checklist

- [ ] CEO can access `/admin/subscriptions`
- [ ] Team Leader is denied access to `/admin/subscriptions`
- [ ] User can submit payment with screenshot
- [ ] Screenshot appears in admin panel
- [ ] CEO can approve payment
- [ ] User receives activation notification
- [ ] AI features unlock after approval
- [ ] CEO can reject payment
- [ ] User receives rejection notification

## Next Steps

1. Run both SQL migration files in Supabase
2. Test payment submission as Team Leader
3. Test validation as CEO
4. Verify AI features unlock

