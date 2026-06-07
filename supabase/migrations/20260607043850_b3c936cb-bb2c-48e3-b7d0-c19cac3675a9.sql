
ALTER TABLE public.volunteers
  ADD COLUMN IF NOT EXISTS volunteer_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS photo_url text,
  ADD COLUMN IF NOT EXISTS role text,
  ADD COLUMN IF NOT EXISTS blood_group text,
  ADD COLUMN IF NOT EXISTS expires_at date;

CREATE SEQUENCE IF NOT EXISTS public.volunteers_code_seq START 1;

CREATE OR REPLACE FUNCTION public.assign_volunteer_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'active' THEN
    IF NEW.volunteer_code IS NULL THEN
      NEW.volunteer_code := 'CGF-V-' || lpad(nextval('public.volunteers_code_seq')::text, 6, '0');
    END IF;
    IF NEW.joined_at IS NULL THEN
      NEW.joined_at := CURRENT_DATE;
    END IF;
    IF NEW.expires_at IS NULL THEN
      NEW.expires_at := (CURRENT_DATE + INTERVAL '2 years')::date;
    END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tg_volunteers_assign_code ON public.volunteers;
CREATE TRIGGER tg_volunteers_assign_code
BEFORE INSERT OR UPDATE ON public.volunteers
FOR EACH ROW EXECUTE FUNCTION public.assign_volunteer_code();

-- Backfill codes for existing active volunteers
UPDATE public.volunteers
SET volunteer_code = 'CGF-V-' || lpad(nextval('public.volunteers_code_seq')::text, 6, '0')
WHERE status = 'active' AND volunteer_code IS NULL;

CREATE OR REPLACE FUNCTION public.verify_volunteer_card(_code text)
RETURNS TABLE(
  volunteer_code text, name text, role text, area text, skills text,
  assigned_task text, status text, photo_url text, blood_group text,
  joined_at date, expires_at date
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT volunteer_code, name, role, area, skills, assigned_task, status,
         photo_url, blood_group, joined_at, expires_at
  FROM public.volunteers
  WHERE volunteer_code = _code AND status = 'active'
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.verify_volunteer_card(text) TO anon, authenticated;
