import { supabase } from "@/integrations/supabase/client";

export type BloodDonor = {
  id: string;
  user_id: string;
  full_name: string;
  father_name: string | null;
  phone: string;
  blood_group: string;
  district: string;
  thana: string | null;
  address: string | null;
  photo_url: string | null;
  last_donation_date: string | null;
  is_available: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export const BD_DISTRICTS = [
  "ঢাকা", "চট্টগ্রাম", "রাজশাহী", "খুলনা", "বরিশাল", "সিলেট", "রংপুর", "ময়মনসিংহ",
  "কুমিল্লা", "নোয়াখালী", "ফেনী", "লক্ষ্মীপুর", "চাঁদপুর", "কক্সবাজার", "বান্দরবান",
  "রাঙ্গামাটি", "খাগড়াছড়ি", "ব্রাহ্মণবাড়িয়া", "নরসিংদী", "গাজীপুর", "মুন্সিগঞ্জ",
  "মানিকগঞ্জ", "নারায়ণগঞ্জ", "ফরিদপুর", "রাজবাড়ী", "গোপালগঞ্জ", "মাদারীপুর", "শরীয়তপুর",
  "কিশোরগঞ্জ", "টাঙ্গাইল", "নেত্রকোনা", "জামালপুর", "শেরপুর", "যশোর", "সাতক্ষীরা",
  "বাগেরহাট", "মাগুরা", "নড়াইল", "কুষ্টিয়া", "চুয়াডাঙ্গা", "মেহেরপুর", "ঝিনাইদহ",
  "পটুয়াখালী", "বরগুনা", "ভোলা", "পিরোজপুর", "ঝালকাঠি", "হবিগঞ্জ", "মৌলভীবাজার",
  "সুনামগঞ্জ", "বগুড়া", "জয়পুরহাট", "নওগাঁ", "নাটোর", "চাঁপাইনবাবগঞ্জ", "পাবনা",
  "সিরাজগঞ্জ", "দিনাজপুর", "ঠাকুরগাঁও", "পঞ্চগড়", "নীলফামারী", "লালমনিরহাট", "কুড়িগ্রাম",
  "গাইবান্ধা", "মেহেরপুর",
];

export async function listBloodDonors(filter?: { district?: string; blood_group?: string }) {
  let q = supabase.from("blood_donors").select("*").order("created_at", { ascending: false });
  if (filter?.district) q = q.eq("district", filter.district);
  if (filter?.blood_group) q = q.eq("blood_group", filter.blood_group);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as BloodDonor[];
}

export async function getMyDonorProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase.from("blood_donors").select("*").eq("user_id", user.id).maybeSingle();
  if (error) throw error;
  return data as BloodDonor | null;
}

export async function upsertMyDonorProfile(payload: Omit<BloodDonor, "id" | "user_id" | "created_at" | "updated_at">) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("লগইন করুন");
  const { data, error } = await supabase
    .from("blood_donors")
    .upsert({ ...payload, user_id: user.id }, { onConflict: "user_id" })
    .select()
    .single();
  if (error) throw error;
  return data as BloodDonor;
}

export async function deleteMyDonorProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("লগইন করুন");
  const { error } = await supabase.from("blood_donors").delete().eq("user_id", user.id);
  if (error) throw error;
}
