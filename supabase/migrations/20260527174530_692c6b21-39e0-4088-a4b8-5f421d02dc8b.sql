
CREATE SEQUENCE IF NOT EXISTS public.help_app_code_seq;

CREATE TABLE public.help_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  app_code text UNIQUE,
  name text NOT NULL,
  phone text NOT NULL,
  nid text NOT NULL,
  address text,
  type text NOT NULL,
  amount text,
  reason text NOT NULL,
  file_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.help_applications TO authenticated;
GRANT INSERT ON public.help_applications TO anon;
GRANT ALL ON public.help_applications TO service_role;
GRANT USAGE ON SEQUENCE public.help_app_code_seq TO authenticated, anon, service_role;

ALTER TABLE public.help_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can submit help application"
ON public.help_applications
FOR INSERT
TO anon, authenticated
WITH CHECK (status = 'pending' AND app_code IS NULL AND admin_notes IS NULL);

CREATE POLICY "Staff view help applications"
ON public.help_applications
FOR SELECT
TO authenticated
USING (public.is_staff(auth.uid()));

CREATE POLICY "Admin update help applications"
ON public.help_applications
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin delete help applications"
ON public.help_applications
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.assign_help_app_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.app_code IS NULL THEN
    NEW.app_code := 'CF-' ||
      to_char(now(), 'YYMM') || '-' ||
      lpad((nextval('public.help_app_code_seq') % 10000)::text, 4, '0');
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER help_applications_assign_code
BEFORE INSERT OR UPDATE ON public.help_applications
FOR EACH ROW
EXECUTE FUNCTION public.assign_help_app_code();

CREATE OR REPLACE FUNCTION public.lookup_help_application(_code text)
RETURNS TABLE(
  app_code text,
  name text,
  type text,
  amount text,
  file_count integer,
  status text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT app_code, name, type, amount, file_count, status, created_at
  FROM public.help_applications
  WHERE upper(app_code) = upper(_code)
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.assign_help_app_code() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.lookup_help_application(text) TO anon, authenticated;
