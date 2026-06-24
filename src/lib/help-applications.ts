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

export async function submitHelpApplication(
  input: HelpSubmitInput,
): Promise<{ app_code: string }> {
  const res = await submitHelpApplicationFn({ data: input });
  if ("error" in res && res.error) throw new Error(res.error);
  if (!("app_code" in res) || !res.app_code) throw new Error("আবেদন জমা দিতে সমস্যা হয়েছে");
  return { app_code: res.app_code };
}

export async function lookupHelpApplication(
  code: string,
): Promise<PublicHelpLookup | null> {
  const trimmed = code.trim();
  if (!trimmed) return null;
  try {
    const row = await lookupHelpApplicationFn({ data: { code: trimmed } });
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
