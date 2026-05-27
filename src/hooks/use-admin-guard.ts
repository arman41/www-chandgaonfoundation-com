import { useEffect, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { getUserRoleFlags } from "@/lib/auth-role";

export type AdminGuardStatus = "loading" | "allowed" | "denied" | "unauthenticated";

/**
 * Dedicated admin route guard.
 * - Re-checks role on every navigation under /admin
 * - Reacts immediately to `cf-auth-role-ready` events from useAuth
 * - Subscribes to Supabase auth changes
 * - Redirects to /login when unauthenticated
 */
export function useAdminGuard() {
  const [status, setStatus] = useState<AdminGuardStatus>("loading");
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    let alive = true;

    const evaluate = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!alive) return;
      if (!session?.user) {
        setStatus("unauthenticated");
        navigate({ to: "/login" });
        return;
      }
      const flags = await getUserRoleFlags(session.user.id);
      if (!alive) return;
      setStatus(flags.isAdmin ? "allowed" : "denied");
    };

    evaluate();

    const onRoleReady = (e: Event) => {
      const detail = (e as CustomEvent).detail as { isAdmin?: boolean } | undefined;
      if (!alive) return;
      if (detail?.isAdmin) setStatus("allowed");
      else evaluate();
    };
    window.addEventListener("cf-auth-role-ready", onRoleReady);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!alive) return;
      if (!s?.user) {
        setStatus("unauthenticated");
        navigate({ to: "/login" });
      } else {
        evaluate();
      }
    });

    return () => {
      alive = false;
      window.removeEventListener("cf-auth-role-ready", onRoleReady);
      subscription.unsubscribe();
    };
  }, [pathname, navigate]);

  return status;
}
