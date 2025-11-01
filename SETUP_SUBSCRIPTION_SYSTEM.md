# 🚀 Quick Setup: Subscription System

Follow these steps to get the subscription/payment system working:

## Step 1: Run Database Migrations in Supabase

Go to Supabase Dashboard → SQL Editor, then run these files in order:

### Migration 1: Fix Subscriptions Schema
```sql
-- Copy and paste contents of: supabase/fix-subscriptions-schema.sql
-- This removes org_id from subscriptions table
```

### Migration 2: Create Storage Bucket
```sql  
-- Copy and paste contents of: supabase/create-payment-screenshots-bucket.sql
-- This creates the payment-screenshots bucket with proper policies
```

## Step 2: Verify Setup

### Check Tables
```sql
-- Verify subscriptions table exists without org_id
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'subscriptions';
-- Should NOT show org_id column
```

### Check Storage Bucket
Go to Supabase Dashboard → Storage:
- ✅ Bucket `payment-screenshots` should be listed
- ✅ Click on it to verify it exists

### Check Policies
```sql
-- Verify RLS policies
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'subscriptions';
-- Should show: subscriptions_select_own, subscriptions_select_ceo, etc.
```

## Step 3: Test the System

### Test as Regular User (Team Leader):

1. Sign in as a Team Leader
2. Go to `/insights`
3. Should see paywall
4. Click "Subscribe Now - 50 EGP/month"
5. Payment modal should open
6. Upload a test screenshot
7. Enter a test payment reference (e.g., "TEST123")
8. Click "Submit Payment"
9. Should see "Payment Pending" message

### Test as CEO (Admin):

1. Sign in as a CEO
2. Go to `/admin/subscriptions`
3. Should see the pending subscription
4. Click "Review" on the subscription
5. Modal should show:
   - User details
   - Payment reference: "TEST123"
   - Screenshot (if uploaded)
6. Add admin notes (optional)
7. Click "Approve"
8. Subscription should move to "Active" status
9. User should receive notification

### Verify AI Access:

1. Sign in as the user whose payment was approved
2. Go to `/insights`
3. Should NO LONGER see paywall
4. Should see "Refresh Insights" button
5. Click it to generate AI insights

## Troubleshooting

### Issue: "Bucket not found" when uploading screenshot

**Solution:**
```sql
-- Run this in Supabase SQL Editor:
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-screenshots', 'payment-screenshots', false)
ON CONFLICT (id) DO NOTHING;
```

### Issue: "RLS policy prevents insert" for subscriptions

**Solution:**
The API uses service_role key, so RLS shouldn't block. Check:
1. Service role key is set in environment variables
2. API route is using service_role client (not anon key)

### Issue: Admin panel shows "Access Denied"

**Solution:**
Make sure you're signed in as CEO:
```sql
-- Check your user type
SELECT user_type FROM user_profiles WHERE user_id = 'YOUR_USER_ID';

-- If not CEO, update it:
UPDATE user_profiles SET user_type = 'ceo' WHERE user_id = 'YOUR_USER_ID';
```

### Issue: Can't see pending payments in admin panel

**Solution:**
```sql
-- Check if subscriptions exist
SELECT * FROM subscriptions WHERE status = 'pending_payment';

-- If empty, the subscription wasn't created. Check API errors in browser console.
```

### Issue: Screenshot doesn't show in admin panel

**Solutions:**
1. Check if screenshot_url was saved:
   ```sql
   SELECT payment_screenshot_url FROM subscriptions WHERE id = 'SUBSCRIPTION_ID';
   ```

2. If URL is empty, upload failed. Check storage bucket exists.

3. If URL exists but image doesn't load, check storage policies allow CEOs to read.

## Admin Panel Access

**URL:** `/admin/subscriptions`

**Who can access:**
- ✅ CEOs only (`user_type = 'ceo'` in `user_profiles`)
- ❌ Team Leaders are denied

**Features:**
- View all subscriptions (pending, active, cancelled)
- Filter by status
- Review payment details
- View uploaded screenshots
- Approve or reject payments
- Add admin notes

## Payment Flow Summary

### User Side:
1. `/insights` → Paywall → "Subscribe Now"
2. Payment modal → InstaPay payment → Enter reference → Upload screenshot
3. Submit → "Payment Pending" status → Wait for validation
4. Receive notification → AI features unlock (if approved)

### Admin Side:
1. Receive notification "New Payment to Validate"
2. `/admin/subscriptions` → View pending
3. Click "Review" → Check reference/screenshot
4. "Approve" or "Reject" → User notified → AI activated (if approved)

## Pricing

- **Team Leader**: 50 EGP/month
- **CEO**: 100 EGP/month
- **Duration**: 31 days
- **Payment**: InstaPay

## Files Created/Updated

### SQL Migrations:
- ✅ `supabase/fix-subscriptions-schema.sql` - Remove org_id
- ✅ `supabase/create-payment-screenshots-bucket.sql` - Storage setup

### API Routes:
- ✅ `app/api/subscription/create/route.ts` - Updated (no org_id)
- ✅ `app/api/subscription/validate/route.ts` - Updated (CEO check)
- ✅ `app/api/subscription/status/route.ts` - Works as-is

### Components:
- ✅ `components/subscription-payment-modal.tsx` - Uploads to storage
- ✅ `app/admin/subscriptions/page.tsx` - CEO-only access

### Pages:
- ✅ `app/insights/page.tsx` - Shows paywall, works without org

## Environment Variables Needed

Make sure these are set in your environment:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

The API routes use service_role for privileged operations.

## Manual Approval Process

Since this is a manual validation system:

1. **User pays** → Transaction reference + screenshot
2. **CEO reviews** → Verifies payment in InstaPay
3. **CEO approves** → AI features activate for 31 days
4. **After 31 days** → Subscription expires, user needs to renew

## Notifications

All users get notified at key points:
- ✅ Payment submitted confirmation
- ✅ Payment approved/rejected
- ✅ Renewal reminders (5 days before expiry)
- ✅ Subscription expired

Notifications appear in the notification center (bell icon in navbar).

## Ready to Use!

After running the SQL migrations, the system is ready. Test it with a real payment flow to confirm everything works.

