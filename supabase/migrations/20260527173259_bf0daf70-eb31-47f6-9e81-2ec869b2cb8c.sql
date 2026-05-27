
-- 1) Restrict admin_activity_logs INSERT to admins only
DROP POLICY IF EXISTS "Authenticated can insert own logs" ON public.admin_activity_logs;

CREATE POLICY "Admins insert logs"
ON public.admin_activity_logs
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND (actor_id = auth.uid() OR actor_id IS NULL));

-- The log_user_role_change trigger runs as SECURITY DEFINER so it bypasses RLS regardless.

-- 2) Revoke EXECUTE on sensitive/trigger SECURITY DEFINER functions from anon/authenticated/public
REVOKE ALL ON FUNCTION public.grant_role_by_email(text, app_role) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user_role() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.log_user_role_change() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.assign_member_code() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;

-- has_role, is_staff, verify_member_card remain callable: has_role/is_staff are referenced
-- by RLS policies and verify_member_card backs the public QR card verification flow.

-- 3) Restrict public listing on foundation-media bucket while keeping direct-URL reads
DROP POLICY IF EXISTS "Public read foundation-media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view foundation-media" ON storage.objects;
DROP POLICY IF EXISTS "Public access foundation-media" ON storage.objects;
DROP POLICY IF EXISTS "foundation-media public read" ON storage.objects;

-- Note: public buckets serve files via signed-less public URLs even without a SELECT policy.
-- Removing broad SELECT prevents API-based listing of all objects.
