import { supabase } from "@/integrations/supabase/client";

async function fetchUserRoles(userId: string) {
  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  if (error) {
    console.error("Error fetching user_roles:", error.message);
    return [];
  }
  return (data ?? []).map((row) => row.role);
}

export async function getUserRoleFlags(userId: string) {
  const roles = await fetchUserRoles(userId);
  const isAdmin = roles.some((role) => role === "admin");
  const isModerator = roles.some((role) => role === "moderator");
  return {
    roles,
    role: isAdmin ? "admin" : isModerator ? "moderator" : roles[0] ?? null,
    isAdmin,
    isModerator,
  };
}