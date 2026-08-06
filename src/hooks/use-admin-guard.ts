import { useEffect, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export type AdminGuardStatus = "loading" | "allowed" | "denied" | "unauthenticated";

/**
 * Staff guard — allows admin AND moderator.
 * Role verification is protected by the user_roles row-level access rules.
 */
export function useAdminGuard(opts?: { allowModerator?: boolean }) {
  const allowModerator = opts?.allowModerator ?? true;
  const [status, setStatus] = useState<AdminGuardStatus>("loading");
  const [role, setRole] = useState<"admin" | "moderator" | null>(null);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    let alive = true;

    const evaluate = async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (!alive) return;
      if (authError || !authData.user) {
        setStatus("unauthenticated");
        navigate({ to: "/login" });
        return;
      }
      try {
        const { data: roleRows, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", authData.user.id);
        if (error) throw error;
        if (!alive) return;
        const roles = (roleRows ?? []).map((row) => row.role);
        if (roles.includes("admin")) {
          setRole("admin");
          setStatus("allowed");
        } else if (allowModerator && roles.includes("moderator")) {
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
  }, [pathname, navigate, allowModerator]);

  return { status, role };
}
