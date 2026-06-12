import { useEffect, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { verifyAdminAccess } from "@/lib/admin.functions";

export type AdminGuardStatus = "loading" | "allowed" | "denied" | "unauthenticated";

/**
 * Admin route guard — performs SERVER-SIDE role verification.
 * Cannot be bypassed by tampering with client state because the check runs
 * inside a server function that validates the bearer token and queries
 * `has_role` with a security-definer function.
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
      try {
        const res = await verifyAdminAccess();
        if (!alive) return;
        setStatus(res.isAdmin ? "allowed" : "denied");
      } catch {
        if (!alive) return;
        setStatus("denied");
      }
    };

    evaluate();

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
      subscription.unsubscribe();
    };
  }, [pathname, navigate]);

  return status;
}
