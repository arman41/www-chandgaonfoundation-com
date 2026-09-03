CREATE POLICY "Applicants upload private media"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (
  bucket_id = 'private-media'
  AND (name LIKE 'applications/%' OR name LIKE 'members/%' OR name LIKE 'volunteers/%')
  AND lower(storage.extension(name)) = ANY (ARRAY['jpg','jpeg','png','webp','gif','heic'])
);

CREATE POLICY "Staff read private media"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'private-media' AND auth.uid() IS NOT NULL AND private.is_staff(auth.uid()));

CREATE POLICY "Admin update private media"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'private-media' AND private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin delete private media"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'private-media' AND private.has_role(auth.uid(), 'admin'::app_role));