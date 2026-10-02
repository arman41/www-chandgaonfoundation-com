DROP POLICY IF EXISTS "Anyone view events" ON public.events;
CREATE POLICY "Anyone view published events"
ON public.events
FOR SELECT
TO anon, authenticated
USING (status = 'published');