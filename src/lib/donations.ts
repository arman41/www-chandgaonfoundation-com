import { supabase } from "@/integrations/supabase/client";
import type { DonationRecord } from "@/lib/donations.functions";

/**
 * Browser-side donation receipt lookup.
 * Uses a security-definer database function so it works everywhere
 * (no server-only credentials required).
 */
export async function lookupDonationClient(
  query: string,
  phoneLast4: string,
): Promise<DonationRecord | null> {
  const { data, error } = await (supabase as any).rpc("lookup_donation_receipt", {
    p_query: query,
    p_last4: phoneLast4,
  });
  if (error) throw new Error(error.message);
  const row = Array.isArray(data) ? data[0] : data;
  return (row ?? null) as DonationRecord | null;
}
