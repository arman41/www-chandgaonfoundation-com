import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";


/**
 * Server-side verification of admin role.
 * Validates the user's bearer token and queries `user_roles` via the admin
 * client (bypassing RLS) to confirm the role on the server.
 */
export const verifyAdminAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    if (error) {
      return { isAdmin: false, isStaff: false } as const;
    }
    const roles = (data ?? []).map((r) => r.role);
    const isAdmin = roles.includes("admin");
    const isStaff = isAdmin || roles.includes("moderator");
    return { isAdmin, isStaff } as const;
  });

