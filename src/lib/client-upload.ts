import { supabase } from "@/integrations/supabase/client";

/**
 * Direct browser upload to the foundation-media bucket.
 * Allowed for signed-in users under the applications/, members/ and
 * volunteers/ prefixes (see storage RLS policies).
 */
export async function uploadToFoundationMedia(
  file: File,
  folder: "applications" | "members" | "volunteers" | string,
): Promise<string> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
  const { error } = await supabase.storage
    .from("foundation-media")
    .upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw new Error(error.message);
  return supabase.storage.from("foundation-media").getPublicUrl(path).data.publicUrl;
}
