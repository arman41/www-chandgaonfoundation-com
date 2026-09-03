-- Replace loose upload policies with ownership/unguessability-bound ones.

DROP POLICY IF EXISTS "Users upload application media" ON storage.objects;
DROP POLICY IF EXISTS "Applicants upload private media" ON storage.objects;

-- Authenticated uploads to the public bucket must live under
-- <folder>/<auth.uid()>/<32-hex-token>.<img ext>
CREATE POLICY "Users upload own application media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'foundation-media'
  AND (storage.foldername(name))[1] IN ('applications', 'members', 'volunteers')
  AND (storage.foldername(name))[2] = auth.uid()::text
  AND array_length(storage.foldername(name), 1) = 2
  AND name ~ '^[a-z]+/[0-9a-f-]{36}/[0-9a-f]{32}\.(jpg|jpeg|png|webp|heic)$'
);

-- Private bucket: signed-in users get the same owner-scoped path.
CREATE POLICY "Users upload own private media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'private-media'
  AND (storage.foldername(name))[1] IN ('applications', 'members', 'volunteers')
  AND (storage.foldername(name))[2] = auth.uid()::text
  AND array_length(storage.foldername(name), 1) = 2
  AND name ~ '^[a-z]+/[0-9a-f-]{36}/[0-9a-f]{32}\.(jpg|jpeg|png|webp|heic)$'
);

-- Anonymous help applicants: no account to bind to, so require a
-- cryptographically random 32-hex object name that cannot be guessed.
CREATE POLICY "Anonymous applicants upload private media"
ON storage.objects FOR INSERT TO anon
WITH CHECK (
  bucket_id = 'private-media'
  AND (storage.foldername(name))[1] = 'applications'
  AND array_length(storage.foldername(name), 1) = 1
  AND name ~ '^applications/[0-9a-f]{32}\.(jpg|jpeg|png|webp|heic)$'
);
