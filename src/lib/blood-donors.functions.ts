import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createHmac, timingSafeEqual } from "crypto";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const PhoneSchema = z
  .string()
  .trim()
  .regex(/^01[3-9]\d{8}$/, { message: "সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন" });

function getSecret(): string {
  const s = process.env.OTP_SIGNING_SECRET;
  if (!s) throw new Error("OTP signing secret missing");
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

function verifyVerifiedToken(token: string, phone: string): void {
  let parsed: { p: string; e: number; s: string };
  try {
    parsed = JSON.parse(Buffer.from(token, "base64url").toString("utf8"));
  } catch {
    throw new Error("মোবাইল নম্বর যাচাই টোকেন অবৈধ");
  }
  if (!parsed?.p || !parsed?.e || !parsed?.s) throw new Error("মোবাইল নম্বর যাচাই টোকেন অবৈধ");
  if (parsed.p !== phone) throw new Error("যাচাইকৃত ফোন নম্বর মেলেনি");
  if (Date.now() > parsed.e) throw new Error("মোবাইল যাচাইয়ের মেয়াদ শেষ, আবার যাচাই করুন");
  const expected = sign(`verified.${parsed.p}.${parsed.e}`);
  const a = Buffer.from(expected);
  const b = Buffer.from(parsed.s);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error("মোবাইল নম্বর যাচাই টোকেন অবৈধ");
  }
}

const ProfileSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  father_name: z.string().trim().max(120).nullable().optional(),
  phone: PhoneSchema,
  blood_group: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]),
  district: z.string().trim().min(1).max(80),
  thana: z.string().trim().max(80).nullable().optional(),
  address: z.string().trim().max(500).nullable().optional(),
  photo_url: z.string().url().max(500).nullable().optional().or(z.literal("").transform(() => null)),
  last_donation_date: z.string().trim().nullable().optional().or(z.literal("").transform(() => null)),
  is_available: z.boolean(),
  notes: z.string().trim().max(1000).nullable().optional(),
  verified_token: z.string().min(10),
});

export const saveBloodDonorProfileFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => ProfileSchema.parse(i))
  .handler(async ({ data, context }) => {
    verifyVerifiedToken(data.verified_token, data.phone);
    const { verified_token: _t, ...profile } = data;
    const { data: row, error } = await context.supabase
      .from("blood_donors")
      .upsert(
        { ...profile, user_id: context.userId },
        { onConflict: "user_id" },
      )
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });
