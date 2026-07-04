
ALTER TABLE public.foundation_settings
  ADD COLUMN IF NOT EXISTS overall_goal_amount NUMERIC(14,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS overall_raised_amount NUMERIC(14,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS overall_goal_label TEXT;

ALTER TABLE public.aid_projects
  ADD COLUMN IF NOT EXISTS goal_amount NUMERIC(14,2),
  ADD COLUMN IF NOT EXISTS raised_amount NUMERIC(14,2) DEFAULT 0;

ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS membership_type TEXT,
  ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;
