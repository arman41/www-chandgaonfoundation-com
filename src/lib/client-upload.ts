import { supabase } from "@/integrations/supabase/client";

const ALLOWED_EXT = ["jpg", "jpeg", "png", "webp", "heic"] as const;

/** Cryptographically random 32-hex object name (unguessable). */
function randomToken(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function safeExt(file: File): string {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  return (ALLOWED_EXT as readonly string[]).includes(ext) ? ext : "jpg";
}

/**
 * Builds a storage path that satisfies the storage RLS rules:
 * - signed in  -> <folder>/<user id>/<random token>.<ext>  (ownership bound)
 * - anonymous  -> <folder>/<random token>.<ext>            (unguessable)
 */
async function buildPath(folder: string, file: File): Promise<string> {
  const { data } = await supabase.auth.getUser();
  const uid = data.user?.id;
  const filename = `${randomToken()}.${safeExt(file)}`;
  return uid ? `${folder}/${uid}/${filename}` : `${folder}/${filename}`;
}

/**
 * Direct browser upload to the foundation-media bucket (public assets such as
 * member/volunteer profile photos used on smart cards).
 */
export async function uploadToFoundationMedia(
  file: File,
  folder: "applications" | "members" | "volunteers" | string,
): Promise<string> {
  const path = await buildPath(folder, file);
  const { error } = await supabase.storage
    .from("foundation-media")
    .upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw new Error(error.message);
  return supabase.storage.from("foundation-media").getPublicUrl(path).data.publicUrl;
}

/**
 * Upload sensitive documents (NID scans, applicant photos) to the private
 * bucket. Files are only viewable by staff through short-lived signed URLs.
 */
export async function uploadToPrivateMedia(
  file: File,
  folder: "applications" | "members" | "volunteers" | string,
): Promise<string> {
  const path = await buildPath(folder, file);
  const { error } = await supabase.storage
    .from("private-media")
    .upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw new Error(error.message);
  return supabase.storage.from("private-media").getPublicUrl(path).data.publicUrl;
}
