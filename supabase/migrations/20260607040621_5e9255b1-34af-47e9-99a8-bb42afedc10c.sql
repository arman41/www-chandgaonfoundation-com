
-- 1. distribution_slips: staff-only SELECT
DROP POLICY IF EXISTS "Anyone view distribution slips" ON public.distribution_slips;
CREATE POLICY "Staff view distribution slips"
  ON public.distribution_slips FOR SELECT
  TO authenticated
  USING (public.is_staff(auth.uid()));

-- 2. application-pdf bucket: drop public policies, add staff read + pdf-only insert
DROP POLICY IF EXISTS "Public read application-pdf" ON storage.objects;
DROP POLICY IF EXISTS "Anyone upload application-pdf" ON storage.objects;

CREATE POLICY "Staff read application-pdf"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'application-pdf' AND public.is_staff(auth.uid()));

CREATE POLICY "Anyone upload pdf to application-pdf"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    bucket_id = 'application-pdf'
    AND lower(storage.extension(name)) = 'pdf'
  );

-- 3. foundation-media members folder: restrict to image extensions
DROP POLICY IF EXISTS "Public can upload member photos" ON storage.objects;
CREATE POLICY "Public upload member image"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    bucket_id = 'foundation-media'
    AND (storage.foldername(name))[1] = 'members'
    AND lower(storage.extension(name)) IN ('jpg','jpeg','png','webp','gif','heic')
  );

-- 4. contact_messages: replace with_check(true) with light validation
DROP POLICY IF EXISTS "Anyone can submit contact" ON public.contact_messages;
CREATE POLICY "Anyone can submit contact"
  ON public.contact_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(btrim(name)) BETWEEN 1 AND 200
    AND char_length(btrim(email)) BETWEEN 3 AND 255
    AND char_length(btrim(message)) BETWEEN 1 AND 5000
  );
