
CREATE TABLE public.admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID,
  actor_email TEXT,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  target_label TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_admin_logs_created_at ON public.admin_activity_logs (created_at DESC);
CREATE INDEX idx_admin_logs_actor ON public.admin_activity_logs (actor_id);
CREATE INDEX idx_admin_logs_action ON public.admin_activity_logs (action);

ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view all logs"
  ON public.admin_activity_logs FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated can insert own logs"
  ON public.admin_activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (actor_id = auth.uid() OR actor_id IS NULL);

-- Trigger: log role changes automatically
CREATE OR REPLACE FUNCTION public.log_user_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor UUID := auth.uid();
  v_actor_email TEXT;
  v_target_email TEXT;
BEGIN
  SELECT email INTO v_actor_email FROM auth.users WHERE id = v_actor;

  IF TG_OP = 'INSERT' THEN
    SELECT email INTO v_target_email FROM auth.users WHERE id = NEW.user_id;
    INSERT INTO public.admin_activity_logs (actor_id, actor_email, action, target_type, target_id, target_label, details)
    VALUES (v_actor, v_actor_email, 'role.granted', 'user', NEW.user_id::text, v_target_email,
            jsonb_build_object('role', NEW.role));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    SELECT email INTO v_target_email FROM auth.users WHERE id = OLD.user_id;
    INSERT INTO public.admin_activity_logs (actor_id, actor_email, action, target_type, target_id, target_label, details)
    VALUES (v_actor, v_actor_email, 'role.revoked', 'user', OLD.user_id::text, v_target_email,
            jsonb_build_object('role', OLD.role));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_log_user_role_change
AFTER INSERT OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.log_user_role_change();
