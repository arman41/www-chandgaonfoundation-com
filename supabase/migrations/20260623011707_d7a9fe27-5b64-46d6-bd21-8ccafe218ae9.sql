
ALTER TABLE public.foundation_settings
  ADD COLUMN IF NOT EXISTS union_ward_map jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.volunteers
  ADD COLUMN IF NOT EXISTS education text,
  ADD COLUMN IF NOT EXISTS previous_experience text;

-- Relax/extend public volunteer registration policy to allow new fields
DROP POLICY IF EXISTS "Public can register as volunteer" ON public.volunteers;
CREATE POLICY "Public can register as volunteer" ON public.volunteers
FOR INSERT TO anon, authenticated
WITH CHECK (
  status = 'pending'
  AND volunteer_code IS NULL
  AND assigned_task IS NULL
  AND char_length(name) BETWEEN 2 AND 100
  AND (phone IS NULL OR phone ~ '^01[3-9][0-9]{8}$')
  AND (area IS NULL OR char_length(area) <= 100)
  AND (role IS NULL OR char_length(role) <= 50)
  AND (skills IS NULL OR char_length(skills) <= 500)
  AND (education IS NULL OR char_length(education) <= 300)
  AND (previous_experience IS NULL OR char_length(previous_experience) <= 1000)
  AND (blood_group IS NULL OR blood_group IN ('A+','A-','B+','B-','AB+','AB-','O+','O-'))
  AND (photo_url IS NULL OR (char_length(photo_url) <= 500 AND photo_url ~ '^https://qxbqmronshdllgxptoxr\.supabase\.co/storage/v1/object/(public|sign)/'))
);
