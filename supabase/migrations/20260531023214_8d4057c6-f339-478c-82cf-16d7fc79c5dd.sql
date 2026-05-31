
-- 1) aid_projects table
CREATE TABLE public.aid_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  budget NUMERIC,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT aid_projects_status_chk CHECK (status IN ('active','completed','closed'))
);

GRANT SELECT ON public.aid_projects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.aid_projects TO authenticated;
GRANT ALL ON public.aid_projects TO service_role;

ALTER TABLE public.aid_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone view aid projects" ON public.aid_projects
  FOR SELECT USING (true);
CREATE POLICY "Admin insert aid projects" ON public.aid_projects
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "Admin update aid projects" ON public.aid_projects
  FOR UPDATE TO authenticated USING (has_role(auth.uid(),'admin'::app_role)) WITH CHECK (has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "Admin delete aid projects" ON public.aid_projects
  FOR DELETE TO authenticated USING (has_role(auth.uid(),'admin'::app_role));

CREATE TRIGGER trg_aid_projects_updated
  BEFORE UPDATE ON public.aid_projects
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 2) extend help_applications
ALTER TABLE public.help_applications
  ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.aid_projects(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS father_name TEXT,
  ADD COLUMN IF NOT EXISTS mother_name TEXT,
  ADD COLUMN IF NOT EXISTS dob DATE,
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS occupation TEXT,
  ADD COLUMN IF NOT EXISTS monthly_income NUMERIC,
  ADD COLUMN IF NOT EXISTS family_count INT,
  ADD COLUMN IF NOT EXISTS present_address TEXT,
  ADD COLUMN IF NOT EXISTS permanent_address TEXT,
  ADD COLUMN IF NOT EXISTS photo_url TEXT,
  ADD COLUMN IF NOT EXISTS nid_front_url TEXT,
  ADD COLUMN IF NOT EXISTS nid_back_url TEXT,
  ADD COLUMN IF NOT EXISTS requested_amount NUMERIC,
  ADD COLUMN IF NOT EXISTS financial_condition TEXT,
  ADD COLUMN IF NOT EXISTS additional_notes TEXT;

-- 3) unique constraints per project (only when project_id present)
CREATE UNIQUE INDEX IF NOT EXISTS help_applications_project_nid_uniq
  ON public.help_applications (project_id, nid)
  WHERE project_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS help_applications_project_phone_uniq
  ON public.help_applications (project_id, phone)
  WHERE project_id IS NOT NULL;

-- 4) replace public insert policy to allow new optional fields
DROP POLICY IF EXISTS "Public can submit help application" ON public.help_applications;

CREATE POLICY "Public can submit help application" ON public.help_applications
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    status = 'pending'
    AND app_code IS NULL
    AND admin_notes IS NULL
    AND length(name) BETWEEN 2 AND 100
    AND phone ~ '^01[3-9][0-9]{8}$'
    AND length(nid) BETWEEN 10 AND 17
    AND nid ~ '^[0-9]+$'
    AND length(reason) BETWEEN 5 AND 1000
    AND (address IS NULL OR length(address) <= 500)
    AND (present_address IS NULL OR length(present_address) <= 500)
    AND (permanent_address IS NULL OR length(permanent_address) <= 500)
    AND (amount IS NULL OR length(amount) <= 20)
    AND file_count BETWEEN 0 AND 5
    AND (family_count IS NULL OR family_count BETWEEN 0 AND 50)
    AND (monthly_income IS NULL OR monthly_income BETWEEN 0 AND 10000000)
    AND (requested_amount IS NULL OR (requested_amount >= 0 AND requested_amount <= 10000000))
    AND (gender IS NULL OR gender IN ('male','female','other'))
    AND type = ANY (ARRAY[
      'আর্থিক সহায়তা','চিকিৎসা সহায়তা','শিক্ষা সহায়তা','খাদ্য সহায়তা',
      'শীতবস্ত্র','দুর্যোগকালীন সহায়তা','অন্যান্য'
    ])
  );
