import "@/lib/ws-shim";
import { createServerFn } from "@tanstack/react-start";

/**
 * Returns just the mobile-banking and bank-account fields of the foundation
 * settings row. These fields are intentionally excluded from the public
 * Data API surface (`foundation_public_settings` view). They are served
 * here through a server function so they cannot be bulk-scraped from the
 * REST API.
 *
 * Simple per-IP rate limit prevents abusive enumeration.
 */
type Bucket = { hits: number; reset: number };
const buckets = new Map<string, Bucket>();
const WINDOW_MS = 60_000;
const MAX_HITS = 30;

function rateLimit(ip: string) {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || now > b.reset) {
    buckets.set(ip, { hits: 1, reset: now + WINDOW_MS });
    return true;
  }
  if (b.hits >= MAX_HITS) return false;
  b.hits += 1;
  return true;
}

export const getDonationInfoFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const { getRequestIP } = await import("@tanstack/react-start/server");
    const ip = getRequestIP({ xForwardedFor: true }) ?? "unknown";
    if (!rateLimit(ip)) {
      throw new Error("অনুরোধ সীমা ছাড়িয়েছে, কিছুক্ষণ পরে আবার চেষ্টা করুন");
    }
    if (buckets.size > 500) {
      const now = Date.now();
      for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("foundation_settings")
      .select("bkash_number,nagad_number,rocket_number,islami_bank_account")
      .limit(1)
      .maybeSingle();
    return (data ?? null) as {
      bkash_number: string | null;
      nagad_number: string | null;
      rocket_number: string | null;
      islami_bank_account: string | null;
    } | null;
  },
);
