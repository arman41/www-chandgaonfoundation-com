CREATE TABLE public.distribution_slips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.help_applications(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL,
  project_id UUID REFERENCES public.aid_projects(id) ON DELETE SET NULL,
  app_code TEXT,
  applicant_name TEXT NOT NULL,
  father_name TEXT,
  phone TEXT,
  nid TEXT,
  project_name TEXT,
  distribution_date DATE NOT NULL,
  distribution_day TEXT,
  distribution_time TEXT,
  distribution_location TEXT,
  batch_number TEXT,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_distribution_slips_application ON public.distribution_slips(application_id);
CREATE INDEX idx_distribution_slips_project ON public.distribution_slips(project_id);
CREATE INDEX idx_distribution_slips_date ON public.distribution_slips(distribution_date);
CREATE INDEX idx_distribution_slips_batch ON public.distribution_slips(batch_number);

GRANT SELECT ON public.distribution_slips TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.distribution_slips TO authenticated;
GRANT ALL ON public.distribution_slips TO service_role;

ALTER TABLE public.distribution_slips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone view distribution slips"
  ON public.distribution_slips FOR SELECT
  USING (true);

CREATE POLICY "Admin insert distribution slips"
  ON public.distribution_slips FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin update distribution slips"
  ON public.distribution_slips FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin delete distribution slips"
  ON public.distribution_slips FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_distribution_slips_updated
  BEFORE UPDATE ON public.distribution_slips
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();