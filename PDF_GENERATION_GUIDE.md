# 📄 PDF Report Generation Guide

## Overview

The `generate_report` Edge Function creates beautiful, branded PDF reports for your organization. Currently generates HTML reports (which can be printed to PDF or converted using a PDF service).

---

## 🚀 Quick Setup

### Step 1: Deploy the Edge Function

```bash
# Make sure you're linked to your project
npx supabase link --project-ref eamywkblubazqmepaxmm

# Deploy the function
npx supabase functions deploy generate_report

# Verify it's deployed
npx supabase functions list
```

---

## 📊 Report Types

### 1. **Sales Performance Report** (`sales`)
- Total sales overview
- Agent-by-agent performance
- Meetings and calls summary
- Top performers ranking

### 2. **KPI Report** (`kpi`)
- Detailed KPI breakdown per agent
- Attendance, calls, behavior, meetings, sales scores
- Final performance scores

### 3. **Financial Summary** (`financial`)
- Total revenue, expenses, net profit
- Revenue breakdown by category
- Financial percentages

### 4. **Monthly Overview** (`monthly`)
- Active agents count
- Total sales
- Average performance
- Top 10 performers

---

## 🔧 Usage

### From Frontend (TypeScript/React)

```typescript
// app/reports/page.tsx

async function generateReport(
  reportType: 'sales' | 'kpi' | 'financial' | 'monthly',
  year: number,
  month: number
) {
  const supabase = createBrowserClient();
  
  // Get current org
  const orgId = useOrg.getState().selectedOrgId;
  
  // Call the Edge Function
  const { data, error } = await supabase.functions.invoke('generate_report', {
    body: {
      org_id: orgId,
      report_type: reportType,
      year,
      month,
      title: `${reportType} Report - ${month}/${year}`,
    },
  });
  
  if (error) {
    console.error('Error generating report:', error);
    return;
  }
  
  // Download the report
  window.open(data.download_url, '_blank');
  
  // Or display in iframe
  // setReportUrl(data.download_url);
}
```

### Example Button

```tsx
<Button 
  onClick={() => generateReport('sales', 2024, 11)}
>
  📊 Generate Sales Report
</Button>
```

---

## 🎨 Custom Branding

Reports automatically use your organization's branding:

```sql
-- Update organization branding
UPDATE organizations
SET 
  logo_url = 'https://your-bucket.supabase.co/org-logos/your-org-id/logo.png',
  primary_color = '#2563eb',
  secondary_color = '#1e40af'
WHERE id = 'your-org-id';
```

The reports will automatically:
- Display your logo
- Use your primary color for headers
- Use your secondary color for section titles
- Show your organization name

---

## 📥 Download Flow

1. User clicks "Generate Report" button
2. Frontend calls Edge Function with parameters
3. Edge Function:
   - Fetches data from database
   - Generates HTML with branding
   - Uploads to `reports` storage bucket
   - Creates signed URL (valid 1 hour)
4. Frontend receives download URL
5. User downloads report

---

## 🧪 Test the Function

### Using curl:

```bash
curl -X POST \
  'https://eamywkblubazqmepaxmm.supabase.co/functions/v1/generate_report' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -d '{
    "org_id": "your-org-id",
    "report_type": "sales",
    "year": 2024,
    "month": 11
  }'
```

### Using Supabase Client:

```typescript
const { data, error } = await supabase.functions.invoke('generate_report', {
  body: {
    org_id: 'your-org-id',
    report_type: 'kpi',
    year: 2024,
    month: 11,
  },
});

console.log('Report URL:', data.download_url);
```

---

## 📂 Storage Structure

Reports are stored in the `reports` bucket:

```
reports/
  ├── {org_id}/
  │   ├── 2024/
  │   │   ├── 11/
  │   │   │   ├── sales-report-2024-11.html
  │   │   │   ├── kpi-report-2024-11.html
  │   │   │   ├── financial-report-2024-11.html
  │   │   │   └── monthly-report-2024-11.html
```

---

## 🖨️ Converting HTML to PDF

### Option 1: Browser Print (Client-Side)

```typescript
// Open in new window and trigger print
const printWindow = window.open(data.download_url);
printWindow?.addEventListener('load', () => {
  printWindow.print();
});
```

### Option 2: External Service (Recommended for Production)

Use a service like:
- **PDFShift** (https://pdfshift.io)
- **HTML2PDF API** (https://html2pdf.app)
- **Puppeteer** (self-hosted)

Example with PDFShift:

```typescript
const response = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + btoa('api:' + PDFSHIFT_API_KEY),
  },
  body: JSON.stringify({
    source: data.download_url,
    landscape: false,
    use_print: true,
  }),
});

const pdfBlob = await response.blob();
const pdfUrl = URL.createObjectURL(pdfBlob);
```

### Option 3: Add Puppeteer to Edge Function (Advanced)

For true PDF generation, you can add Puppeteer to the Edge Function, but this requires:
- Larger function size
- Longer execution time
- More complex deployment

---

## 🔒 Security

- ✅ Uses service role to bypass RLS (function-level auth)
- ✅ Uploads to org-specific folders
- ✅ Signed URLs expire after 1 hour
- ✅ RLS policies on `reports` bucket restrict access
- ✅ Only org members can access their reports

---

## 🎯 Next Steps

1. **Deploy the function** (see Step 1 above)
2. **Update Reports Center** (`app/reports/page.tsx`) to call the function
3. **Add loading states** and error handling
4. **Optional**: Integrate PDF conversion service
5. **Optional**: Add report history tracking

---

## 📝 Customization

### Add New Report Type

1. Add type to `ReportType` union
2. Create `generate{Type}Report()` function
3. Add case in `generateReportHTML()`
4. Update frontend UI

### Modify Report Design

Edit the HTML template in `generateReportHTML()`:
- Change colors
- Add sections
- Modify table layouts
- Add charts (using Chart.js or similar)

---

## ✅ Testing Checklist

- [ ] Function deploys successfully
- [ ] Can generate sales report
- [ ] Can generate KPI report
- [ ] Can generate financial report
- [ ] Can generate monthly report
- [ ] Reports include org branding
- [ ] Download URLs work
- [ ] Reports appear in storage bucket
- [ ] RLS policies prevent unauthorized access

---

## 🐛 Troubleshooting

### Function not found
- Run `npx supabase functions list` to verify deployment
- Check Edge Function logs in Supabase Dashboard

### No data in reports
- Verify you have agent_monthly_scores data for the period
- Check agent_daily_logs exist for the month
- Ensure org_id is correct

### Reports not accessible
- Check RLS policies on `reports` bucket
- Verify user has membership in organization
- Signed URL expires after 1 hour

---

## 🎉 You're Ready!

Your Reports Center can now generate beautiful, branded reports with a single function call!

