
-- Volunteers: restrict public insert to pending only
DROP POLICY IF EXISTS "Public can register as volunteer" ON public.volunteers;
CREATE POLICY "Public can register as volunteer"
  ON public.volunteers FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'pending');

-- Members: ensure pending + no self-assigned admin fields + role defaults
DROP POLICY IF EXISTS "Public can submit membership application" ON public.members;
CREATE POLICY "Public can submit membership application"
  ON public.members FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    status = 'pending'
    AND member_code IS NULL
    AND join_date IS NULL
    AND (role IS NULL OR role = 'সদস্য')
  );

-- Help applications: tighten type whitelist + no admin fields
DROP POLICY IF EXISTS "Public can submit help application" ON public.help_applications;
CREATE POLICY "Public can submit help application"
  ON public.help_applications FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    status = 'pending'
    AND app_code IS NULL
    AND admin_notes IS NULL
    AND length(name) BETWEEN 2 AND 100
    AND phone ~ '^01[3-9][0-9]{8}$'
    AND length(nid) BETWEEN 10 AND 17
    AND nid ~ '^[0-9]+$'
    AND length(reason) BETWEEN 5 AND 1000
    AND (address IS NULL OR length(address) <= 500)
    AND (amount IS NULL OR length(amount) <= 20)
    AND file_count BETWEEN 0 AND 5
    AND type IN (
      'আর্থিক সহায়তা','চিকিৎসা সহায়তা','শিক্ষা সহায়তা',
      'খাদ্য সহায়তা','শীতবস্ত্র','দুর্যোগকালীন সহায়তা','অন্যান্য'
    )
  );

-- Donations: keep pending-only public insert with basic shape checks
DROP POLICY IF EXISTS "Public can submit donation" ON public.donations;
CREATE POLICY "Public can submit donation"
  ON public.donations FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    status = 'pending'
    AND amount > 0
    AND amount <= 10000000
    AND length(donor_name) BETWEEN 2 AND 100
    AND (donor_phone IS NULL OR donor_phone ~ '^01[3-9][0-9]{8}$')
    AND method IN ('bkash','nagad','rocket','bank','cash','Cash')
  );
