import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const METHOD = z.enum(["bkash", "nagad", "rocket", "bank", "cash"]);

const SubmitSchema = z.object({
  donor_name: z.string().trim().min(2).max(100),
  donor_phone: z
    .string()
    .trim()
    .regex(/^01[3-9]\d{8}$/, { message: "সঠিক মোবাইল নম্বর দিন" }),
  amount: z.number().int().min(10).max(10_000_000),
  method: METHOD,
  purpose: z.string().trim().min(1).max(120),
  transaction_id: z.string().trim().min(4).max(50).regex(/^[A-Za-z0-9-]+$/),
  activity_id: z.string().uuid().optional().nullable(),
});

export type DonationRecord = {
  id: string;
  donor_name: string;
  donor_phone: string | null;
  amount: number;
  method: string;
  purpose: string | null;
  transaction_id: string | null;
  status: string;
  donated_at: string;
  created_at: string;
};

export const submitDonation = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SubmitSchema.parse(input))
  .handler(async ({ data }) => {
    // Prevent duplicate TX id submissions
    const { data: existing } = await supabaseAdmin
      .from("donations")
      .select("id")
      .eq("transaction_id", data.transaction_id)
      .maybeSingle();
    if (existing) {
      throw new Error("এই TX ID আগেই ব্যবহৃত হয়েছে");
    }

    const { data: inserted, error } = await supabaseAdmin
      .from("donations")
      .insert({
        donor_name: data.donor_name,
        donor_phone: data.donor_phone,
        amount: data.amount,
        method: data.method,
        purpose: data.purpose,
        transaction_id: data.transaction_id,
        activity_id: data.activity_id ?? null,
        status: "pending",
      })
      .select("id, transaction_id, amount, donor_name, donated_at, status")
      .single();
    if (error) throw new Error(error.message);
    return inserted;
  });

const LookupSchema = z.object({
  query: z.string().trim().min(4).max(50),
  phone_last4: z.string().trim().regex(/^\d{4}$/),
});

export const lookupDonation = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => LookupSchema.parse(input))
  .handler(async ({ data }) => {
    const q = data.query;
    // Match by id (uuid) or by transaction_id
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(q);
    const builder = supabaseAdmin.from("donations").select("*");
    const { data: row, error } = isUuid
      ? await builder.eq("id", q).maybeSingle()
      : await builder.eq("transaction_id", q).maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;
    const phone = (row.donor_phone || "").replace(/\D/g, "");
    if (!phone.endsWith(data.phone_last4)) {
      throw new Error("ফোন নম্বরের শেষ ৪ ডিজিট মিলছে না");
    }
    return row as DonationRecord;
  });
