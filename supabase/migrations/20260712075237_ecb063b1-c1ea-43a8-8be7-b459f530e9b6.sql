ALTER VIEW public.blood_donors_public SET (security_invoker = true);
DROP POLICY IF EXISTS "Anyone view non-sensitive foundation settings" ON public.foundation_settings;
REVOKE SELECT ON public.foundation_settings FROM anon;