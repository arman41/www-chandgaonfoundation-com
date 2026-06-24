
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
CREATE OR REPLACE FUNCTION private.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin'::public.app_role, 'moderator'::public.app_role))
$$;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_staff(uuid) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION private.touch_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION private.assign_member_code() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'approved' THEN
    IF NEW.member_code IS NULL THEN
      NEW.member_code := 'CGF-' || lpad(nextval('public.members_code_seq')::text, 6, '0');
    END IF;
    IF NEW.join_date IS NULL THEN NEW.join_date := CURRENT_DATE; END IF;
  END IF;
  NEW.updated_at := now(); RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION private.assign_volunteer_code() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'active' THEN
    IF NEW.volunteer_code IS NULL THEN
      NEW.volunteer_code := 'CGF-V-' || lpad(nextval('public.volunteers_code_seq')::text, 6, '0');
    END IF;
    IF NEW.joined_at IS NULL THEN NEW.joined_at := CURRENT_DATE; END IF;
    IF NEW.expires_at IS NULL THEN NEW.expires_at := (CURRENT_DATE + INTERVAL '2 years')::date; END IF;
  END IF;
  NEW.updated_at := now(); RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION private.assign_help_app_code() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.app_code IS NULL THEN
    NEW.app_code := 'CF-' || to_char(now(), 'YYMM') || '-' || lpad((nextval('public.help_app_code_seq') % 10000)::text, 4, '0');
  END IF;
  NEW.updated_at := now(); RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION private.log_user_role_change() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_actor UUID := auth.uid(); v_actor_email TEXT; v_target_email TEXT;
BEGIN
  SELECT email INTO v_actor_email FROM auth.users WHERE id = v_actor;
  IF TG_OP = 'INSERT' THEN
    SELECT email INTO v_target_email FROM auth.users WHERE id = NEW.user_id;
    INSERT INTO public.admin_activity_logs (actor_id, actor_email, action, target_type, target_id, target_label, details)
    VALUES (v_actor, v_actor_email, 'role.granted', 'user', NEW.user_id::text, v_target_email, jsonb_build_object('role', NEW.role));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    SELECT email INTO v_target_email FROM auth.users WHERE id = OLD.user_id;
    INSERT INTO public.admin_activity_logs (actor_id, actor_email, action, target_type, target_id, target_label, details)
    VALUES (v_actor, v_actor_email, 'role.revoked', 'user', OLD.user_id::text, v_target_email, jsonb_build_object('role', OLD.role));
    RETURN OLD;
  END IF;
  RETURN NULL;
END; $$;

CREATE OR REPLACE FUNCTION private.grant_role_by_email(_actor uuid, _email text, _role public.app_role)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_user_id uuid; v_role_id uuid;
BEGIN
  IF NOT private.has_role(_actor, 'admin'::public.app_role) THEN RAISE EXCEPTION 'Only admins can grant roles'; END IF;
  SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = lower(_email) LIMIT 1;
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'No user found with that email'; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (v_user_id, _role)
    ON CONFLICT (user_id, role) DO NOTHING RETURNING id INTO v_role_id;
  RETURN COALESCE(v_role_id, (SELECT id FROM public.user_roles WHERE user_id = v_user_id AND role = _role));
END; $$;

CREATE OR REPLACE FUNCTION private.lookup_help_application(_code text)
RETURNS TABLE(app_code text, name text, type text, amount text, file_count integer, status text, created_at timestamp with time zone)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT app_code, name, type, amount, file_count, status, created_at
  FROM public.help_applications WHERE upper(app_code) = upper(_code) LIMIT 1;
$$;

