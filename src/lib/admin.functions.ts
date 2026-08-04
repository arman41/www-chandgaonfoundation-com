import "@/lib/ws-shim";
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
    const { data, error } = await context.supabase
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

const GrantRoleSchema = z.object({
  email: z.string().trim().email().max(255),
  role: z.enum(["admin", "moderator", "user"]),
});

/**
 * Admin-only role grant. Validates the caller's bearer token, confirms they
 * are an admin, then resolves the target user from auth.users and upserts
 * into public.user_roles. All access uses the admin client (bypasses RLS).
 */
export const grantRoleByEmailFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => GrantRoleSchema.parse(i))
  .handler(async ({ context, data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: roleRows } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    const isAdmin = (roleRows ?? []).some((r) => r.role === "admin");
    if (!isAdmin) throw new Error("শুধুমাত্র অ্যাডমিন ভূমিকা দিতে পারেন");

    const { data: usersPage, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (listErr) throw new Error(listErr.message);
    const target = usersPage.users.find(
      (u) => (u.email ?? "").toLowerCase() === data.email.toLowerCase(),
    );
    if (!target) throw new Error("এই ইমেইলে কোনো ব্যবহারকারী পাওয়া যায়নি");

    const { error: insertErr } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: target.id, role: data.role }, { onConflict: "user_id,role" });
    if (insertErr) throw new Error(insertErr.message);
    return { ok: true } as const;
  });


