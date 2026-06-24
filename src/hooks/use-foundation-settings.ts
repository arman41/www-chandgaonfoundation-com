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
  // bkash/nagad/rocket/islami_bank_account are not part of this client-visible type.
  // Banking info is served via the `getDonationInfoFn` server function only.

  about_short: string | null;
  allowed_wards: string[] | null;
  allowed_unions: string[] | null;
  allowed_thanas: string[] | null;
  union_ward_map: Record<string, string[]> | null;
};


export function useFoundationSettings() {
  const [settings, setSettings] = useState<FoundationSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("foundation_public_settings")
      .select("*")
      .limit(1)
      .maybeSingle();
    setSettings((data as FoundationSettings | null) ?? null);
    setLoading(false);
  }, []);


  useEffect(() => { load(); }, [load]);
  return { settings, loading, reload: load };
}
