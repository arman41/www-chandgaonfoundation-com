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
  // new optional fields
  project_id: z.string().uuid().optional().nullable(),
  father_name: z.string().trim().max(100).optional().nullable(),
  mother_name: z.string().trim().max(100).optional().nullable(),
  dob: z.string().trim().optional().nullable(),
  gender: z.enum(["male", "female", "other"]).optional().nullable(),
  occupation: z.string().trim().max(100).optional().nullable(),
  monthly_income: z.number().min(0).max(10000000).optional().nullable(),
  family_count: z.number().int().min(0).max(50).optional().nullable(),
  present_address: z.string().trim().max(500).optional().nullable(),
  permanent_address: z.string().trim().max(500).optional().nullable(),
  photo_url: z.string().url().optional().nullable(),
  nid_front_url: z.string().url().optional().nullable(),
  nid_back_url: z.string().url().optional().nullable(),
  requested_amount: z.number().min(0).max(10000000).optional().nullable(),
  financial_condition: z.string().trim().max(1000).optional().nullable(),
  additional_notes: z.string().trim().max(1000).optional().nullable(),
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
      return { error: "আপনি ইতিমধ্যে একাধিক আবেদন করেছেন। অনুগ্রহ করে অপেক্ষা করুন।" } as const;
    }

    // Per-project duplicate check
    if (data.project_id) {
      const { data: dup } = await supabaseAdmin
        .from("help_applications")
        .select("id")
        .eq("project_id", data.project_id)
        .or(`nid.eq.${data.nid},phone.eq.${data.phone}`)
        .limit(1);
      if (dup && dup.length > 0) {
        return { error: "আপনি ইতোমধ্যে এই প্রকল্পে আবেদন করেছেন।" } as const;
      }
    }

    // one-time token for the PDF upload step
    const upload_token = (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)) +
      "-" + (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));

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
        project_id: data.project_id ?? null,
        father_name: data.father_name ?? null,
        mother_name: data.mother_name ?? null,
        dob: data.dob || null,
        gender: data.gender ?? null,
        occupation: data.occupation ?? null,
        monthly_income: data.monthly_income ?? null,
        family_count: data.family_count ?? null,
        present_address: data.present_address ?? null,
        permanent_address: data.permanent_address ?? null,
        photo_url: data.photo_url ?? null,
        nid_front_url: data.nid_front_url ?? null,
        nid_back_url: data.nid_back_url ?? null,
        requested_amount: data.requested_amount ?? null,
        financial_condition: data.financial_condition ?? null,
        additional_notes: data.additional_notes ?? null,
        pdf_upload_token: upload_token,
      } as never)
      .select("app_code")
      .single();
    if (error) {
      if (error.code === "23505") {
        return { error: "আপনি ইতোমধ্যে এই প্রকল্পে আবেদন করেছেন।" } as const;
      }
      return { error: error.message } as const;
    }
    return { app_code: row.app_code as string, upload_token } as const;
  });

const LookupSchema = z.object({ code: z.string().trim().min(1).max(50) });

export const lookupHelpApplicationFn = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => LookupSchema.parse(i))
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin
      .from("help_applications")
      .select("app_code,name,type,amount,file_count,status,created_at")
      .ilike("app_code", data.code)
      .maybeSingle();
    if (error) return null;
    return row ?? null;
  });

