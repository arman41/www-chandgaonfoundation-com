DROP POLICY IF EXISTS "Public can submit membership application" ON public.members;

CREATE POLICY "Public can submit membership application"
ON public.members
FOR INSERT
TO anon, authenticated
WITH CHECK (
  status = 'pending'
  AND member_code IS NULL
  AND join_date IS NULL
  AND (role IS NULL OR role = 'সদস্য'::text OR role = 'স্বেচ্ছাসেবক'::text)
  AND char_length(name) BETWEEN 2 AND 100
  AND phone IS NOT NULL
  AND phone ~ '^01[3-9][0-9]{8}$'
  AND (email IS NULL OR (char_length(email) <= 255 AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'))
  AND (area IS NULL OR char_length(area) <= 100)
  AND (notes IS NULL OR char_length(notes) <= 500)
  AND (photo_url IS NULL OR char_length(photo_url) <= 500)
);