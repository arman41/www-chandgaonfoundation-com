import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createHmac, timingSafeEqual } from "crypto";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { sendBdSms } from "./sms-sender.server";

const PhoneSchema = z
  .string()
  .trim()
  .regex(/^01[3-9]\d{8}$/, { message: "সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন" });

function normalizeBd(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.startsWith("880")) return d;
  if (d.startsWith("0")) return "880" + d.slice(1);
  return d;
}

function getSecret(): string {
  const s = process.env.OTP_SIGNING_SECRET;
  if (!s) throw new Error("OTP signing secret missing");
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

function makeToken(phone: string, otp: string, expiresAt: number): string {
  const body = `${phone}.${otp}.${expiresAt}`;
  const sig = sign(body);
  // token exposes only phone + expiry; otp is embedded in the signed hash
  const publicBody = `${phone}.${expiresAt}`;
  const publicSig = sign(publicBody + "|" + otp);
  return Buffer.from(JSON.stringify({ p: phone, e: expiresAt, s: publicSig })).toString(
    "base64url"
  );
}

function verifyToken(token: string, otp: string): { phone: string } {
  let parsed: { p: string; e: number; s: string };
  try {
    parsed = JSON.parse(Buffer.from(token, "base64url").toString("utf8"));
  } catch {
    throw new Error("অবৈধ যাচাই টোকেন");
  }
  if (!parsed?.p || !parsed?.e || !parsed?.s) throw new Error("অবৈধ যাচাই টোকেন");
  if (Date.now() > parsed.e) throw new Error("OTP-এর মেয়াদ শেষ, আবার পাঠান");
  const expected = sign(`${parsed.p}.${parsed.e}` + "|" + otp);
  const a = Buffer.from(expected);
  const b = Buffer.from(parsed.s);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error("OTP সঠিক নয়");
  }
  return { phone: parsed.p };
}

export const sendPhoneOtp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ phone: PhoneSchema }).parse(input)
  )
  .handler(async ({ data }) => {
    const otp = String(100000 + (crypto.getRandomValues(new Uint32Array(1))[0] % 900000));
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 min
    const token = makeToken(data.phone, otp, expiresAt);

    const msg = `চাঁদগাঁও ফাউন্ডেশন: আপনার যাচাই কোড ${otp} (৫ মিনিট বৈধ)`;
    try {
      await sendBdSms(data.phone, msg);
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : "OTP পাঠানো ব্যর্থ হয়েছে");
    }
    return { token, expiresAt };
  });

export const verifyPhoneOtp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        phone: PhoneSchema,
        otp: z.string().trim().regex(/^\d{6}$/, "৬ ডিজিটের OTP দিন"),
        token: z.string().min(10),
      })
      .parse(input)
  )
  .handler(async ({ data }) => {
    const { phone } = verifyToken(data.token, data.otp);
    if (phone !== data.phone) throw new Error("ফোন নম্বর মেলেনি");
    // Sign a short-lived "verified" token to attach to the profile save
    const expiresAt = Date.now() + 30 * 60 * 1000;
    const verified = Buffer.from(
      JSON.stringify({
        p: phone,
        e: expiresAt,
        s: sign(`verified.${phone}.${expiresAt}`),
      })
    ).toString("base64url");
    return { verified, expiresAt };
  });
