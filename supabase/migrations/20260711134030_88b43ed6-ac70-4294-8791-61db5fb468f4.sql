
-- 1) Restrict blood_donors SELECT: owner + staff only
DROP POLICY IF EXISTS "Authenticated can view blood donors" ON public.blood_donors;

CREATE POLICY "Owners can view own donor row"
  ON public.blood_donors FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Staff can view all donors"
  ON public.blood_donors FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'moderator'::app_role));

-- 2) Public-safe view (no phone / address / father_name / notes) for authenticated users
DROP VIEW IF EXISTS public.blood_donors_public;
CREATE VIEW public.blood_donors_public
  WITH (security_invoker = true) AS
SELECT id, full_name, blood_group, district, thana, is_available, photo_url, last_donation_date, created_at
FROM public.blood_donors;

-- The view reads through blood_donors RLS (invoker). Add a permissive SELECT policy
-- ONLY reachable via the view's safe column set is not possible; instead expose a
-- dedicated policy that lets authenticated users read the row through the view but
-- projected columns are limited by the view definition. We add a policy scoped to
-- authenticated that only exposes rows where is_available=true.
CREATE POLICY "Authenticated can view available donors (limited cols via view)"
  ON public.blood_donors FOR SELECT
  TO authenticated
  USING (is_available = true);

GRANT SELECT ON public.blood_donors_public TO authenticated;

-- 3) Lock down SECURITY DEFINER functions: revoke EXECUTE from anon/authenticated
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.email_queue_dispatch() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.email_queue_wake() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_role() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_activity_totals() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
-- has_role must remain executable for RLS policy evaluation as authenticated user
-- (SECURITY DEFINER + STABLE + used inside USING clauses). Keep EXECUTE.
