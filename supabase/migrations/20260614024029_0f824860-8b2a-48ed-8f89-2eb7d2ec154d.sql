
-- Restrict photo_url to our own Supabase storage on public INSERT policies

DROP POLICY IF EXISTS "Public can submit membership application" ON public.members;
CREATE POLICY "Public can submit membership application"
ON public.members
FOR INSERT
TO anon, authenticated
WITH CHECK (
  (status = 'pending'::text)
  AND (member_code IS NULL)
  AND (join_date IS NULL)
  AND ((role IS NULL) OR (role = 'সদস্য'::text) OR (role = 'স্বেচ্ছাসেবক'::text))
  AND ((char_length(name) >= 2) AND (char_length(name) <= 100))
  AND (phone IS NOT NULL) AND (phone ~ '^01[3-9][0-9]{8}$'::text)
  AND ((email IS NULL) OR ((char_length(email) <= 255) AND (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text)))
  AND ((area IS NULL) OR (char_length(area) <= 100))
  AND ((notes IS NULL) OR (char_length(notes) <= 500))
  AND (
    (photo_url IS NULL)
    OR (
      char_length(photo_url) <= 500
      AND photo_url ~ '^https://qxbqmronshdllgxptoxr\.supabase\.co/storage/v1/object/(public|sign)/'
    )
  )
);

DROP POLICY IF EXISTS "Public can register as volunteer" ON public.volunteers;
CREATE POLICY "Public can register as volunteer"
ON public.volunteers
FOR INSERT
TO anon, authenticated
WITH CHECK (
  (status = 'pending'::text)
  AND (volunteer_code IS NULL)
  AND (assigned_task IS NULL)
  AND ((char_length(name) >= 2) AND (char_length(name) <= 100))
  AND ((phone IS NULL) OR (phone ~ '^01[3-9][0-9]{8}$'::text))
  AND ((area IS NULL) OR (char_length(area) <= 100))
  AND ((role IS NULL) OR (char_length(role) <= 50))
  AND ((skills IS NULL) OR (char_length(skills) <= 500))
  AND ((blood_group IS NULL) OR (blood_group = ANY (ARRAY['A+'::text,'A-'::text,'B+'::text,'B-'::text,'AB+'::text,'AB-'::text,'O+'::text,'O-'::text])))
  AND (
    (photo_url IS NULL)
    OR (
      char_length(photo_url) <= 500
      AND photo_url ~ '^https://qxbqmronshdllgxptoxr\.supabase\.co/storage/v1/object/(public|sign)/'
    )
  )
);
