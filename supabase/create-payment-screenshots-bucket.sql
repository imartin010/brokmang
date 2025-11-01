-- =====================================================
-- Create Storage Bucket for Payment Screenshots
-- =====================================================

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-screenshots', 'payment-screenshots', false)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Storage Policies for Payment Screenshots
-- =====================================================

-- Allow authenticated users to upload their own screenshots
CREATE POLICY "Users can upload payment screenshots"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'payment-screenshots' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to read their own screenshots
CREATE POLICY "Users can read own payment screenshots"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-screenshots' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow CEOs to read all payment screenshots (for validation)
CREATE POLICY "CEOs can read all payment screenshots"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-screenshots' AND
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid()
    AND user_type = 'ceo'
  )
);

-- Service role has full access (for Edge Functions)
CREATE POLICY "Service role has full access to payment screenshots"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'payment-screenshots');

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Check bucket was created:
-- SELECT * FROM storage.buckets WHERE id = 'payment-screenshots';

-- Check policies:
-- SELECT * FROM storage.policies WHERE bucket_id = 'payment-screenshots';

