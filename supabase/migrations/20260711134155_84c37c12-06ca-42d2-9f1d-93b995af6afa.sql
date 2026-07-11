
-- Undo the overly broad policy from previous migration
DROP POLICY IF EXISTS "Authenticated can view available donors (limited cols via view)" ON public.blood_donors;

-- Repoint the new staff policy to the canonical private.has_role helper
DROP POLICY IF EXISTS "Staff can view all donors" ON public.blood_donors;
CREATE POLICY "Staff can view all donors"
  ON public.blood_donors FOR SELECT
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'moderator'::app_role));

-- Recreate the public view WITHOUT security_invoker so it bypasses base-table RLS
-- and exposes only safe columns to authenticated users.
DROP VIEW IF EXISTS public.blood_donors_public;
CREATE VIEW public.blood_donors_public AS
SELECT id, full_name, blood_group, district, thana, is_available, photo_url, last_donation_date, created_at
FROM public.blood_donors
WHERE is_available = true;
GRANT SELECT ON public.blood_donors_public TO authenticated;

-- Drop the unused public.has_role (all policies use private.has_role)
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);
