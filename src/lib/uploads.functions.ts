import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic"];
const MAX_BYTES = 3 * 1024 * 1024; // 3 MB

const Schema = z.object({
  filename: z.string().trim().min(1).max(200),
  contentType: z.string().trim().min(3).max(100),
  // base64 (no data: prefix)
  dataBase64: z.string().min(10).max(Math.ceil((MAX_BYTES * 4) / 3) + 100),
  folder: z.enum(["members", "volunteers"]).optional(),
});

const FoundationLogoSchema = z.object({
  filename: z.string().trim().min(1).max(200),
  contentType: z.string().trim().min(3).max(100),
  dataBase64: z.string().min(10).max(Math.ceil((3 * 1024 * 1024 * 4) / 3) + 100),
});

/**
 * Server-side public-membership photo upload.
 * Validates type/size and writes to foundation-media/members/ using the admin client.
 * Returns the public URL. No client-side anon upload policy is needed.
 */
export const uploadMemberPhoto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
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

export const uploadFoundationLogo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => FoundationLogoSchema.parse(i))
  .handler(async ({ context, data }) => {
    const allowedMime = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic"];
    const maxBytes = 3 * 1024 * 1024;
    const contentType = data.contentType.toLowerCase();
    if (!allowedMime.includes(contentType)) {
      throw new Error("শুধু ছবি ফাইল গ্রহণযোগ্য (jpg/png/webp/gif/heic)");
    }

    const bytes = Buffer.from(data.dataBase64, "base64");
    if (bytes.byteLength === 0) throw new Error("ফাইল খালি");
    if (bytes.byteLength > maxBytes) throw new Error("লোগোর আকার ৩MB-এর কম হতে হবে");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: roles, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    if (roleError) throw new Error(roleError.message);
    if (!(roles ?? []).some((row) => row.role === "admin")) {
      throw new Error("শুধুমাত্র অ্যাডমিন লোগো আপলোড করতে পারবেন");
    }

    const extMap: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
      "image/heic": "heic",
    };
    const ext = extMap[contentType] || "png";
    const path = `foundation/logo-${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
    const { error: uploadError } = await supabaseAdmin.storage.from("foundation-media").upload(path, bytes, {
      contentType: data.contentType,
      upsert: true,
    });
    if (uploadError) throw new Error(uploadError.message);

    const { data: pub } = supabaseAdmin.storage.from("foundation-media").getPublicUrl(path);
    const { error: updateError } = await supabaseAdmin
      .from("foundation_settings")
      .update({ logo_url: pub.publicUrl } as never)
      .eq("is_singleton", true);
    if (updateError) throw new Error(updateError.message);

    return { url: pub.publicUrl, path };
  });

const PDF_MAX = 5 * 1024 * 1024; // 5 MB
const PdfSchema = z.object({
  app_code: z.string().trim().min(4).max(40).regex(/^[A-Z0-9-]+$/i),
  upload_token: z.string().trim().min(16).max(128),
  dataBase64: z.string().min(10).max(Math.ceil((PDF_MAX * 4) / 3) + 100),
});

/**
 * Server-side application PDF upload. Requires the one-time upload_token
 * issued by submitHelpApplicationFn so only the original applicant can
 * upload the PDF. Token is cleared on success to prevent replay.
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
      .select("app_code, pdf_upload_token, pdf_url")
      .eq("app_code", data.app_code)
      .maybeSingle();
    if (lookupErr) throw new Error(lookupErr.message);
    if (!row) throw new Error("আবেদন পাওয়া যায়নি");
    if (!(row as any).pdf_upload_token || (row as any).pdf_upload_token !== data.upload_token) {
      throw new Error("অবৈধ বা মেয়াদোত্তীর্ণ আপলোড টোকেন");
    }

    const path = `applications/${data.app_code}.pdf`;
    const { error } = await supabaseAdmin.storage.from("application-pdf").upload(path, bytes, {
      contentType: "application/pdf",
      upsert: false,
    });
    if (error) {
      const msg = error.message || "";
      if (/exists|duplicate/i.test(msg)) throw new Error("এই আবেদনের জন্য PDF আগেই আপলোড হয়েছে");
      throw new Error(msg);
    }

    // Clear token after use so it cannot be replayed
    await supabaseAdmin
      .from("help_applications")
      .update({ pdf_url: path, pdf_upload_token: null } as never)
      .eq("app_code", data.app_code);

    return { path };
  });
