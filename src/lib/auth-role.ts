import { supabase } from "@/integrations/supabase/client";

type ProfileRoleRow = { role: string | null };
type RoleQueryResult = { data: ProfileRoleRow | null; error: { message?: string } | null };
type ProfilesClient = {
  from: (table: "profiles") => {
    select: (columns: "role") => {
      eq: (column: "id", value: string) => {
        maybeSingle: () => Promise<RoleQueryResult>;
      };
    };
  };
};

async function fetchProfileRole(userId: string) {
  const { data, error } = await (supabase as unknown as ProfilesClient)
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching profile role:", error.message ?? error);
    return null;
  }

  return typeof data?.role === "string" ? data.role : null;
}

async function fetchRoleFallback(userId: string) {
  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  if (error) {
    console.error("Error fetching user role fallback:", error.message);
    return [];
  }
  return (data ?? []).map((row) => row.role);
}

export async function getUserRoleFlags(userId: string) {
  const profileRole = await fetchProfileRole(userId);

  if (profileRole !== null) {
    return {
      role: profileRole,
      isAdmin: profileRole === "admin",
      isModerator: profileRole === "moderator",
    };
  }

  const fallbackRoles = await fetchRoleFallback(userId);
  return {
    role: fallbackRoles[0] ?? null,
    isAdmin: fallbackRoles.includes("admin"),
    isModerator: fallbackRoles.includes("moderator"),
  };
}