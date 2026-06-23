import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Building2, Save, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, Field, inputCls, showError } from "@/components/admin/AdminCrud";

export const Route = createFileRoute("/admin/foundation")({
  head: () => ({ meta: [{ title: "ফাউন্ডেশন তথ্য | অ্যাডমিন" }] }),
  component: Page,
});

type Row = Record<string, any>;

const FIELDS: { key: string; label: string; type?: string; full?: boolean }[] = [
  { key: "name", label: "ফাউন্ডেশন নাম", full: true },
  { key: "tagline", label: "ট্যাগলাইন", full: true },
  { key: "about_short", label: "সংক্ষিপ্ত পরিচিতি", full: true },
  { key: "phone", label: "ফোন" },
  { key: "email", label: "ইমেইল", type: "email" },
  { key: "address", label: "ঠিকানা", full: true },
  { key: "facebook_url", label: "Facebook URL" },
  { key: "youtube_url", label: "YouTube URL" },
  { key: "whatsapp_url", label: "WhatsApp Link" },
  { key: "instagram_url", label: "Instagram URL" },
  { key: "twitter_url", label: "Twitter/X URL" },
  { key: "website_url", label: "Website URL" },
  { key: "bkash_number", label: "বিকাশ নম্বর" },
  { key: "nagad_number", label: "নগদ নম্বর" },
  { key: "rocket_number", label: "রকেট নম্বর" },
  { key: "islami_bank_account", label: "ইসলামি ব্যাংক অ্যাকাউন্ট" },
];

