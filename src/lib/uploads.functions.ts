import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic"];
const MAX_BYTES = 3 * 1024 * 1024; // 3 MB

const Schema = z.object({
  filename: z.string().trim().min(1).max(200),
  contentType: z.string().trim().min(3).max(100),
  // base64 (no data: prefix)
  dataBase64: z.string().min(10).max(Math.ceil((MAX_BYTES * 4) / 3) + 100),
  folder: z.enum(["members", "volunteers"]).optional(),
});

/**
 * Server-side public-membership photo upload.
 * Validates type/size and writes to foundation-media/members/ using the admin client.
 * Returns the public URL. No client-side anon upload policy is needed.
 */
export const uploadMemberPhoto = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => Schema.parse(i))
  .handler(async ({ data }) => {
    if (!ALLOWED_MIME.includes(data.contentType.toLowerCase())) {
      throw new Error("শুধু ছবি ফাইল গ্রহণযোগ্য (jpg/png/webp/gif/heic)");
    }
    const bytes = Buffer.from(data.dataBase64, "base64");
    if (bytes.byteLength === 0) throw new Error("ফাইল খালি");
    if (bytes.byteLength > MAX_BYTES) throw new Error("ছবির আকার ৩MB-এর কম হতে হবে");

    const extMap: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
      "image/heic": "heic",
    };
    const ext = extMap[data.contentType.toLowerCase()] || "jpg";
    const folder = data.folder ?? "members";
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.storage.from("foundation-media").upload(path, bytes, {
      contentType: data.contentType,
      upsert: false,
    });
    if (error) throw new Error(error.message);
    const { data: pub } = supabaseAdmin.storage.from("foundation-media").getPublicUrl(path);
    return { url: pub.publicUrl, path };
  });

const PDF_MAX = 5 * 1024 * 1024; // 5 MB
const PdfSchema = z.object({
  app_code: z.string().trim().min(4).max(40).regex(/^[A-Z0-9-]+$/i),
  dataBase64: z.string().min(10).max(Math.ceil((PDF_MAX * 4) / 3) + 100),
});

/**
 * Server-side application PDF upload. Verifies app_code exists in help_applications,
 * then writes to the private application-pdf bucket via admin client. Returns the storage path.
 */
export const uploadApplicationPdf = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => PdfSchema.parse(i))
  .handler(async ({ data }) => {
    const bytes = Buffer.from(data.dataBase64, "base64");
    if (bytes.byteLength === 0) throw new Error("ফাইল খালি");
    if (bytes.byteLength > PDF_MAX) throw new Error("PDF আকার ৫MB-এর কম হতে হবে");
    // Verify magic bytes for PDF
    const head = bytes.subarray(0, 4).toString("ascii");
    if (head !== "%PDF") throw new Error("শুধু PDF ফাইল গ্রহণযোগ্য");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error: lookupErr } = await supabaseAdmin
      .from("help_applications")
      .select("app_code")
      .eq("app_code", data.app_code)
      .maybeSingle();
    if (lookupErr) throw new Error(lookupErr.message);
    if (!row) throw new Error("আবেদন পাওয়া যায়নি");

    const path = `applications/${data.app_code}.pdf`;
    const { error } = await supabaseAdmin.storage.from("application-pdf").upload(path, bytes, {
      contentType: "application/pdf",
      upsert: true,
    });
    if (error) throw new Error(error.message);

    await supabaseAdmin
      .from("help_applications")
      .update({ pdf_url: path })
      .eq("app_code", data.app_code);

    return { path };
  });
