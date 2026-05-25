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