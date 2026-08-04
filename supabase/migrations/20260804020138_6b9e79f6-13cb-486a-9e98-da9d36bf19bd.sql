DROP POLICY IF EXISTS "Authenticated user submits own membership application" ON public.members;

CREATE POLICY "Authenticated user submits own membership application"
ON public.members
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND status = 'pending'
  AND member_code IS NULL
  AND join_date IS NULL
  AND (role IS NULL OR role = ANY (ARRAY['সদস্য'::text, 'স্বেচ্ছাসেবক'::text, 'সহযোগী সদস্য'::text, 'দাতা সদস্য'::text, 'আজীবন সদস্য'::text]))
  AND char_length(name) BETWEEN 2 AND 100
  AND phone IS NOT NULL
  AND phone ~ '^01[3-9][0-9]{8}$'
  AND (email IS NULL OR (char_length(email) <= 255 AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'))
  AND (notes IS NULL OR char_length(notes) <= 500)
  AND photo_url IS NOT NULL
  AND photo_url ~ '^https://vptpvtgspdgbtmlsupyk\.supabase\.co/storage/v1/object/(public|sign)/'
  AND nid_front_url IS NOT NULL
  AND nid_front_url ~ '^https://vptpvtgspdgbtmlsupyk\.supabase\.co/storage/v1/object/(public|sign)/'
  AND nid_back_url IS NOT NULL
  AND nid_back_url ~ '^https://vptpvtgspdgbtmlsupyk\.supabase\.co/storage/v1/object/(public|sign)/'
);

NOTIFY pgrst, 'reload schema';