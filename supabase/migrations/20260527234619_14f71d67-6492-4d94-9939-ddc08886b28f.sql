
-- Trigger functions should not be callable via the API
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_user_role_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_role() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.assign_member_code() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.assign_help_app_code() FROM PUBLIC, anon, authenticated;
