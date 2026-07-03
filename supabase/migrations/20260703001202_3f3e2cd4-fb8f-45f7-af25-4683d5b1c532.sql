
ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS district text,
  ADD COLUMN IF NOT EXISTS thana text,
  ADD COLUMN IF NOT EXISTS union_name text,
  ADD COLUMN IF NOT EXISTS ward text,
  ADD COLUMN IF NOT EXISTS nid_front_url text,
  ADD COLUMN IF NOT EXISTS nid_back_url text;

ALTER TABLE public.volunteers
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS nid_front_url text,
  ADD COLUMN IF NOT EXISTS nid_back_url text;

CREATE INDEX IF NOT EXISTS idx_members_user_id ON public.members(user_id);
CREATE INDEX IF NOT EXISTS idx_volunteers_user_id ON public.volunteers(user_id);

-- MEMBERS: replace anon-insert policy with authenticated + linked user + mandatory NID photos
DROP POLICY IF EXISTS "Public can submit membership application" ON public.members;
CREATE POLICY "Authenticated user submits own membership application"
  ON public.members FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND status = 'pending'
    AND member_code IS NULL
    AND join_date IS NULL
    AND ((role IS NULL) OR (role = ANY (ARRAY['সদস্য','স্বেচ্ছাসেবক','সহযোগী সদস্য','দাতা সদস্য','আজীবন সদস্য'])))
    AND (char_length(name) BETWEEN 2 AND 100)
    AND phone IS NOT NULL AND phone ~ '^01[3-9][0-9]{8}$'
    AND (email IS NULL OR (char_length(email) <= 255 AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'))
    AND (notes IS NULL OR char_length(notes) <= 500)
    AND photo_url IS NOT NULL AND photo_url ~ '^https://qxbqmronshdllgxptoxr\.supabase\.co/storage/v1/object/(public|sign)/'
    AND nid_front_url IS NOT NULL AND nid_front_url ~ '^https://qxbqmronshdllgxptoxr\.supabase\.co/storage/v1/object/(public|sign)/'
    AND nid_back_url IS NOT NULL AND nid_back_url ~ '^https://qxbqmronshdllgxptoxr\.supabase\.co/storage/v1/object/(public|sign)/'
  );

DROP POLICY IF EXISTS "User views own membership" ON public.members;
CREATE POLICY "User views own membership"
  ON public.members FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- VOLUNTEERS: replace anon-insert policy with authenticated + linked user + mandatory NID photos
DROP POLICY IF EXISTS "Public can register as volunteer" ON public.volunteers;
CREATE POLICY "Authenticated user registers as volunteer"
  ON public.volunteers FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND status = 'pending'
    AND volunteer_code IS NULL
    AND assigned_task IS NULL
    AND (char_length(name) BETWEEN 2 AND 100)
    AND (phone IS NULL OR phone ~ '^01[3-9][0-9]{8}$')
    AND (area IS NULL OR char_length(area) <= 100)
    AND (role IS NULL OR char_length(role) <= 50)
    AND (skills IS NULL OR char_length(skills) <= 500)
    AND (education IS NULL OR char_length(education) <= 300)
    AND (previous_experience IS NULL OR char_length(previous_experience) <= 1000)
    AND (blood_group IS NULL OR blood_group = ANY (ARRAY['A+','A-','B+','B-','AB+','AB-','O+','O-']))
    AND photo_url IS NOT NULL AND photo_url ~ '^https://qxbqmronshdllgxptoxr\.supabase\.co/storage/v1/object/(public|sign)/'
    AND nid_front_url IS NOT NULL AND nid_front_url ~ '^https://qxbqmronshdllgxptoxr\.supabase\.co/storage/v1/object/(public|sign)/'
    AND nid_back_url IS NOT NULL AND nid_back_url ~ '^https://qxbqmronshdllgxptoxr\.supabase\.co/storage/v1/object/(public|sign)/'
  );

DROP POLICY IF EXISTS "User views own volunteer record" ON public.volunteers;
CREATE POLICY "User views own volunteer record"
  ON public.volunteers FOR SELECT TO authenticated
  USING (user_id = auth.uid());
