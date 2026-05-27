import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";
import { getUserRoleFlags } from "@/lib/auth-role";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const resetRole = () => {
      setRole(null);
      setIsAdmin(false);
      setIsModerator(false);
    };

    const loadRole = async (authUser: User) => {
      const flags = await getUserRoleFlags(authUser.id);
      if (!alive) return;
      setRole(flags.role);
      setIsAdmin(flags.isAdmin);
      setIsModerator(flags.isModerator);
      window.dispatchEvent(new CustomEvent("cf-auth-role-ready", { detail: flags }));
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setLoading(true);
        setTimeout(() => {
          loadRole(s.user).finally(() => alive && setLoading(false));
        }, 0);
      } else {
        resetRole();
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        loadRole(s.user).finally(() => alive && setLoading(false));
      } else {
        resetRole();
        setLoading(false);
      }
    });

    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, []);

  return { session, user, role, isAdmin, isModerator, isStaff: isAdmin || isModerator, loading };
}