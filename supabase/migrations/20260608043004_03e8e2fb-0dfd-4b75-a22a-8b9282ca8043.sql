
-- 1) application-pdf: restrict anon upload to applications/ prefix; allow staff to upload anywhere
DROP POLICY IF EXISTS "Anyone upload pdf to application-pdf" ON storage.objects;

CREATE POLICY "Anon upload pdf to applications folder"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (
    bucket_id = 'application-pdf'
    AND lower(storage.extension(name)) = 'pdf'
    AND (storage.foldername(name))[1] = 'applications'
  );

CREATE POLICY "Staff upload application-pdf anywhere"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'application-pdf'
    AND lower(storage.extension(name)) = 'pdf'
    AND public.is_staff(auth.uid())
  );

-- 2) volunteers: tighten anon insert with field validation
DROP POLICY IF EXISTS "Public can register as volunteer" ON public.volunteers;

CREATE POLICY "Public can register as volunteer"
  ON public.volunteers FOR INSERT
  WITH CHECK (
    status = 'pending'
    AND volunteer_code IS NULL
    AND assigned_task IS NULL
    AND char_length(name) BETWEEN 2 AND 100
    AND (phone IS NULL OR phone ~ '^01[3-9][0-9]{8}$')
    AND (area IS NULL OR char_length(area) <= 100)
    AND (role IS NULL OR char_length(role) <= 50)
    AND (skills IS NULL OR char_length(skills) <= 500)
    AND (blood_group IS NULL OR blood_group IN ('A+','A-','B+','B-','AB+','AB-','O+','O-'))
    AND (photo_url IS NULL OR char_length(photo_url) <= 500)
  );
