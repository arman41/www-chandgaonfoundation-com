import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { submitMembership } from "@/lib/members.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/membership")({
  head: () => ({
    meta: [
      { title: "সদস্যপদ আবেদন — চাঁদগাঁও ফাউন্ডেশন" },
      { name: "description", content: "চাঁদগাঁও প্রবাসী ও যুবসমাজ কল্যান ফাউন্ডেশনের সদস্য হোন। আবেদন করুন, অনুমোদনের পর ডিজিটাল কার্ড পাবেন।" },
      { property: "og:title", content: "সদস্যপদ আবেদন" },
    ],
  }),
  component: Page,
  errorComponent: ({ error }) => <div className="py-20 text-center text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="py-20 text-center">পাওয়া যায়নি</div>,
});

const AREAS = ["চাঁদগাঁও", "লাকসাম", "কুমিল্লা", "ঢাকা", "চট্টগ্রাম", "প্রবাসী", "অন্যান্য"];
const ROLES = ["সদস্য", "সহযোগী সদস্য", "স্বেচ্ছাসেবক", "দাতা সদস্য", "আজীবন সদস্য"];

function Page() {
  const submit = useServerFn(submitMembership);
  const [form, setForm] = useState({ name: "", phone: "", email: "", area: AREAS[0], role: ROLES[0], notes: "", photo_url: "" });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ id: string; name: string } | null>(null);

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("ছবি ফাইল নির্বাচন করুন");
    if (file.size > 5 * 1024 * 1024) return setError("ছবির আকার ৫MB-এর কম হতে হবে");
    setError(null);
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `members/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage.from("foundation-media").upload(path, file, { upsert: false, contentType: file.type });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("foundation-media").getPublicUrl(path);
      setForm((f) => ({ ...f, photo_url: data.publicUrl }));
    } catch (err: any) {
      setError(err?.message || "ছবি আপলোড ব্যর্থ");
    } finally { setUploading(false); }
  };

  const upd = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^01[3-9]\d{8}$/.test(form.phone)) return setError("সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন");
    setLoading(true);
    try {
      const r = await submit({ data: form });
      setDone(r as any);
    } catch (err: any) {
      setError(err?.message || "জমা দেওয়া যায়নি");
    } finally { setLoading(false); }
  };

  if (done) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
        <div className="text-6xl mb-5">🎉</div>
        <h1 className="text-3xl font-bold text-primary">আবেদন গৃহীত হয়েছে</h1>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          ধন্যবাদ <strong>{done.name}</strong>। আপনার আবেদন <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">যাচাই চলছে</span>। অনুমোদনের পর SMS-এ আপনার সদস্য নম্বর পাবেন।
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/my-membership" className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold">আমার কার্ড দেখুন</Link>
          <Link to="/" className="px-6 py-3 rounded-full border border-border font-semibold">হোমে ফিরুন</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="text-center mb-8 sm:mb-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">সদস্যপদ আবেদন</p>
        <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
          আমাদের <span style={{ color: "var(--gold)" }}>পরিবারের অংশ</span> হোন
        </h1>
        <p className="mt-4 text-sm text-muted-foreground max-w-md mx-auto">
          আবেদন জমা দিন, অনুমোদনের পর QR সহ ডিজিটাল সদস্য কার্ড পাবেন।
        </p>
      </div>

      <form onSubmit={onSubmit} className="bg-card border border-border rounded-3xl p-5 sm:p-8 md:p-10 space-y-5" style={{ boxShadow: "var(--shadow-elegant)" }}>
        <Row><L>পূর্ণ নাম *</L><input required value={form.name} onChange={upd("name")} className={cls} placeholder="যেমন: আব্দুল করিম" /></Row>
        <div className="grid sm:grid-cols-2 gap-4">
          <Row><L>মোবাইল নম্বর *</L><input required value={form.phone} onChange={upd("phone")} inputMode="numeric" maxLength={11} className={cls} placeholder="01XXXXXXXXX" /></Row>
          <Row><L>ইমেইল</L><input type="email" value={form.email} onChange={upd("email")} className={cls} placeholder="optional@example.com" /></Row>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Row><L>এলাকা *</L>
            <select value={form.area} onChange={upd("area")} className={cls}>{AREAS.map((a) => <option key={a}>{a}</option>)}</select>
          </Row>
          <Row><L>সদস্যপদের ধরন</L>
            <select value={form.role} onChange={upd("role")} className={cls}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select>
          </Row>
        </div>
        <Row><L>ছবির URL (ঐচ্ছিক)</L><input value={form.photo_url} onChange={upd("photo_url")} className={cls} placeholder="https://..." /></Row>
        <Row><L>কেন সদস্য হতে চান?</L>
          <textarea value={form.notes} onChange={upd("notes")} rows={3} className={cls} placeholder="সংক্ষেপে লিখুন..." />
        </Row>

        {error && <p className="text-sm text-destructive text-center">{error}</p>}
        <button disabled={loading} className="w-full py-4 rounded-full text-base font-bold disabled:opacity-60" style={{ background: "var(--gradient-gold)", color: "oklch(0.22 0.05 160)", boxShadow: "var(--shadow-gold)" }}>
          {loading ? "জমা হচ্ছে..." : "আবেদন জমা দিন"}
        </button>
        <p className="text-center text-xs text-muted-foreground">
          আগেই সদস্য? <Link to="/my-membership" className="text-primary font-semibold underline">আমার কার্ড দেখুন</Link>
        </p>
      </form>
    </div>
  );
}

const cls = "mt-2 w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm";
const Row = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
const L = ({ children }: { children: React.ReactNode }) => <label className="text-sm font-semibold">{children}</label>;
