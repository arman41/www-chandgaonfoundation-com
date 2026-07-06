
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
$$;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO anon, authenticated, service_role;

CREATE TABLE public.blood_donors (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  father_name text,
  phone text NOT NULL,
  blood_group text NOT NULL,
  district text NOT NULL,
  thana text,
  address text,
  photo_url text,
  last_donation_date date,
  is_available boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

GRANT SELECT ON public.blood_donors TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blood_donors TO authenticated;
GRANT ALL ON public.blood_donors TO service_role;

ALTER TABLE public.blood_donors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view blood donors" ON public.blood_donors FOR SELECT USING (true);
CREATE POLICY "Users can insert own donor profile" ON public.blood_donors FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own donor profile" ON public.blood_donors FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own donor profile" ON public.blood_donors FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage blood donors" ON public.blood_donors FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_blood_donors_updated_at BEFORE UPDATE ON public.blood_donors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_blood_donors_district ON public.blood_donors(district);
CREATE INDEX idx_blood_donors_group ON public.blood_donors(blood_group);

ALTER TABLE public.donations ALTER COLUMN status SET DEFAULT 'approved';

CREATE POLICY "Moderators can update donations" ON public.donations FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'moderator'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'moderator'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Moderators can view help apps" ON public.help_applications FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'moderator'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Moderators can update help apps" ON public.help_applications FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'moderator'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'moderator'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Moderators can insert activities" ON public.activities FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'moderator'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Moderators can update activities" ON public.activities FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'moderator'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'moderator'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Moderators can insert notices" ON public.notices FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'moderator'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Moderators can update notices" ON public.notices FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'moderator'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'moderator'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Moderators can insert gallery" ON public.gallery_items FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'moderator'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Moderators can update gallery" ON public.gallery_items FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'moderator'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'moderator'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role));
