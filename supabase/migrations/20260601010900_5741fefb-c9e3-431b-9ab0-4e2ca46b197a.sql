-- application-pdf bucket for receipts
INSERT INTO storage.buckets (id, name, public)
VALUES ('application-pdf', 'application-pdf', true)
ON CONFLICT (id) DO NOTHING;

-- Public read
CREATE POLICY "Public read application-pdf"
ON storage.objects FOR SELECT
USING (bucket_id = 'application-pdf');

-- Anyone can upload receipts (client generates after submit)
CREATE POLICY "Anyone upload application-pdf"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'application-pdf');

-- Admin can delete/update
CREATE POLICY "Admin manage application-pdf"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'application-pdf' AND has_role(auth.uid(), 'admin'::app_role));

-- Add pdf_url column
ALTER TABLE public.help_applications
ADD COLUMN IF NOT EXISTS pdf_url text;

-- Allow anon to UPDATE just the pdf_url right after their insert (via app_code match)
-- Simpler: rely on a security-definer RPC instead
CREATE OR REPLACE FUNCTION public.attach_application_pdf(_app_code text, _pdf_url text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.help_applications
  SET pdf_url = _pdf_url, updated_at = now()
  WHERE app_code = _app_code AND (pdf_url IS NULL OR pdf_url = '');
END;
$$;

GRANT EXECUTE ON FUNCTION public.attach_application_pdf(text, text) TO anon, authenticated;