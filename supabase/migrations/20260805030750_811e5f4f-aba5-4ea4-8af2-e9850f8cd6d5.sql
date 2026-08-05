GRANT SELECT ON TABLE public.user_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.members TO authenticated;
GRANT ALL ON TABLE public.user_roles, public.members TO service_role;
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_staff(uuid) TO authenticated;
NOTIFY pgrst, 'reload schema';