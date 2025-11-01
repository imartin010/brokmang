# Redeploy Edge Functions - After Organization Removal

The Edge Functions need to be redeployed with the updated code that doesn't require `org_id`.

## Prerequisites

1. Supabase CLI installed
2. Logged into Supabase CLI
3. Project linked to your Supabase project

## Deploy Steps

### Step 1: Install Supabase CLI (if not already installed)

```bash
npm install -g supabase
```

### Step 2: Login to Supabase

```bash
npx supabase login
```

### Step 3: Link to Your Project

```bash
npx supabase link --project-ref eamywkblubazqmepaxmm
```

Replace `eamywkblubazqmepaxmm` with your actual Supabase project reference ID.

### Step 4: Deploy the Updated Edge Function

```bash
npx supabase functions deploy generate_report --no-verify-jwt
```

This deploys the `generate_report` function with the updated code that doesn't require `org_id`.

### Step 5: Verify Deployment

```bash
# List all functions
npx supabase functions list

# Check if generate_report is listed
```

## Alternative: Deploy via Supabase Dashboard

1. Go to Supabase Dashboard → Edge Functions
2. Click on `generate_report` function (or create new)
3. Copy the contents of `supabase/functions/generate_report/index.ts`
4. Paste into the editor
5. Click "Deploy"

## Test the Function

After deployment, test it:

1. Go to your app at `localhost:3000/reports`
2. Try generating a report
3. Check the browser console for any errors
4. If successful, you'll see the report download

## What Changed

The edge function now:
- ❌ Does NOT require `org_id` in the request
- ❌ Does NOT fetch organization branding
- ❌ Does NOT filter data by `org_id`
- ✅ Uses default "Brokmang" branding
- ✅ Fetches all agent data (not filtered by organization)
- ✅ Stores reports in `reports/year/month/` path (not `org_id/year/month/`)

## Troubleshooting

### Error: "Missing required fields"
The old function is still deployed. Make sure you redeploy with the command above.

### Error: "Failed to send request to Edge Function"
- Check if the function is deployed: `npx supabase functions list`
- Check Supabase Dashboard → Edge Functions → Logs for errors
- Verify secrets are set (see next section)

### Edge Function Secrets

The function needs these secrets set:

```bash
npx supabase secrets set SUPABASE_URL=https://YOUR_PROJECT.supabase.co
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Get the service role key from: Supabase Dashboard → Settings → API → service_role

### Still Not Working?

1. Check edge function logs in Supabase Dashboard
2. Verify the function was deployed successfully
3. Try redeploying: `npx supabase functions deploy generate_report --no-verify-jwt`
4. Clear browser cache and refresh

