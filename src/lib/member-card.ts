import { supabase } from "@/integrations/supabase/client";
import type { MemberPrivate } from "@/lib/members.functions";

/**
 * Browser-side member card lookup (member code + last 4 digits of phone).
 * Uses a security-definer database function so it works without server-only keys.
 */
export async function lookupMemberCardClient(
  code: string,
  phoneLast4: string,
): Promise<MemberPrivate | null> {
  const { data, error } = await (supabase as any).rpc("lookup_member_card", {
    p_code: code,
    p_last4: phoneLast4,
  });
  if (error) throw new Error(error.message);
  const row = Array.isArray(data) ? data[0] : data;
  return (row ?? null) as MemberPrivate | null;
}
