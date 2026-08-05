import { useEffect, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { verifyAdminAccess } from "@/lib/admin.functions";

export type AdminGuardStatus = "loading" | "allowed" | "denied" | "unauthenticated";

/**
 * Staff guard — allows admin AND moderator.
 * Server-side role verification via `verifyAdminAccess` server function.
 */
export function useAdminGuard(opts?: { allowModerator?: boolean }) {
  const allowModerator = opts?.allowModerator ?? true;
  const [status, setStatus] = useState<AdminGuardStatus>("loading");
  const [role, setRole] = useState<"admin" | "moderator" | null>(null);
  const verifyAccess = useServerFn(verifyAdminAccess);
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
        const res = await verifyAccess({ data: { accessToken: session.access_token } });
        if (!alive) return;
        if (res.isAdmin) {
          setRole("admin");
          setStatus("allowed");
        } else if (allowModerator && res.isStaff) {
          setRole("moderator");
          setStatus("allowed");
        } else {
          setStatus("denied");
        }
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
  }, [pathname, navigate, allowModerator, verifyAccess]);

  return { status, role };
}
