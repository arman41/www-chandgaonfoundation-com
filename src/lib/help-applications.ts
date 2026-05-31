import { supabase } from "@/integrations/supabase/client";
import { submitHelpApplicationFn } from "./help-applications.functions";

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
  return submitHelpApplicationFn({ data: input });
}

export async function lookupHelpApplication(
  code: string,
): Promise<PublicHelpLookup | null> {
  const trimmed = code.trim();
  if (!trimmed) return null;
  const { data, error } = await supabase.rpc("lookup_help_application", {
    _code: trimmed,
  });
  if (error) {
    console.error("lookup_help_application:", error.message);
    return null;
  }
  const row = (data as PublicHelpLookup[] | null)?.[0];
  return row ?? null;
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
