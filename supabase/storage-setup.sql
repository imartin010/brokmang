-- =====================================================
-- Supabase Storage Setup
-- =====================================================
-- Buckets:
--   1. org-logos (public) - Organization logos/branding
--   2. reports (authenticated) - Generated PDF reports
-- =====================================================

-- 1. Create org-logos bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'org-logos',
  'org-logos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];

-- 2. Create reports bucket (authenticated)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'reports',
  'reports',
  false, -- Private, auth required
  52428800, -- 50MB limit
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['application/pdf'];

-- =====================================================
-- RLS Policies for org-logos bucket
-- =====================================================

-- Drop existing policies first (idempotent)
DROP POLICY IF EXISTS "org_logos_public_read" ON storage.objects;
DROP POLICY IF EXISTS "org_logos_insert" ON storage.objects;
DROP POLICY IF EXISTS "org_logos_update" ON storage.objects;
DROP POLICY IF EXISTS "org_logos_delete" ON storage.objects;

-- Allow anyone to read org logos (public)
CREATE POLICY "org_logos_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'org-logos');

-- Allow authenticated users to upload logos for their organizations
CREATE POLICY "org_logos_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'org-logos'
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.memberships
    WHERE user_id = auth.uid()
    AND org_id::text = (storage.foldername(name))[1]
    AND role IN ('owner', 'admin')
  )
);

-- Allow org owners/admins to update their logos
CREATE POLICY "org_logos_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'org-logos'
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.memberships
    WHERE user_id = auth.uid()
    AND org_id::text = (storage.foldername(name))[1]
    AND role IN ('owner', 'admin')
  )
);

-- Allow org owners/admins to delete their logos
CREATE POLICY "org_logos_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'org-logos'
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.memberships
    WHERE user_id = auth.uid()
    AND org_id::text = (storage.foldername(name))[1]
    AND role IN ('owner', 'admin')
  )
);

-- =====================================================
-- RLS Policies for reports bucket
-- =====================================================

-- Drop existing policies first (idempotent)
DROP POLICY IF EXISTS "reports_select" ON storage.objects;
DROP POLICY IF EXISTS "reports_insert" ON storage.objects;
DROP POLICY IF EXISTS "reports_delete" ON storage.objects;

-- Allow users to read reports from their organizations
CREATE POLICY "reports_select"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'reports'
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.memberships
    WHERE user_id = auth.uid()
    AND org_id::text = (storage.foldername(name))[1]
  )
);

-- Allow owners/admins/accountants to upload reports
CREATE POLICY "reports_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'reports'
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.memberships
    WHERE user_id = auth.uid()
    AND org_id::text = (storage.foldername(name))[1]
    AND role IN ('owner', 'admin', 'accountant')
  )
);

-- Allow owners/admins to delete reports
CREATE POLICY "reports_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'reports'
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.memberships
    WHERE user_id = auth.uid()
    AND org_id::text = (storage.foldername(name))[1]
    AND role IN ('owner', 'admin')
  )
);

-- =====================================================
-- File Structure Guide
-- =====================================================
-- 
-- org-logos bucket:
--   /{org_id}/logo.png
--   /{org_id}/favicon.ico
--
-- reports bucket:
--   /{org_id}/{year}/{month}/sales-report.pdf
--   /{org_id}/{year}/{month}/performance-report.pdf
--   /{org_id}/{year}/{month}/kpi-report.pdf
--
-- =====================================================

