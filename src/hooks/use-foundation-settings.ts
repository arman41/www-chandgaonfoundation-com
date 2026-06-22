import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type FoundationSettings = {
  id: string;
  name: string;
  tagline: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  logo_url: string | null;
  facebook_url: string | null;
  youtube_url: string | null;
  whatsapp_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  website_url: string | null;
  bkash_number: string | null;
  nagad_number: string | null;
  rocket_number: string | null;
  islami_bank_account: string | null;
  about_short: string | null;
  allowed_wards: string[] | null;
  allowed_unions: string[] | null;
  allowed_thanas: string[] | null;
};

export function useFoundationSettings() {
  const [settings, setSettings] = useState<FoundationSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("foundation_settings" as any)
      .select("*")
      .limit(1)
      .maybeSingle();
    setSettings((data as any) ?? null);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  return { settings, loading, reload: load };
}
