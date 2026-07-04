import { supabase } from "@/integrations/supabase/client";

export type AidProject = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  budget: number | null;
  goal_amount: number | null;
  raised_amount: number | null;
  start_date: string | null;
  end_date: string | null;
  status: "active" | "completed" | "closed";
  created_at: string;
  updated_at: string;
};

export const PROJECT_CATEGORIES = [
  "চিকিৎসা সহায়তা",
  "শিক্ষা সহায়তা",
  "দারিদ্র্য বিমোচন",
  "ক্ষুদ্র ব্যবসা সহায়তা",
  "প্রতিবন্ধী সহায়তা",
  "বিধবা সহায়তা",
  "জরুরি দুর্যোগ সহায়তা",
  "আবাসন সহায়তা",
  "শিক্ষাবৃত্তি",
  "অন্যান্য",
] as const;

export const PROJECT_STATUS_LABELS: Record<AidProject["status"], string> = {
  active: "চলমান",
  completed: "সম্পন্ন",
  closed: "বন্ধ",
};

export async function listActiveProjects(): Promise<AidProject[]> {
  const { data, error } = await supabase
    .from("aid_projects" as never)
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });
  if (error) {
    console.error(error.message);
    return [];
  }
  return (data as unknown as AidProject[]) ?? [];
}