DROP TRIGGER IF EXISTS tg_donations_updated ON public.donations;
DROP TRIGGER IF EXISTS tg_events_updated ON public.events;
DROP TRIGGER IF EXISTS tg_members_updated ON public.members;
DROP TRIGGER IF EXISTS tg_notices_updated ON public.notices;
DROP TRIGGER IF EXISTS tg_volunteers_updated ON public.volunteers;
DROP TRIGGER IF EXISTS trg_foundation_settings_touch ON public.foundation_settings;
DROP TRIGGER IF EXISTS trg_aid_projects_updated ON public.aid_projects;
DROP TRIGGER IF EXISTS trg_distribution_slips_updated ON public.distribution_slips;
DROP TRIGGER IF EXISTS trg_assign_member_code ON public.members;
DROP TRIGGER IF EXISTS members_assign_code ON public.members;
DROP TRIGGER IF EXISTS help_applications_assign_code ON public.help_applications;
DROP TRIGGER IF EXISTS tg_volunteers_assign_code ON public.volunteers;
DROP TRIGGER IF EXISTS trg_log_user_role_change ON public.user_roles;

CREATE TRIGGER tg_donations_updated BEFORE UPDATE ON public.donations FOR EACH ROW EXECUTE FUNCTION private.touch_updated_at();
CREATE TRIGGER tg_events_updated BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION private.touch_updated_at();
CREATE TRIGGER tg_members_updated BEFORE UPDATE ON public.members FOR EACH ROW EXECUTE FUNCTION private.touch_updated_at();
CREATE TRIGGER tg_notices_updated BEFORE UPDATE ON public.notices FOR EACH ROW EXECUTE FUNCTION private.touch_updated_at();
CREATE TRIGGER tg_volunteers_updated BEFORE UPDATE ON public.volunteers FOR EACH ROW EXECUTE FUNCTION private.touch_updated_at();
CREATE TRIGGER trg_foundation_settings_touch BEFORE UPDATE ON public.foundation_settings FOR EACH ROW EXECUTE FUNCTION private.touch_updated_at();
CREATE TRIGGER trg_aid_projects_updated BEFORE UPDATE ON public.aid_projects FOR EACH ROW EXECUTE FUNCTION private.touch_updated_at();
CREATE TRIGGER trg_distribution_slips_updated BEFORE UPDATE ON public.distribution_slips FOR EACH ROW EXECUTE FUNCTION private.touch_updated_at();
CREATE TRIGGER trg_members_assign_code BEFORE INSERT OR UPDATE ON public.members FOR EACH ROW EXECUTE FUNCTION private.assign_member_code();
CREATE TRIGGER trg_volunteers_assign_code BEFORE INSERT OR UPDATE ON public.volunteers FOR EACH ROW EXECUTE FUNCTION private.assign_volunteer_code();
CREATE TRIGGER trg_help_applications_assign_code BEFORE INSERT OR UPDATE ON public.help_applications FOR EACH ROW EXECUTE FUNCTION private.assign_help_app_code();
CREATE TRIGGER trg_log_user_role_change AFTER INSERT OR DELETE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION private.log_user_role_change();

