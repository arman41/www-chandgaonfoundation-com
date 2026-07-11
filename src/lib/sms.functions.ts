import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SendSchema = z.object({
  to: z
    .string()
    .trim()
    .regex(/^(?:880|0)1[3-9]\d{8}$/, { message: "সঠিক বাংলাদেশি মোবাইল নম্বর দিন" }),
  msg: z.string().trim().min(1).max(1000),
});

function normalizeBd(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.startsWith("880")) return d;
  if (d.startsWith("0")) return "880" + d.slice(1);
  return d;
}

export const sendSms = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SendSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Only admin/moderator can send
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const isStaff = (roles ?? []).some((r) => r.role === "admin" || r.role === "moderator");
    if (!isStaff) throw new Error("অনুমতি নেই");

    const apiKey = process.env.SMS_NET_BD_API_KEY?.trim();
    if (!apiKey) throw new Error("SMS API key কনফিগার করা নেই");

    const to = normalizeBd(data.to);

    const body = new URLSearchParams({
      api_key: apiKey,
      to,
      msg: data.msg,
    });

    const res = await fetch("https://api.sms.net.bd/sendsms", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        // sms.net.bd's ip_address column overflows on IPv6 caller IPs.
        "X-Forwarded-For": "0.0.0.0",
        "X-Real-IP": "0.0.0.0",
      },
      body: body.toString(),
    });

    const text = await res.text();
    let payload: { error?: number; msg?: string; data?: unknown } = {};
    try {
      payload = JSON.parse(text);
    } catch {
      throw new Error("SMS gateway থেকে অপ্রত্যাশিত উত্তর: " + text.slice(0, 200));
    }

    if (payload.error !== 0) {
      throw new Error(payload.msg || "SMS পাঠানো ব্যর্থ হয়েছে");
    }

    return { success: true, msg: payload.msg ?? "Success", data: payload.data ?? null };
  });
