
-- Recreate views as security_invoker=true so they enforce caller's permissions and RLS
DROP VIEW IF EXISTS public.member_public_card;
DROP VIEW IF EXISTS public.volunteer_public_card;
DROP VIEW IF EXISTS public.foundation_public_settings;

CREATE VIEW public.member_public_card WITH (security_invoker = true) AS
SELECT member_code, name, role, area, status, photo_url, join_date
FROM public.members WHERE status = 'approved';

CREATE VIEW public.volunteer_public_card WITH (security_invoker = true) AS
SELECT volunteer_code, name, role, area, skills, assigned_task, status, photo_url, blood_group, joined_at, expires_at
FROM public.volunteers WHERE status = 'active';

CREATE VIEW public.foundation_public_settings WITH (security_invoker = true) AS
SELECT id, name, tagline, phone, email, address, logo_url,
       facebook_url, youtube_url, whatsapp_url, instagram_url, twitter_url, website_url,
       about_short, allowed_wards, allowed_unions, allowed_thanas, union_ward_map
FROM public.foundation_settings;

GRANT SELECT ON public.member_public_card TO anon, authenticated;
GRANT SELECT ON public.volunteer_public_card TO anon, authenticated;
GRANT SELECT ON public.foundation_public_settings TO anon, authenticated;

-- Column-scoped grants so anon can only read the safe columns of these tables
GRANT SELECT (member_code, name, role, area, status, photo_url, join_date)
  ON public.members TO anon, authenticated;
GRANT SELECT (volunteer_code, name, role, area, skills, assigned_task, status, photo_url, blood_group, joined_at, expires_at)
  ON public.volunteers TO anon, authenticated;
GRANT SELECT (id, name, tagline, phone, email, address, logo_url,
              facebook_url, youtube_url, whatsapp_url, instagram_url, twitter_url, website_url,
              about_short, allowed_wards, allowed_unions, allowed_thanas, union_ward_map)
  ON public.foundation_settings TO anon, authenticated;

-- Row-level policies that the security_invoker views (and direct safe-column reads) will be filtered by
DROP POLICY IF EXISTS "Anon view approved members" ON public.members;
CREATE POLICY "Anon view approved members" ON public.members
  FOR SELECT TO anon, authenticated
  USING (status = 'approved');

DROP POLICY IF EXISTS "Anon view active volunteers" ON public.volunteers;
CREATE POLICY "Anon view active volunteers" ON public.volunteers
  FOR SELECT TO anon, authenticated
  USING (status = 'active');

DROP POLICY IF EXISTS "Anyone view non-sensitive foundation settings" ON public.foundation_settings;
CREATE POLICY "Anyone view non-sensitive foundation settings" ON public.foundation_settings
  FOR SELECT TO anon, authenticated
  USING (true);
