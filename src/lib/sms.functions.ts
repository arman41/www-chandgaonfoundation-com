import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { sendBdSms } from "./sms-sender.server";

const SendSchema = z.object({
  to: z
    .string()
    .trim()
    .regex(/^(?:880|0)1[3-9]\d{8}$/, { message: "সঠিক বাংলাদেশি মোবাইল নম্বর দিন" }),
  msg: z.string().trim().min(1).max(1000),
});

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

    const result = await sendBdSms(data.to, data.msg);
    return { success: true, msg: result.msg, data: result.data ?? null };
  });
