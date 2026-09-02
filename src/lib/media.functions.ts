import "@/lib/ws-shim";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const PRIVATE_BUCKET = "private-media";

const Schema = z.object({
  accessToken: z.string().min(20),
  paths: z.array(z.string().trim().min(1).max(500)).min(1).max(30),
});

/** Extract the object path inside the private bucket from a stored URL or raw path. */
export function toPrivatePath(value: string): string | null {
  const marker = `/${PRIVATE_BUCKET}/`;
  const idx = value.indexOf(marker);
  if (idx >= 0) return decodeURIComponent(value.slice(idx + marker.length));
  if (!value.includes("://")) return value.replace(/^\/+/, "");
  return null;
}

export function isPrivateMedia(value: string | null | undefined): boolean {
  return !!value && value.includes(`/${PRIVATE_BUCKET}/`);
}

/**
 * Staff-only signed URLs for sensitive files (NID scans, applicant photos)
 * stored in the private bucket. Never exposes public links.
 */
export const signPrivateMedia = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => Schema.parse(i))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(data.accessToken);
    if (authError || !authData.user) throw new Error("অনুমোদন প্রয়োজন");

    const { data: roleRows } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", authData.user.id);
    const roles = (roleRows ?? []).map((r) => r.role);
    if (!roles.includes("admin") && !roles.includes("moderator")) {
      throw new Error("এই ফাইল দেখার অনুমতি নেই");
    }

    const urls: Record<string, string> = {};
    for (const raw of data.paths) {
      const path = toPrivatePath(raw);
      if (!path) continue;
      const { data: signed } = await supabaseAdmin.storage
        .from(PRIVATE_BUCKET)
        .createSignedUrl(path, 60 * 10);
      if (signed?.signedUrl) urls[raw] = signed.signedUrl;
    }
    return { urls };
  });
