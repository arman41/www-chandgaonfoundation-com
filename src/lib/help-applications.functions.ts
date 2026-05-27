import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const HELP_TYPES = [
  "আর্থিক সহায়তা",
  "চিকিৎসা সহায়তা",
  "শিক্ষা সহায়তা",
  "খাদ্য সহায়তা",
  "শীতবস্ত্র",
  "দুর্যোগকালীন সহায়তা",
  "অন্যান্য",
] as const;

const SubmitSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().regex(/^01[3-9]\d{8}$/, "সঠিক মোবাইল নম্বর দিন"),
  nid: z
    .string()
    .trim()
    .regex(/^\d+$/, "NID শুধু সংখ্যা")
    .refine((v) => [10, 13, 17].includes(v.length), "NID ১০/১৩/১৭ সংখ্যা হতে হবে"),
  address: z.string().trim().max(500).optional().default(""),
  type: z.enum(HELP_TYPES),
  amount: z.string().trim().max(20).optional().default(""),
  reason: z.string().trim().min(5).max(1000),
  fileCount: z.number().int().min(0).max(5),
});

export const submitHelpApplicationFn = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => SubmitSchema.parse(i))
  .handler(async ({ data }) => {
    // Anti-spam: block more than 3 pending apps from same phone in last 24h
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count } = await supabaseAdmin
      .from("help_applications")
      .select("id", { count: "exact", head: true })
      .eq("phone", data.phone)
      .gte("created_at", since);
    if ((count ?? 0) >= 3) {
      throw new Error("আপনি ইতিমধ্যে একাধিক আবেদন করেছেন। অনুগ্রহ করে অপেক্ষা করুন।");
    }

    const { data: row, error } = await supabaseAdmin
      .from("help_applications")
      .insert({
        name: data.name,
        phone: data.phone,
        nid: data.nid,
        address: data.address || null,
        type: data.type,
        amount: data.amount || null,
        reason: data.reason,
        file_count: data.fileCount,
        status: "pending",
      })
      .select("app_code")
      .single();
    if (error) throw new Error(error.message);
    return { app_code: row.app_code as string };
  });
