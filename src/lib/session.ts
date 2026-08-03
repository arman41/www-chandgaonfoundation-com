import { supabase } from "@/integrations/supabase/client";

/**
 * Makes sure a valid (non-expired) access token exists before calling a
 * protected server function. Returns true when a usable session is available.
 */
export async function ensureFreshSession(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  const session = data.session;
  if (!session) return false;

  const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
  // Refresh when the token is expired or expires within the next minute.
  if (!expiresAt || expiresAt - Date.now() < 60_000) {
    const { data: refreshed, error } = await supabase.auth.refreshSession();
    if (error || !refreshed.session) return false;
    return true;
  }
  return true;
}

export function isAuthError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  return /unauthorized|invalid token|jwt|no authorization header/i.test(msg);
}

export const SESSION_EXPIRED_BN =
  "আপনার লগইন সেশনের মেয়াদ শেষ হয়েছে। অনুগ্রহ করে আবার লগইন করে চেষ্টা করুন।";
