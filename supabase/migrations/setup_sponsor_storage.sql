-- Create Storage bucket for sponsor logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'sponsor-logos',
  'sponsor-logos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for sponsor-logos bucket
CREATE POLICY "Public can view sponsor logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'sponsor-logos');

CREATE POLICY "Authenticated users can upload sponsor logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'sponsor-logos' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own sponsor logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'sponsor-logos' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own sponsor logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'sponsor-logos' AND
  auth.role() = 'authenticated'
);

-- Update sponsors table to support both static and uploaded images
ALTER TABLE sponsors
ADD COLUMN IF NOT EXISTS logo_storage_path TEXT,
ADD COLUMN IF NOT EXISTS use_storage_logo BOOLEAN DEFAULT false;

COMMENT ON COLUMN sponsors.logo_path IS 'Static logo path from public/images (legacy)';
COMMENT ON COLUMN sponsors.logo_storage_path IS 'Path in Supabase Storage bucket';
COMMENT ON COLUMN sponsors.use_storage_logo IS 'If true, use logo_storage_path instead of logo_path';