-- Policies
DROP POLICY IF EXISTS "Admins can delete activities" ON public.activities;
DROP POLICY IF EXISTS "Admins can publish activities" ON public.activities;
DROP POLICY IF EXISTS "Admins can update activities" ON public.activities;
CREATE POLICY "Admins can delete activities" ON public.activities FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can publish activities" ON public.activities FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can update activities" ON public.activities FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins view all logs" ON public.admin_activity_logs;
DROP POLICY IF EXISTS "Admins insert logs" ON public.admin_activity_logs;
CREATE POLICY "Admins view all logs" ON public.admin_activity_logs FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins insert logs" ON public.admin_activity_logs FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admin insert aid projects" ON public.aid_projects;
DROP POLICY IF EXISTS "Admin update aid projects" ON public.aid_projects;
DROP POLICY IF EXISTS "Admin delete aid projects" ON public.aid_projects;
CREATE POLICY "Admin insert aid projects" ON public.aid_projects FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admin update aid projects" ON public.aid_projects FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admin delete aid projects" ON public.aid_projects FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Staff can read contact" ON public.contact_messages;
DROP POLICY IF EXISTS "Staff can update contact" ON public.contact_messages;
DROP POLICY IF EXISTS "Staff can delete contact" ON public.contact_messages;
CREATE POLICY "Staff can read contact" ON public.contact_messages FOR SELECT TO authenticated USING (private.is_staff(auth.uid()));
CREATE POLICY "Staff can update contact" ON public.contact_messages FOR UPDATE TO authenticated USING (private.is_staff(auth.uid()));
CREATE POLICY "Staff can delete contact" ON public.contact_messages FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Staff view distribution slips" ON public.distribution_slips;
DROP POLICY IF EXISTS "Admin insert distribution slips" ON public.distribution_slips;
DROP POLICY IF EXISTS "Admin update distribution slips" ON public.distribution_slips;
DROP POLICY IF EXISTS "Admin delete distribution slips" ON public.distribution_slips;
CREATE POLICY "Staff view distribution slips" ON public.distribution_slips FOR SELECT TO authenticated USING (private.is_staff(auth.uid()));
CREATE POLICY "Admin insert distribution slips" ON public.distribution_slips FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admin update distribution slips" ON public.distribution_slips FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admin delete distribution slips" ON public.distribution_slips FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Staff view donations" ON public.donations;
DROP POLICY IF EXISTS "Admin insert donations" ON public.donations;
DROP POLICY IF EXISTS "Admin update donations" ON public.donations;
DROP POLICY IF EXISTS "Admin delete donations" ON public.donations;
CREATE POLICY "Staff view donations" ON public.donations FOR SELECT TO authenticated USING (private.is_staff(auth.uid()));
CREATE POLICY "Admin insert donations" ON public.donations FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admin update donations" ON public.donations FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admin delete donations" ON public.donations FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admin insert events" ON public.events;
DROP POLICY IF EXISTS "Admin update events" ON public.events;
DROP POLICY IF EXISTS "Admin delete events" ON public.events;
CREATE POLICY "Admin insert events" ON public.events FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admin update events" ON public.events FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admin delete events" ON public.events FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Anyone view foundation settings" ON public.foundation_settings;
DROP POLICY IF EXISTS "Admin insert foundation settings" ON public.foundation_settings;
DROP POLICY IF EXISTS "Admin update foundation settings" ON public.foundation_settings;
CREATE POLICY "Admin select foundation settings" ON public.foundation_settings FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admin insert foundation settings" ON public.foundation_settings FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admin update foundation settings" ON public.foundation_settings FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admin insert gallery" ON public.gallery_items;
DROP POLICY IF EXISTS "Admin update gallery" ON public.gallery_items;
DROP POLICY IF EXISTS "Admin delete gallery" ON public.gallery_items;
CREATE POLICY "Admin insert gallery" ON public.gallery_items FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admin update gallery" ON public.gallery_items FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admin delete gallery" ON public.gallery_items FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Staff view help applications" ON public.help_applications;
DROP POLICY IF EXISTS "Admin update help applications" ON public.help_applications;
DROP POLICY IF EXISTS "Admin delete help applications" ON public.help_applications;
CREATE POLICY "Staff view help applications" ON public.help_applications FOR SELECT TO authenticated USING (private.is_staff(auth.uid()));
CREATE POLICY "Admin update help applications" ON public.help_applications FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admin delete help applications" ON public.help_applications FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Staff view members" ON public.members;
DROP POLICY IF EXISTS "Admin insert members" ON public.members;
DROP POLICY IF EXISTS "Admin update members" ON public.members;
DROP POLICY IF EXISTS "Admin delete members" ON public.members;
CREATE POLICY "Staff view members" ON public.members FOR SELECT TO authenticated USING (private.is_staff(auth.uid()));
CREATE POLICY "Admin insert members" ON public.members FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admin update members" ON public.members FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admin delete members" ON public.members FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "View published notices" ON public.notices;
DROP POLICY IF EXISTS "Admin insert notices" ON public.notices;
DROP POLICY IF EXISTS "Admin update notices" ON public.notices;
DROP POLICY IF EXISTS "Admin delete notices" ON public.notices;
CREATE POLICY "View published notices" ON public.notices FOR SELECT TO anon, authenticated USING (is_published = true OR private.is_staff(auth.uid()));
CREATE POLICY "Admin insert notices" ON public.notices FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admin update notices" ON public.notices FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admin delete notices" ON public.notices FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Staff view volunteers" ON public.volunteers;
DROP POLICY IF EXISTS "Admin insert volunteers" ON public.volunteers;
DROP POLICY IF EXISTS "Admin update volunteers" ON public.volunteers;
DROP POLICY IF EXISTS "Admin delete volunteers" ON public.volunteers;
CREATE POLICY "Staff view volunteers" ON public.volunteers FOR SELECT TO authenticated USING (private.is_staff(auth.uid()));
CREATE POLICY "Admin insert volunteers" ON public.volunteers FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admin update volunteers" ON public.volunteers FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admin delete volunteers" ON public.volunteers FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));

