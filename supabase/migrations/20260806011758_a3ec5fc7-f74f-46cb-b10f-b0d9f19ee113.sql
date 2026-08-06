GRANT INSERT ON public.help_applications TO anon, authenticated;

DROP POLICY IF EXISTS "Public can submit help applications" ON public.help_applications;
CREATE POLICY "Public can submit help applications"
ON public.help_applications
FOR INSERT
TO anon, authenticated
WITH CHECK (status = 'pending' AND admin_notes IS NULL);