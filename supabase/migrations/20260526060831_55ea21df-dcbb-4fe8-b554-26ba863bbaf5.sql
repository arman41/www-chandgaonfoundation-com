
-- Update function to also stamp join_date and updated_at on approval
CREATE OR REPLACE FUNCTION public.assign_member_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status = 'approved' THEN
    IF NEW.member_code IS NULL THEN
      NEW.member_code := 'CGF-' || lpad(nextval('public.members_code_seq')::text, 6, '0');
    END IF;
    IF NEW.join_date IS NULL THEN
      NEW.join_date := CURRENT_DATE;
    END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS members_assign_code ON public.members;
CREATE TRIGGER members_assign_code
BEFORE INSERT OR UPDATE ON public.members
FOR EACH ROW
EXECUTE FUNCTION public.assign_member_code();

-- Backfill any already-approved members missing a code
UPDATE public.members
SET status = status
WHERE status = 'approved' AND member_code IS NULL;
