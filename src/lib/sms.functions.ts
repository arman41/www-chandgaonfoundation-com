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
    const sbUrl = process.env.SUPABASE_URL;
    const sbKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
    if (!sbUrl || !sbKey) throw new Error("সার্ভার কনফিগার করা নেই");
    const headers = { apikey: sbKey, Authorization: `Bearer ${data.accessToken}` };

    const userRes = await fetch(`${sbUrl}/auth/v1/user`, { headers });
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
