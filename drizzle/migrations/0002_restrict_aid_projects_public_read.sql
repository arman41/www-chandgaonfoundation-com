DROP POLICY "Anyone view aid projects" ON public.aid_projects;

CREATE POLICY "Public view active aid projects"
ON public.aid_projects
FOR SELECT
TO anon, authenticated
USING (status = 'active');

CREATE POLICY "Staff view all aid projects"
ON public.aid_projects
FOR SELECT
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'moderator'::app_role));