-- Storage
DROP POLICY IF EXISTS "Admin delete foundation-media" ON storage.objects;
DROP POLICY IF EXISTS "Admin update foundation-media" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload foundation-media" ON storage.objects;
DROP POLICY IF EXISTS "Admins manage foundation-media" ON storage.objects;
DROP POLICY IF EXISTS "Admin manage application-pdf" ON storage.objects;
DROP POLICY IF EXISTS "Staff read application-pdf" ON storage.objects;
DROP POLICY IF EXISTS "Staff upload application-pdf anywhere" ON storage.objects;

CREATE POLICY "Admin delete foundation-media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'foundation-media' AND private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admin update foundation-media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'foundation-media' AND private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admin upload foundation-media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'foundation-media' AND private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admin manage application-pdf" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'application-pdf' AND private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Staff read application-pdf" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'application-pdf' AND private.is_staff(auth.uid()));
CREATE POLICY "Staff upload application-pdf anywhere" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'application-pdf' AND lower(storage.extension(name)) = 'pdf' AND private.is_staff(auth.uid()));

-- Public views
CREATE OR REPLACE VIEW public.member_public_card WITH (security_invoker = false) AS
SELECT member_code, name, role, area, status, photo_url, join_date FROM public.members WHERE status = 'approved';
CREATE OR REPLACE VIEW public.volunteer_public_card WITH (security_invoker = false) AS
SELECT volunteer_code, name, role, area, skills, assigned_task, status, photo_url, blood_group, joined_at, expires_at FROM public.volunteers WHERE status = 'active';
CREATE OR REPLACE VIEW public.foundation_public_settings WITH (security_invoker = false) AS
SELECT id, name, tagline, phone, email, address, logo_url,
       facebook_url, youtube_url, whatsapp_url, instagram_url, twitter_url, website_url,
       about_short, allowed_wards, allowed_unions, allowed_thanas, union_ward_map
FROM public.foundation_settings;

GRANT SELECT ON public.member_public_card TO anon, authenticated;
GRANT SELECT ON public.volunteer_public_card TO anon, authenticated;
GRANT SELECT ON public.foundation_public_settings TO anon, authenticated;

-- Drop old public functions (handle_new_user_role is retained because it's still used by an auth.users trigger we do not own)
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
DROP FUNCTION IF EXISTS public.is_staff(uuid);
DROP FUNCTION IF EXISTS public.touch_updated_at();
DROP FUNCTION IF EXISTS public.assign_member_code();
DROP FUNCTION IF EXISTS public.assign_volunteer_code();
DROP FUNCTION IF EXISTS public.assign_help_app_code();
DROP FUNCTION IF EXISTS public.log_user_role_change();
DROP FUNCTION IF EXISTS public.grant_role_by_email(text, public.app_role);
DROP FUNCTION IF EXISTS public.attach_application_pdf(text, text);
DROP FUNCTION IF EXISTS public.verify_member_card(text);
DROP FUNCTION IF EXISTS public.verify_volunteer_card(text);
DROP FUNCTION IF EXISTS public.lookup_help_application(text);

-- Revoke EXECUTE on the remaining handle_new_user_role from API roles so it is not callable as RPC.
REVOKE EXECUTE ON FUNCTION public.handle_new_user_role() FROM PUBLIC, anon, authenticated;
