import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { supabase } from "@/integrations/supabase/client";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Accept storage URLs from this project's Supabase host (project ref must not be hardcoded).
const STORAGE_URL_RE = /^https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/(public|sign)\//;

const RegisterSchema = z.object({
  name: z.string().trim().min(2).max(100),
  name_en: z.string().trim().max(100).optional().or(z.literal("")),
  phone: z.string().trim().regex(/^01[3-9]\d{8}$/, { message: "সঠিক মোবাইল নম্বর দিন" }),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  district: z.string().trim().min(2).max(80),
  thana: z.string().trim().min(2).max(80),
  union_name: z.string().trim().max(80).optional().or(z.literal("")),
  ward: z.string().trim().max(20).optional().or(z.literal("")),
  area: z.string().trim().max(200).optional().or(z.literal("")),
  role: z.string().trim().max(50).optional(),
  notes: z.string().trim().max(500).optional(),
  photo_url: z.string().trim().url().regex(STORAGE_URL_RE, { message: "সঠিক ছবির URL দিন" }),
  nid: z.string().trim().max(30).optional().or(z.literal("")),
  nid_front_url: z.string().trim().url().regex(STORAGE_URL_RE, { message: "NID ছবির সামনের অংশ আপলোড করুন" }),
  nid_back_url: z.string().trim().url().regex(STORAGE_URL_RE, { message: "NID ছবির পিছনের অংশ আপলোড করুন" }),
  membership_type: z.string().trim().min(2).max(50),
  terms_accepted: z.literal(true, { errorMap: () => ({ message: "শর্তাবলীতে সম্মতি প্রয়োজন" }) }),
});

export const submitMembership = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => RegisterSchema.parse(i))
  .handler(async ({ data, context }) => {
    // Prevent duplicate phone
    const { data: existing } = await supabaseAdmin
      .from("members")
      .select("id, status")
      .eq("phone", data.phone)
      .maybeSingle();
    if (existing) throw new Error("এই মোবাইল নম্বরে আগেই আবেদন করা হয়েছে");

    // Prevent duplicate user application
    const { data: mine } = await supabaseAdmin
      .from("members")
      .select("id")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (mine) throw new Error("আপনার একটি আবেদন ইতোমধ্যে জমা আছে");

    const area = [data.district, data.thana, data.union_name, data.ward && `ওয়ার্ড ${data.ward}`]
      .filter(Boolean)
      .join(", ")
      .slice(0, 200);

    const { data: row, error } = await supabaseAdmin
      .from("members")
      .insert({
        user_id: context.userId,
        name: data.name,
        name_en: (data.name_en || "").toUpperCase() || null,
        phone: data.phone,
        email: data.email || null,
        area,
        district: data.district,
        thana: data.thana,
        union_name: data.union_name || null,
        ward: data.ward || null,
        role: data.membership_type || data.role || "সদস্য",
        membership_type: data.membership_type,
        terms_accepted: true,
        terms_accepted_at: new Date().toISOString(),
        notes: data.notes || null,
        photo_url: data.photo_url,
        nid: data.nid || null,
        nid_front_url: data.nid_front_url,
        nid_back_url: data.nid_back_url,
        status: "pending",
      } as any)
      .select("id, name, status, created_at")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

const LookupSchema = z.object({
  code: z.string().trim().min(4).max(20),
  phone_last4: z.string().trim().regex(/^\d{4}$/),
});

export type MemberPrivate = {
  id: string;
  member_code: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  area: string | null;
  role: string | null;
  status: string;
  photo_url: string | null;
  join_date: string | null;
};

export const lookupMyMembership = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => LookupSchema.parse(i))
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin
      .from("members")
      .select("*")
      .eq("member_code", data.code.toUpperCase())
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;
    const phone = (row.phone || "").replace(/\D/g, "");
    if (!phone.endsWith(data.phone_last4)) {
      throw new Error("ফোন নম্বরের শেষ ৪ ডিজিট মিলছে না");
    }
    if (row.status !== "approved") {
      throw new Error("আপনার সদস্যপদ এখনো অনুমোদিত হয়নি। অনুমোদনের পর কার্ড দেখতে পারবেন।");
    }
    return row as MemberPrivate;
  });

const PhoneLookupSchema = z.object({
  phone: z.string().trim().regex(/^01[3-9]\d{8}$/),
});

// Allow members to look up their status using only phone (works even before approval)
export const lookupMembershipStatus = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => PhoneLookupSchema.parse(i))
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin
      .from("members")
      .select("name, status, member_code, created_at")
      .eq("phone", data.phone)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export type PublicCard = {
  member_code: string;
  name: string;
  role: string | null;
  area: string | null;
  status: string;
  photo_url: string | null;
  join_date: string | null;
};

// Public verification (queries the public view exposing only safe card fields of approved members)
export async function verifyMemberCard(code: string): Promise<PublicCard | null> {
  const { data, error } = await supabase
    .from("member_public_card")
    .select("member_code,name,role,area,status,photo_url,join_date")
    .eq("member_code", code.toUpperCase())
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as PublicCard | null;
}
