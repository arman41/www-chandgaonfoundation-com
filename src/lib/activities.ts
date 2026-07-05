import { supabase } from "@/integrations/supabase/client";

export type Activity = {
  id: string;
  title: string;
  category: string;
  date: string;
  location: string;
  description: string;
  imageUrl?: string | null;
  createdAt: string;
  goalAmount: number | null;
  raisedAmount: number;
  supportersCount: number;
};

function mapRow(r: {
  id: string;
  title: string;
  category: string;
  date: string;
  location: string;
  description: string;
  image_url: string | null;
  created_at: string;
  goal_amount?: number | string | null;
  raised_amount?: number | string | null;
  supporters_count?: number | null;
}): Activity {
  return {
    id: r.id,
    title: r.title,
    category: r.category,
    date: r.date,
    location: r.location,
    description: r.description,
    imageUrl: r.image_url,
    createdAt: r.created_at,
    goalAmount: r.goal_amount != null ? Number(r.goal_amount) : null,
    raisedAmount: r.raised_amount != null ? Number(r.raised_amount) : 0,
    supportersCount: r.supporters_count ?? 0,
  };
}

export async function listActivities(): Promise<Activity[]> {
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function publishActivity(a: {
  title: string;
  category: string;
  date: string;
  location: string;
  description: string;
  imageUrl?: string;
  goalAmount?: number | null;
}): Promise<Activity> {
  const { data, error } = await supabase
    .from("activities")
    .insert({
      title: a.title,
      category: a.category,
      date: a.date,
      location: a.location,
      description: a.description,
      image_url: a.imageUrl ?? null,
      goal_amount: a.goalAmount ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return mapRow(data);
}

export const CATEGORIES = [
  "খাদ্য সহায়তা",
  "শিক্ষা বৃত্তি",
  "চিকিৎসা সহায়তা",
  "শীতবস্ত্র বিতরণ",
  "দুর্যোগ ত্রাণ",
  "ধর্মীয় কার্যক্রম",
  "অন্যান্য",
];
