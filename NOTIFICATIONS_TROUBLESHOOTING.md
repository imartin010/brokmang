# 🔔 Notifications Troubleshooting Guide

## Issue: Can't See Notifications

### ✅ FIXED! What I Changed:

The notification bell now shows in the navbar **always**, but requires you to:
1. ✅ Be signed in
2. ✅ Have selected an organization (via org switcher or onboarding)

---

## 🔍 **Where to Find Notifications**

### **Bell Icon in Navbar** 🔔
**Location:** Top-right corner of navbar, next to the building icon (org switcher)

**What You'll See:**
- Bell icon (🔔)
- Red badge with number if you have unread notifications
- Click to open dropdown

### **Full Notification Page** 📄
**Location:** `/notifications` or click "View All Notifications" in dropdown

---

## 🚀 **How to Test Notifications**

### Step 1: Make Sure You're Signed In
```bash
# Visit: http://localhost:3000
# If not signed in, go to /auth and sign in
```

### Step 2: Select an Organization
- Look for building icon 🏢 in navbar (next to bell)
- Click it to view your organizations
- Select an org (or complete onboarding first)

### Step 3: Create a Test Notification
In Supabase SQL Editor, run:
```sql
-- Get your user ID and org ID first
SELECT id as user_id FROM auth.users LIMIT 1;
SELECT id as org_id FROM organizations LIMIT 1;

-- Then create a test notification (replace the IDs):
INSERT INTO notifications (org_id, user_id, type, title, message, is_read)
VALUES (
  'YOUR_ORG_ID_HERE',
  'YOUR_USER_ID_HERE',
  'SYSTEM',
  'Test Notification! 🎉',
  'If you can see this, notifications are working!',
  false
);
```

### Step 4: Check the Bell
- You should see a red badge with "1"
- Click the bell to view the notification

---

## 📍 **Navbar Icon Positions** (Left to Right)

```
Logo | Home | Dashboard | Analyze | History | Reports | Insights | Agents▼ | Org▼ || 🔔 | 🏢 | 🌓 | User | Logout
```

**Key:**
- 🔔 = Notifications (Bell)
- 🏢 = Org Switcher (Building)
- 🌓 = Theme Toggle
- ▼ = Dropdown menu

---

## ✅ **What Should Happen**

### When You Have No Org Selected:
- Bell shows but is gray/disabled
- Click opens dropdown saying "Select an organization"

### When You Have an Org Selected:
- Bell is active and clickable
- Loads notifications for your org
- Shows unread count badge (if any)
- Realtime updates when new notifications arrive

### When You Have Notifications:
- **Red badge** appears on bell icon
- Shows number (e.g., "3")
- Click to see dropdown with recent 5
- "Mark all as read" button appears

---

## 🐛 **Still Can't See It?**

### Check 1: Server Running
```bash
# Make sure dev server is running:
npm run dev

# Should see:
# ✓ Ready in X ms
# ○ Compiling / ...
```

### Check 2: Page Refresh
```bash
# Hard refresh the page:
# Mac: Cmd + Shift + R
# Windows: Ctrl + Shift + R
```

### Check 3: Browser Console
```bash
# Open browser console (F12)
# Look for any errors
# Should NOT see notification-related errors
```

### Check 4: Check Navbar Code
The notification center should be in the navbar:
```typescript
// In components/navbar.tsx around line 179:
<NotificationCenter />
<OrgSwitcher />
<ThemeToggle />
```

---

## 🎯 **Quick Test Script**

To verify notifications work, run this in Supabase SQL:

```sql
-- 1. Check if you have an org
SELECT id, name FROM organizations;

-- 2. Check if you have notifications
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5;

-- 3. Create a test notification (replace IDs)
INSERT INTO notifications (org_id, user_id, type, title, message)
SELECT 
  o.id,
  m.user_id,
  'SYSTEM',
  '🎉 Test Notification',
  'This is a test - if you see this, notifications work!'
FROM organizations o
CROSS JOIN memberships m
WHERE o.id = m.org_id
LIMIT 1;
```

---

## 🔥 **After Running SQL**

1. Refresh your browser
2. Look at top-right navbar
3. You should see bell 🔔 with red badge "1"
4. Click it - notification appears!
5. Click "Mark as read" - badge disappears

---

## ✅ **Expected Behavior**

### First Time (No Org):
- Bell icon shows (disabled/gray)
- Click shows "Select organization" message

### After Onboarding/Org Selected:
- Bell icon active
- Loads your notifications
- Shows unread badge if any
- Realtime updates work

### With Notifications:
- Red badge on bell
- Dropdown shows recent 5
- Full page at `/notifications`
- Can mark read/delete

---

**The notification system is now working! Try it out! 🎉**

**Dev server is running at:** `http://localhost:3000`

