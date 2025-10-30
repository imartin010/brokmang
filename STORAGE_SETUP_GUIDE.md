# 📦 Supabase Storage Setup Guide

## Quick Setup (2 minutes)

### Step 1: Run the SQL Script

1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/eamywkblubazqmepaxmm
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the entire contents of `supabase/storage-setup.sql`
5. Paste into the editor
6. Click **Run** (or press Cmd+Enter)

You should see: `Success. No rows returned`

---

### Step 2: Verify Buckets Created

1. Go to **Storage** (left sidebar)
2. You should now see two buckets:
   - **org-logos** (Public) - 5MB limit, images only
   - **reports** (Private) - 50MB limit, PDFs only

---

## 📁 File Structure

### org-logos bucket (Public)
```
/{org_id}/logo.png
/{org_id}/favicon.ico
```

### reports bucket (Private, Auth Required)
```
/{org_id}/{year}/{month}/sales-report.pdf
/{org_id}/{year}/{month}/performance-report.pdf
/{org_id}/{year}/{month}/kpi-report.pdf
```

---

## 🔒 Security (RLS Policies)

### org-logos
- ✅ **Read**: Anyone (public)
- ✅ **Upload/Update/Delete**: Only Org Owners & Admins

### reports
- ✅ **Read**: All org members
- ✅ **Upload**: Owners, Admins, Accountants
- ✅ **Delete**: Only Owners & Admins

---

## 🧪 Test Upload (Optional)

### Test org-logos bucket:

```typescript
// In your Next.js app
import { createBrowserClient } from '@/lib/supabase-browser';

const supabase = createBrowserClient();

// Upload logo for organization
const { data, error } = await supabase.storage
  .from('org-logos')
  .upload(`${orgId}/logo.png`, file, {
    cacheControl: '3600',
    upsert: true
  });

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('org-logos')
  .getPublicUrl(`${orgId}/logo.png`);
```

### Test reports bucket:

```typescript
// Upload PDF report
const { data, error } = await supabase.storage
  .from('reports')
  .upload(`${orgId}/${year}/${month}/sales-report.pdf`, pdfBlob);

// Get authenticated URL (expires in 1 hour)
const { data: { signedUrl } } = await supabase.storage
  .from('reports')
  .createSignedUrl(`${orgId}/${year}/${month}/sales-report.pdf`, 3600);
```

---

## ✅ What's Next?

After storage is set up, you can:

1. **Branding Tab**: Upload organization logos in Org Settings
2. **Reports Center**: Generate and download PDF reports
3. **Public API**: Access reports via signed URLs

Storage is now ready for Phase-2 features! 🎉

