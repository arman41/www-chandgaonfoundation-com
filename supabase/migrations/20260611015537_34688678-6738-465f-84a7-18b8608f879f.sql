DROP POLICY IF EXISTS "Public can submit donation" ON public.donations;
DROP POLICY IF EXISTS "Public can submit help application" ON public.help_applications;
DROP POLICY IF EXISTS "Anon upload pdf to applications folder" ON storage.objects;