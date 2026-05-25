-- Single-row settings table for foundation-wide configuration
CREATE TABLE IF NOT EXISTS public.foundation_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'চাঁদগাঁও প্রবাসী ও যুবসমাজ কল্যাণ ফাউন্ডেশন',
  tagline text,
  phone text,
  email text,
  address text,
  logo_url text,
  facebook_url text,
  youtube_url text,
  whatsapp_url text,
  instagram_url text,
  twitter_url text,
  website_url text,
  bkash_number text,
  nagad_number text,
  rocket_number text,
  about_short text,
  is_singleton boolean NOT NULL DEFAULT true UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.foundation_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone view foundation settings"
  ON public.foundation_settings FOR SELECT
  USING (true);

CREATE POLICY "Admin update foundation settings"
  ON public.foundation_settings FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin insert foundation settings"
  ON public.foundation_settings FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_foundation_settings_touch
  BEFORE UPDATE ON public.foundation_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Seed the single row
INSERT INTO public.foundation_settings (name, phone, email, address)
VALUES (
  'চাঁদগাঁও প্রবাসী ও যুবসমাজ কল্যাণ ফাউন্ডেশন',
  '+8801XXXXXXXXX',
  'info@chandgaonfoundation.org',
  'চাঁদগাঁও, চট্টগ্রাম, বাংলাদেশ'
)
ON CONFLICT (is_singleton) DO NOTHING;