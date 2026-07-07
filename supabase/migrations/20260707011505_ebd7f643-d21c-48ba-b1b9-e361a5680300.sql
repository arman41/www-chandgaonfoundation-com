
-- 1) Rewrite all policies using unqualified has_role → private.has_role
-- blood_donors
DROP POLICY IF EXISTS "Public can view blood donors" ON public.blood_donors;
DROP POLICY IF EXISTS "Admins can manage blood donors" ON public.blood_donors;
DROP POLICY IF EXISTS "Users can insert own donor profile" ON public.blood_donors;

CREATE POLICY "Authenticated can view blood donors"
  ON public.blood_donors FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage blood donors"
  ON public.blood_donors FOR ALL
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

-- INSERT with validation on phone (11 BD digits) and enforce owner
CREATE POLICY "Users can insert own donor profile"
  ON public.blood_donors FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND phone ~ '^01[3-9][0-9]{8}$'
    AND char_length(full_name) BETWEEN 2 AND 100
    AND char_length(district) BETWEEN 1 AND 100
    AND blood_group IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')
  );

-- also tighten UPDATE with same validation
DROP POLICY IF EXISTS "Users can update own donor profile" ON public.blood_donors;
CREATE POLICY "Users can update own donor profile"
  ON public.blood_donors FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND phone ~ '^01[3-9][0-9]{8}$'
    AND char_length(full_name) BETWEEN 2 AND 100
    AND blood_group IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')
  );

-- Public safe view (no phone / address / father_name / last_donation_date / notes)
DROP VIEW IF EXISTS public.blood_donors_public;
CREATE VIEW public.blood_donors_public
WITH (security_invoker = false) AS
SELECT id, full_name, blood_group, district, thana, is_available, photo_url, created_at
FROM public.blood_donors;
GRANT SELECT ON public.blood_donors_public TO anon, authenticated;

-- 2) donations moderator policy → private.has_role
DROP POLICY IF EXISTS "Moderators can update donations" ON public.donations;
CREATE POLICY "Moderators can update donations"
  ON public.donations FOR UPDATE
  TO authenticated
  USING (private.has_role(auth.uid(),'moderator'::app_role) OR private.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(),'moderator'::app_role) OR private.has_role(auth.uid(),'admin'::app_role));

-- help_applications moderator
DROP POLICY IF EXISTS "Moderators can view help apps" ON public.help_applications;
CREATE POLICY "Moderators can view help apps"
  ON public.help_applications FOR SELECT
  TO authenticated
  USING (private.has_role(auth.uid(),'moderator'::app_role) OR private.has_role(auth.uid(),'admin'::app_role));

DROP POLICY IF EXISTS "Moderators can update help apps" ON public.help_applications;
CREATE POLICY "Moderators can update help apps"
  ON public.help_applications FOR UPDATE
  TO authenticated
  USING (private.has_role(auth.uid(),'moderator'::app_role) OR private.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(),'moderator'::app_role) OR private.has_role(auth.uid(),'admin'::app_role));

-- activities moderator
DROP POLICY IF EXISTS "Moderators can insert activities" ON public.activities;
CREATE POLICY "Moderators can insert activities"
  ON public.activities FOR INSERT
  TO authenticated
  WITH CHECK (private.has_role(auth.uid(),'moderator'::app_role) OR private.has_role(auth.uid(),'admin'::app_role));

DROP POLICY IF EXISTS "Moderators can update activities" ON public.activities;
CREATE POLICY "Moderators can update activities"
  ON public.activities FOR UPDATE
  TO authenticated
  USING (private.has_role(auth.uid(),'moderator'::app_role) OR private.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(),'moderator'::app_role) OR private.has_role(auth.uid(),'admin'::app_role));

-- notices moderator
DROP POLICY IF EXISTS "Moderators can insert notices" ON public.notices;
CREATE POLICY "Moderators can insert notices"
  ON public.notices FOR INSERT
  TO authenticated
  WITH CHECK (private.has_role(auth.uid(),'moderator'::app_role) OR private.has_role(auth.uid(),'admin'::app_role));

DROP POLICY IF EXISTS "Moderators can update notices" ON public.notices;
CREATE POLICY "Moderators can update notices"
  ON public.notices FOR UPDATE
  TO authenticated
  USING (private.has_role(auth.uid(),'moderator'::app_role) OR private.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(),'moderator'::app_role) OR private.has_role(auth.uid(),'admin'::app_role));

-- gallery_items moderator
DROP POLICY IF EXISTS "Moderators can insert gallery" ON public.gallery_items;
CREATE POLICY "Moderators can insert gallery"
  ON public.gallery_items FOR INSERT
  TO authenticated
  WITH CHECK (private.has_role(auth.uid(),'moderator'::app_role) OR private.has_role(auth.uid(),'admin'::app_role));

DROP POLICY IF EXISTS "Moderators can update gallery" ON public.gallery_items;
CREATE POLICY "Moderators can update gallery"
  ON public.gallery_items FOR UPDATE
  TO authenticated
  USING (private.has_role(auth.uid(),'moderator'::app_role) OR private.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(),'moderator'::app_role) OR private.has_role(auth.uid(),'admin'::app_role));

-- 3) Revoke EXECUTE on public.has_role from anon/authenticated/PUBLIC
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;

-- 4) Add pdf_upload_token column for help applications
ALTER TABLE public.help_applications
  ADD COLUMN IF NOT EXISTS pdf_upload_token text;
