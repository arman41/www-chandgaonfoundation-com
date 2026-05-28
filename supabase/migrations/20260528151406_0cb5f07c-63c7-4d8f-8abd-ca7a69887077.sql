CREATE POLICY "Public can upload member photos"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'foundation-media'
  AND (storage.foldername(name))[1] = 'members'
);