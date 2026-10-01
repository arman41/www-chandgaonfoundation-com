DROP POLICY IF EXISTS "Users upload own application media" ON storage.objects;
CREATE POLICY "Users upload own profile photo" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'foundation-media'
  AND (storage.foldername(name))[1] = ANY (ARRAY['members','volunteers'])
  AND (storage.foldername(name))[2] = (auth.uid())::text
  AND array_length(storage.foldername(name),1) = 2
  AND name ~ '^(members|volunteers)/[0-9a-f-]{36}/[0-9a-f]{32}\.(jpg|jpeg|png|webp|heic)$');