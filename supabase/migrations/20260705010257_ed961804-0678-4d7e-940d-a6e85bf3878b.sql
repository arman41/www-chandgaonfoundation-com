
-- Activity goal tracking columns
ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS goal_amount numeric(12,2),
  ADD COLUMN IF NOT EXISTS raised_amount numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS supporters_count integer NOT NULL DEFAULT 0;

-- Link donations to a specific activity (optional)
ALTER TABLE public.donations
  ADD COLUMN IF NOT EXISTS activity_id uuid REFERENCES public.activities(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_donations_activity_id ON public.donations(activity_id);

-- Auto-increment activity raised/supporters when donation becomes approved,
-- and decrement when it is unapproved / removed.
CREATE OR REPLACE FUNCTION public.sync_activity_totals()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  was_approved boolean := FALSE;
  is_approved  boolean := FALSE;
  old_aid uuid;
  new_aid uuid;
BEGIN
  IF TG_OP = 'INSERT' THEN
    is_approved := (NEW.status = 'approved');
    new_aid := NEW.activity_id;
    IF is_approved AND new_aid IS NOT NULL THEN
      UPDATE public.activities
        SET raised_amount = raised_amount + NEW.amount,
            supporters_count = supporters_count + 1
        WHERE id = new_aid;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    was_approved := (OLD.status = 'approved');
    is_approved  := (NEW.status = 'approved');
    old_aid := OLD.activity_id;
    new_aid := NEW.activity_id;
    IF was_approved AND old_aid IS NOT NULL THEN
      UPDATE public.activities
        SET raised_amount = GREATEST(raised_amount - OLD.amount, 0),
            supporters_count = GREATEST(supporters_count - 1, 0)
        WHERE id = old_aid;
    END IF;
    IF is_approved AND new_aid IS NOT NULL THEN
      UPDATE public.activities
        SET raised_amount = raised_amount + NEW.amount,
            supporters_count = supporters_count + 1
        WHERE id = new_aid;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.status = 'approved' AND OLD.activity_id IS NOT NULL THEN
      UPDATE public.activities
        SET raised_amount = GREATEST(raised_amount - OLD.amount, 0),
            supporters_count = GREATEST(supporters_count - 1, 0)
        WHERE id = OLD.activity_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_activity_totals() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS tg_donations_sync_activity ON public.donations;
CREATE TRIGGER tg_donations_sync_activity
AFTER INSERT OR UPDATE OR DELETE ON public.donations
FOR EACH ROW EXECUTE FUNCTION public.sync_activity_totals();
