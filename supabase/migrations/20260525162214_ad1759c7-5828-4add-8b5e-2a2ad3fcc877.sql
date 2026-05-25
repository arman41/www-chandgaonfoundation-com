
-- Add member_code (unique) and counter
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS member_code TEXT UNIQUE;

CREATE SEQUENCE IF NOT EXISTS public.members_code_seq START 1000;

CREATE OR REPLACE FUNCTION public.assign_member_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'approved' AND NEW.member_code IS NULL THEN
    NEW.member_code := 'CGF-' || lpad(nextval('public.members_code_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_assign_member_code ON public.members;
CREATE TRIGGER trg_assign_member_code
BEFORE INSERT OR UPDATE OF status ON public.members
FOR EACH ROW EXECUTE FUNCTION public.assign_member_code();

-- Public verification function (returns ONLY non-sensitive fields)
CREATE OR REPLACE FUNCTION public.verify_member_card(_code TEXT)
RETURNS TABLE (
  member_code TEXT,
  name TEXT,
  role TEXT,
  area TEXT,
  status TEXT,
  photo_url TEXT,
  join_date DATE
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT member_code, name, role, area, status, photo_url, join_date
  FROM public.members
  WHERE member_code = _code AND status = 'approved'
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.verify_member_card(TEXT) TO anon, authenticated;
