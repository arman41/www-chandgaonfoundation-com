
CREATE POLICY "Admins manage foundation-media"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'foundation-media' AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (bucket_id = 'foundation-media' AND has_role(auth.uid(), 'admin'::app_role));
