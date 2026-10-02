ALTER VIEW public.foundation_public_settings SET (security_invoker = false);
GRANT SELECT ON public.foundation_public_settings TO anon, authenticated;