function Page() {
  const [row, setRow] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("foundation_settings" as any)
      .select("*")
      .limit(1)
      .maybeSingle();
    if (error) showError(error);
    const r: any = (data as any) ?? {};
    const map: Record<string, string[]> = (r.union_ward_map && typeof r.union_ward_map === "object") ? r.union_ward_map : {};
    const mapRows = Object.keys(map).length > 0
      ? Object.entries(map).map(([union, wards]) => ({ union, wards: (wards ?? []).join(", ") }))
      : (Array.isArray(r.allowed_unions) ? r.allowed_unions : []).map((u: string) => ({ union: u, wards: "" }));
    r.__map_rows = mapRows;
    setRow(r);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);


  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!row?.id) return;
    setSaving(true);
    const payload: Row = {};
    for (const f of FIELDS) payload[f.key] = row[f.key] ?? null;
    payload.logo_url = row.logo_url ?? null;
    const toArr = (v: any): string[] =>
      Array.isArray(v)
        ? v
        : String(v ?? "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
    payload.allowed_thanas = toArr(row.allowed_thanas);

    // Build union_ward_map from edited rows; derive allowed_unions/allowed_wards from it
    const map: Record<string, string[]> = {};
    const rawMap: Array<{ union: string; wards: string }> = Array.isArray(row.__map_rows) ? row.__map_rows : [];
    for (const r of rawMap) {
      const u = (r.union || "").trim();
      if (!u) continue;
      const wards = toArr(r.wards);
      map[u] = wards;
    }
    payload.union_ward_map = map;
    payload.allowed_unions = Object.keys(map);
    payload.allowed_wards = Array.from(new Set(Object.values(map).flat()));

    const { error } = await supabase
      .from("foundation_settings" as any)
      .update(payload)
      .eq("id", row.id);
    setSaving(false);
    if (error) return showError(error);
    toast.success("সংরক্ষিত হয়েছে");
    load();
  }


  async function onLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !row?.id) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `foundation/logo-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("foundation-media")
        .upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("foundation-media").getPublicUrl(path);
      setRow((r) => ({ ...(r ?? {}), logo_url: pub.publicUrl }));
      toast.success("লোগো আপলোড হয়েছে। সংরক্ষণ করতে ভুলবেন না।");
    } catch (err) {
      showError(err);
    } finally {
      setUploading(false);
    }
  }

  if (loading) return <div className="p-8 text-center text-muted-foreground">লোড হচ্ছে...</div>;

  return (
    <div className="space-y-6">
      <PageHeader icon={Building2} title="ফাউন্ডেশন তথ্য" subtitle="পাবলিক সাইটে দেখানো নাম, যোগাযোগ ও সোশ্যাল লিংক" />

      <form onSubmit={save} className="space-y-6">
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-semibold mb-4">লোগো</h2>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="h-20 w-20 rounded-xl border border-border bg-muted/40 overflow-hidden grid place-items-center">
              {row?.logo_url ? (
                <img src={row.logo_url} alt="logo" className="h-full w-full object-contain" />
              ) : (
                <span className="text-xs text-muted-foreground">নেই</span>
              )}
            </div>
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm cursor-pointer hover:bg-muted">
              <Upload className="h-4 w-4" />
              {uploading ? "আপলোড হচ্ছে..." : "নতুন লোগো"}
              <input type="file" accept="image/*" hidden onChange={onLogo} disabled={uploading} />
            </label>
            {row?.logo_url && (
              <button type="button" onClick={() => setRow((r) => ({ ...(r ?? {}), logo_url: null }))}
                className="text-xs text-destructive hover:underline">সরান</button>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-semibold mb-4">তথ্য</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {FIELDS.map((f) => (
              <div key={f.key} className={f.full ? "sm:col-span-2" : ""}>
                <Field label={f.label}>
                  <input
                    type={f.type ?? "text"}
                    className={inputCls}
                    value={row?.[f.key] ?? ""}
                    onChange={(e) => setRow((r) => ({ ...(r ?? {}), [f.key]: e.target.value }))}
                  />
                </Field>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-semibold mb-1">আবেদন এলাকা সীমাবদ্ধতা</h2>
          <p className="text-xs text-muted-foreground mb-4">
            সাহায্যের আবেদন ফর্মে শুধু এই থানা, ইউনিয়ন/পৌরসভা ও ওয়ার্ড থেকেই আবেদন গ্রহণ করা হবে। যেটি খালি রাখবেন সেটি যাচাই হবে না (সব এলাকা গ্রহণযোগ্য)। একাধিক মান কমা (,) দিয়ে আলাদা করুন — যেমন: <b>চাঁদগাঁও, বোয়ালখালী, পাঁচলাইশ</b>।
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="অনুমোদিত থানা/উপজেলা">
              <input
                className={inputCls}
                value={
                  Array.isArray(row?.allowed_thanas)
                    ? (row?.allowed_thanas as string[]).join(", ")
                    : (row?.allowed_thanas ?? "")
                }
                onChange={(e) => setRow((r) => ({ ...(r ?? {}), allowed_thanas: e.target.value }))}
                placeholder="চাঁদগাঁও, বোয়ালখালী"
              />
            </Field>
            <Field label="অনুমোদিত ইউনিয়ন/পৌরসভা">
              <input
                className={inputCls}
                value={
                  Array.isArray(row?.allowed_unions)
                    ? (row?.allowed_unions as string[]).join(", ")
                    : (row?.allowed_unions ?? "")
                }
                onChange={(e) => setRow((r) => ({ ...(r ?? {}), allowed_unions: e.target.value }))}
                placeholder="চাঁদগাঁও, মোহরা"
              />
            </Field>
            <Field label="অনুমোদিত ওয়ার্ড">
              <input
                className={inputCls}
                value={
                  Array.isArray(row?.allowed_wards)
                    ? (row?.allowed_wards as string[]).join(", ")
                    : (row?.allowed_wards ?? "")
                }
                onChange={(e) => setRow((r) => ({ ...(r ?? {}), allowed_wards: e.target.value }))}
                placeholder="১, ২, ৩"
              />
            </Field>
          </div>
        </section>

        <div className="flex justify-end">
          <button disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-50">
            <Save className="h-4 w-4" /> {saving ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
          </button>
        </div>
      </form>
    </div>
  );
}
