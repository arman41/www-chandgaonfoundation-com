DROP POLICY IF EXISTS "Public can submit help applications" ON public.help_applications;

CREATE POLICY "Public can submit help applications"
ON public.help_applications
FOR INSERT
TO anon, authenticated
WITH CHECK (
  status = 'pending'
  AND admin_notes IS NULL
  AND char_length(name) BETWEEN 2 AND 100
  AND phone ~ '^01[3-9][0-9]{8}$'
  AND nid ~ '^[0-9]+$'
  AND char_length(nid) IN (10, 13, 17)
  AND char_length(reason) BETWEEN 5 AND 1000
  AND (address IS NULL OR char_length(address) <= 500)
  AND (amount IS NULL OR char_length(amount) <= 20)
  AND file_count BETWEEN 0 AND 5
  AND (additional_notes IS NULL OR char_length(additional_notes) <= 1000)
  AND (financial_condition IS NULL OR char_length(financial_condition) <= 1000)
);