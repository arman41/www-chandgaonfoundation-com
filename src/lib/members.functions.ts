import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { supabase } from "@/integrations/supabase/client";

const RegisterSchema = z.object({
  name: z.string().trim().min(2).max(100),
  name_en: z.string().trim().max(100).optional().or(z.literal("")),
  phone: z.string().trim().regex(/^01[3-9]\d{8}$/, { message: "সঠিক মোবাইল নম্বর দিন" }),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  area: z.string().trim().min(2).max(100),
  role: z.string().trim().max(50).optional(),
  notes: z.string().trim().max(500).optional(),
  photo_url: z.string().trim().url().optional().or(z.literal("")),
  nid: z.string().trim().max(30).optional().or(z.literal("")),
});

export const submitMembership = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => RegisterSchema.parse(i))
  .handler(async ({ data }) => {
    // Prevent duplicate phone
    const { data: existing } = await supabaseAdmin
      .from("members")
      .select("id, status")
      .eq("phone", data.phone)
      .maybeSingle();
    if (existing) throw new Error("এই মোবাইল নম্বরে আগেই আবেদন করা হয়েছে");

    const { data: row, error } = await supabaseAdmin
      .from("members")
      .insert({
        name: data.name,
        name_en: (data.name_en || "").toUpperCase() || null,
        phone: data.phone,
        email: data.email || null,
        area: data.area,
        role: data.role || "সদস্য",
        notes: data.notes || null,
        photo_url: data.photo_url || null,
        nid: data.nid || null,
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

