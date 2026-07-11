
GRANT SELECT ON public.foundation_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.foundation_settings TO authenticated;
GRANT ALL ON public.foundation_settings TO service_role;

INSERT INTO public.foundation_settings (name, is_singleton)
VALUES ('চাঁদগাঁও ফাউন্ডেশন', true)
ON CONFLICT (is_singleton) DO NOTHING;
