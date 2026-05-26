-- Public can submit membership applications, but only as pending and without admin-managed fields
CREATE POLICY "Public can submit membership application"
ON public.members
FOR INSERT
TO anon, authenticated
WITH CHECK (
  status = 'pending'
  AND member_code IS NULL
  AND join_date IS NULL
);

-- Public can register as volunteers
CREATE POLICY "Public can register as volunteer"
ON public.volunteers
FOR INSERT
TO anon, authenticated
WITH CHECK (status IN ('active', 'pending'));

-- Public can submit donations (pending until admin verifies)
CREATE POLICY "Public can submit donation"
ON public.donations
FOR INSERT
TO anon, authenticated
WITH CHECK (status = 'pending');
