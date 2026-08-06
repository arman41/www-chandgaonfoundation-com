import { supabase } from "@/integrations/supabase/client";
import { submitHelpApplicationFn, lookupHelpApplicationFn } from "./help-applications.functions";


export type HelpStatus =
  | "pending"
  | "under_review"
  | "approved"
  | "completed"
  | "rejected";

export type HelpApplication = {
  id: string;
  app_code: string;
  name: string;
  phone: string;
  nid: string;
  type: string;
  amount: string | null;
  reason: string;
  address: string | null;
  file_count: number;
  status: HelpStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  project_id: string | null;
  father_name: string | null;
  mother_name: string | null;
  dob: string | null;
  gender: string | null;
  occupation: string | null;
  monthly_income: number | null;
  family_count: number | null;
  present_address: string | null;
  permanent_address: string | null;
  photo_url: string | null;
  nid_front_url: string | null;
  nid_back_url: string | null;
  requested_amount: number | null;
  financial_condition: string | null;
  additional_notes: string | null;
};

export type PublicHelpLookup = {
  app_code: string;
  name: string;
  type: string;
  amount: string | null;
  file_count: number;
  status: HelpStatus;
  created_at: string;
};

export type HelpSubmitInput = {
  name: string;
  phone: string;
  nid: string;
  address: string;
  type: string;
  amount: string;
  reason: string;
  fileCount: number;
  project_id?: string | null;
  father_name?: string | null;
  mother_name?: string | null;
  dob?: string | null;
  gender?: "male" | "female" | "other" | null;
  occupation?: string | null;
  monthly_income?: number | null;
  family_count?: number | null;
  present_address?: string | null;
  permanent_address?: string | null;
  photo_url?: string | null;
  nid_front_url?: string | null;
  nid_back_url?: string | null;
  requested_amount?: number | null;
  financial_condition?: string | null;
  additional_notes?: string | null;
};

function randomToken() {
  const rnd = () =>
    globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
  return `${rnd()}-${rnd()}`;
}

/** Direct browser insert — used when the server route is unreachable. */
async function submitHelpApplicationDirect(
  input: HelpSubmitInput,
): Promise<{ app_code: string; upload_token: string }> {
  const upload_token = randomToken();
  const { data, error } = await supabase
    .from("help_applications")
    .insert({
      name: input.name,
      phone: input.phone,
      nid: input.nid,
      address: input.address || null,
      type: input.type,
      amount: input.amount || null,
      reason: input.reason,
      file_count: input.fileCount,
      status: "pending",
      project_id: input.project_id ?? null,
      father_name: input.father_name ?? null,
      mother_name: input.mother_name ?? null,
      dob: input.dob || null,
      gender: input.gender ?? null,
      occupation: input.occupation ?? null,
      monthly_income: input.monthly_income ?? null,
      family_count: input.family_count ?? null,
      present_address: input.present_address ?? null,
      permanent_address: input.permanent_address ?? null,
      photo_url: input.photo_url ?? null,
      nid_front_url: input.nid_front_url ?? null,
      nid_back_url: input.nid_back_url ?? null,
      requested_amount: input.requested_amount ?? null,
      financial_condition: input.financial_condition ?? null,
      additional_notes: input.additional_notes ?? null,
      pdf_upload_token: upload_token,
    } as never)
    .select("app_code")
    .single();
  if (error) {
    if (error.code === "23505") throw new Error("আপনি ইতোমধ্যে এই প্রকল্পে আবেদন করেছেন।");
    throw new Error(error.message || "আবেদন জমা দিতে সমস্যা হয়েছে");
  }
  return { app_code: (data as any).app_code as string, upload_token };
}

export async function submitHelpApplication(
  input: HelpSubmitInput,
): Promise<{ app_code: string; upload_token: string }> {
  try {
    const res = await submitHelpApplicationFn({ data: input });
    if ("error" in res && res.error) throw new Error(res.error);
    if (!("app_code" in res) || !res.app_code) throw new Error("আবেদন জমা দিতে সমস্যা হয়েছে");
    return { app_code: res.app_code, upload_token: (res as any).upload_token as string };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // Network/runtime failure of the server route (e.g. "fetch failed",
    // 500/404 on some hosts) — fall back to a direct authenticated insert.
    const isServerRouteFailure =
      /fetch failed|failed to fetch|networkerror|load failed|unexpected token|<!doctype|internal server error|500|404/i.test(
        msg,
      );
    if (!isServerRouteFailure) throw err;
    return submitHelpApplicationDirect(input);
  }
}

export async function lookupHelpApplication(
  code: string,
  phone_last4: string,
): Promise<PublicHelpLookup | null> {
  const trimmed = code.trim();
  const last4 = phone_last4.trim();
  if (!trimmed || !/^\d{4}$/.test(last4)) return null;
  try {
    const row = await lookupHelpApplicationFn({ data: { code: trimmed, phone_last4: last4 } });
    return (row as PublicHelpLookup | null) ?? null;
  } catch (err) {
    console.error("lookup_help_application:", err);
    return null;
  }
}


export const STATUS_LABELS: Record<HelpStatus, string> = {
  pending: "জমা হয়েছে",
  under_review: "যাচাই চলছে",
  approved: "অনুমোদিত",
  completed: "সম্পন্ন",
  rejected: "প্রত্যাখ্যাত",
};

export const STATUS_STEPS: HelpStatus[] = [
  "pending",
  "under_review",
  "approved",
  "completed",
];
