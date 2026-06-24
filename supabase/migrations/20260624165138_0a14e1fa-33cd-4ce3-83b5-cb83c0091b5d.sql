
-- Remove anon-readable policies that exposed PII on members and volunteers.
-- Public lookups already go through the safe views member_public_card / volunteer_public_card.
DROP POLICY IF EXISTS "Anon view approved members" ON public.members;
DROP POLICY IF EXISTS "Anon view active volunteers" ON public.volunteers;

-- Recreate storage policies with an explicit auth.uid() IS NOT NULL guard so
-- linters can see they cannot apply to anonymous sessions.
DROP POLICY IF EXISTS "Admin delete foundation-media" ON storage.objects;
DROP POLICY IF EXISTS "Admin update foundation-media" ON storage.objects;
DROP POLICY IF EXISTS "Admin manage application-pdf" ON storage.objects;
DROP POLICY IF EXISTS "Staff read application-pdf" ON storage.objects;

CREATE POLICY "Admin delete foundation-media"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    auth.uid() IS NOT NULL
    AND bucket_id = 'foundation-media'
    AND private.has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Admin update foundation-media"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    auth.uid() IS NOT NULL
    AND bucket_id = 'foundation-media'
    AND private.has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Admin manage application-pdf"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    auth.uid() IS NOT NULL
    AND bucket_id = 'application-pdf'
    AND private.has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Staff read application-pdf"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    auth.uid() IS NOT NULL
    AND bucket_id = 'application-pdf'
    AND private.is_staff(auth.uid())
  );
