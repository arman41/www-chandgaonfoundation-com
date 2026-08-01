CREATE POLICY "Users upload application media" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'foundation-media'
  AND auth.uid() IS NOT NULL
  AND (
    name LIKE 'applications/%'
    OR name LIKE 'members/%'
    OR name LIKE 'volunteers/%'
  )
  AND lower(storage.extension(name)) IN ('jpg','jpeg','png','webp','gif','heic')
);