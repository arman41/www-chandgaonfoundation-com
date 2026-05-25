CREATE OR REPLACE FUNCTION public.grant_role_by_email(_email text, _role app_role)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_role_id uuid;
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can grant roles';
  END IF;

  SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = lower(_email) LIMIT 1;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No user found with that email';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, _role)
  ON CONFLICT (user_id, role) DO NOTHING
  RETURNING id INTO v_role_id;

  RETURN COALESCE(v_role_id, (SELECT id FROM public.user_roles WHERE user_id = v_user_id AND role = _role));
END;
$$;

REVOKE EXECUTE ON FUNCTION public.grant_role_by_email(text, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.grant_role_by_email(text, app_role) TO authenticated;