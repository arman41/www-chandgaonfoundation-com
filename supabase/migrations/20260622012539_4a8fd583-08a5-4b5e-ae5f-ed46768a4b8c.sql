ALTER TABLE public.foundation_settings
  ADD COLUMN IF NOT EXISTS allowed_wards text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS allowed_unions text[] NOT NULL DEFAULT '{}';