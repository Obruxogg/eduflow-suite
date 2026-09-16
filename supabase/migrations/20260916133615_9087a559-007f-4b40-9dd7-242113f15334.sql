
REVOKE ALL ON FUNCTION public.has_role(UUID, TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.current_teacher_id() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_teacher_id() TO authenticated;
REVOKE ALL ON FUNCTION public.admin_exists() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_exists() TO anon, authenticated;
