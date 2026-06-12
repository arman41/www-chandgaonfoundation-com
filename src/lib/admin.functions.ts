import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Server-side verification of admin role.
 * Validates the user's bearer token and queries `has_role` (SECURITY DEFINER)
 * to confirm the admin role on the server. Cannot be bypassed by client state.
 */
export const verifyAdminAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (error) {
      return { isAdmin: false, isStaff: false } as const;
    }
    const { data: mod } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "moderator",
    });
    const isAdmin = Boolean(data);
    return { isAdmin, isStaff: isAdmin || Boolean(mod) } as const;
  });
