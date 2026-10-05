import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { sendBdSms } from "./sms-sender.server";

const SendSchema = z.object({
  accessToken: z.string().min(20),
  to: z
    .string()
    .trim()
    .regex(/^(?:880|0)1[3-9]\d{8}$/, { message: "সঠিক বাংলাদেশি মোবাইল নম্বর দিন" }),
  msg: z.string().trim().min(1).max(1000),
});

export const sendSms = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SendSchema.parse(input))
  .handler(async ({ data }) => {
    // Public backend values as fallback so other hosts (e.g. external deployments
    // missing env vars) can still verify the session.
    const FALLBACK_URL = "https://vptpvtgspdgbtmlsupyk.supabase.co";
    const FALLBACK_KEY =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwdHB2dGdzcGRnYnRtbHN1cHlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3NjcyMTMsImV4cCI6MjA5OTM0MzIxM30.Nsb4wF9cQsImFfk6D7ZhxyD4sfeWvN0XUGr0iwiz5ew";
    const envUrl = (process.env.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL || "").trim();
    const sbUrl = /^https:\/\/[^/]+/.test(envUrl) ? envUrl.replace(/\/+$/, "") : FALLBACK_URL;
    const sbKey =
      (process.env.SUPABASE_PUBLISHABLE_KEY ||
        process.env.SUPABASE_ANON_KEY ||
        import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
        "").trim() || FALLBACK_KEY;
    const headers = { apikey: sbKey, Authorization: `Bearer ${data.accessToken}` };

    let userRes: Response;
    try {
      userRes = await fetch(`${sbUrl}/auth/v1/user`, { headers });
    } catch {
      throw new Error("লগইন যাচাই সার্ভারে সংযোগ করা যায়নি");
    }
    if (!userRes.ok) throw new Error("লগইনের মেয়াদ শেষ — আবার লগইন করুন");
    const user = (await userRes.json()) as { id?: string };
    if (!user.id) throw new Error("লগইনের মেয়াদ শেষ — আবার লগইন করুন");

    const rolesRes = await fetch(
      `${sbUrl}/rest/v1/user_roles?select=role&user_id=eq.${encodeURIComponent(user.id)}`,
      { headers },
    );
    const roles = rolesRes.ok ? ((await rolesRes.json()) as { role: string }[]) : [];
    if (!roles.some((r) => r.role === "admin" || r.role === "moderator")) {
      throw new Error("অনুমতি নেই");
    }

    const result = await sendBdSms(data.to, data.msg);
    return { success: true, msg: result.msg, data: result.data ?? null };
  });
