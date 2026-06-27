import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { submitMembership } from "@/lib/members.functions";
import { uploadMemberPhoto } from "@/lib/uploads.functions";


export const Route = createFileRoute("/membership")({
  head: () => ({
    meta: [
      { title: "সদস্যপদ আবেদন — চাঁদগাঁও ফাউন্ডেশন" },
      { name: "description", content: "চাঁদগাঁও প্রবাসী ও যুবসমাজ কল্যান ফাউন্ডেশনের সদস্য হোন। আবেদন করুন, অনুমোদনের পর ডিজিটাল কার্ড পাবেন।" },
      { property: "og:title", content: "সদস্যপদ আবেদন — চাঁদগাঁও ফাউন্ডেশন" },
      { property: "og:description", content: "অনলাইনে সদস্যপদের জন্য আবেদন করুন। অনুমোদনের পর QR কোডসহ ডিজিটাল সদস্য কার্ড পাবেন।" },
      { property: "og:url", content: "https://www.chandgaonfundition.xyz/membership" },
      { name: "twitter:title", content: "সদস্যপদ আবেদন — চাঁদগাঁও ফাউন্ডেশন" },
      { name: "twitter:description", content: "অনলাইনে সদস্যপদের জন্য আবেদন করুন। অনুমোদনের পর QR কোডসহ ডিজিটাল সদস্য কার্ড পাবেন।" },
      { property: "og:image", content: "https://www.chandgaonfundition.xyz/og-image.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "সদস্যপদ আবেদন — চাঁদগাঁও ফাউন্ডেশন" },
      { name: "twitter:image", content: "https://www.chandgaonfundition.xyz/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://www.chandgaonfundition.xyz/membership" }],
  }),
  component: Page,
  errorComponent: ({ error }) => <div className="py-20 text-center text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="py-20 text-center">পাওয়া যায়নি</div>,
});

const AREAS = ["চাঁদগাঁও", "লাকসাম", "কুমিল্লা", "ঢাকা", "চট্টগ্রাম", "প্রবাসী", "অন্যান্য"];
const ROLES = ["সদস্য", "সহযোগী সদস্য", "স্বেচ্ছাসেবক", "দাতা সদস্য", "আজীবন সদস্য"];
const OCCUPATIONS = ["ছাত্র/ছাত্রী", "শিক্ষক", "ব্যবসায়ী", "চাকরিজীবী", "কৃষক", "ডাক্তার", "প্রকৌশলী", "প্রবাসী কর্মী", "গৃহিণী", "অন্যান্য"];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const idx = result.indexOf(",");
      resolve(idx >= 0 ? result.slice(idx + 1) : result);
    };
    reader.onerror = () => reject(new Error("ছবি পড়া যায়নি"));
    reader.readAsDataURL(file);
  });
}

function Page() {
  const submit = useServerFn(submitMembership);
  const uploadPhoto = useServerFn(uploadMemberPhoto);
  const [form, setForm] = useState({ name: "", phone: "", email: "", area: AREAS[0], role: ROLES[0], occupation: OCCUPATIONS[0], occupationOther: "", notes: "", photo_url: "", education: "", experience: "" });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ id: string; name: string } | null>(null);

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("ছবি ফাইল নির্বাচন করুন");
    if (file.size > 3 * 1024 * 1024) return setError("ছবির আকার ৩MB-এর কম হতে হবে");
    setError(null);
    setUploading(true);
    try {
      const dataBase64 = await fileToBase64(file);
      const r = await uploadPhoto({ data: { filename: file.name, contentType: file.type, dataBase64 } });
      setForm((f) => ({ ...f, photo_url: r.url }));
    } catch (err: any) {
      setError(err?.message || "ছবি আপলোড ব্যর্থ");
    } finally { setUploading(false); }
  };

  const upd = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.photo_url) return setError("আইডি কার্ডের জন্য আপনার ছবি আপলোড করুন");
    if (!/^01[3-9]\d{8}$/.test(form.phone)) return setError("সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন");
    setLoading(true);
    try {
      const isVolunteer = form.role === "স্বেচ্ছাসেবক";
      const occupationValue = form.occupation === "অন্যান্য" ? form.occupationOther.trim() : form.occupation;
      const parts = [
        occupationValue && `পেশা: ${occupationValue}`,
        isVolunteer && form.education.trim() && `শিক্ষাগত যোগ্যতা: ${form.education.trim()}`,
        isVolunteer && form.experience.trim() && `পূর্ব অভিজ্ঞতা: ${form.experience.trim()}`,
      ].filter(Boolean);
      const mergedNotes = [parts.join("\n"), form.notes.trim()].filter(Boolean).join("\n\n").slice(0, 500);
      const payload = {
        name: form.name, phone: form.phone, email: form.email, area: form.area,
        role: form.role, notes: mergedNotes, photo_url: form.photo_url,
      };
      const r = await submit({ data: payload });
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
        {/* Photo upload — prominent, on top, required for ID card */}
        <div className="flex flex-col items-center gap-3 pb-5 border-b border-border">
          <L>আপনার ছবি * <span className="text-xs font-normal text-muted-foreground">(আইডি কার্ডে ব্যবহৃত হবে)</span></L>
          <div className="relative">
            {form.photo_url ? (
              <img src={form.photo_url} alt="সদস্যের ছবির প্রিভিউ" className="w-28 h-28 rounded-full object-cover border-4" style={{ borderColor: "var(--gold)" }} />
            ) : (
              <div className="w-28 h-28 rounded-full bg-muted border-2 border-dashed border-border flex flex-col items-center justify-center text-center">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><circle cx="12" cy="13" r="3.5"/></svg>
                <span className="text-[10px] font-semibold text-muted-foreground mt-1">ছবি</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <label className="cursor-pointer text-xs font-semibold px-3 py-2 rounded-full border border-input bg-background hover:bg-accent/30">
              📷 ক্যামেরা
              <input type="file" accept="image/*" capture="user" className="hidden" onChange={onPhoto} disabled={uploading} />
            </label>
            <label className="cursor-pointer text-xs font-semibold px-3 py-2 rounded-full border border-input bg-background hover:bg-accent/30">
              🖼️ গ্যালারি
              <input type="file" accept="image/*" className="hidden" onChange={onPhoto} disabled={uploading} />
            </label>
            {form.photo_url && (
              <button type="button" onClick={() => setForm((f) => ({ ...f, photo_url: "" }))} className="text-xs text-destructive font-semibold px-3 py-2">মুছুন</button>
            )}
          </div>
          {uploading && <span className="text-xs text-muted-foreground">আপলোড হচ্ছে...</span>}
        </div>


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
        <div className="grid sm:grid-cols-2 gap-4">
          <Row><L>পেশা *</L>
            <select value={form.occupation} onChange={upd("occupation")} className={cls}>{OCCUPATIONS.map((o) => <option key={o}>{o}</option>)}</select>
          </Row>
          {form.occupation === "অন্যান্য" && (
            <Row><L>পেশা লিখুন *</L>
              <input value={form.occupationOther} onChange={upd("occupationOther")} className={cls} placeholder="আপনার পেশা" />
            </Row>
          )}
        </div>
        {form.role === "স্বেচ্ছাসেবক" && (
          <>
            <Row><L>শিক্ষাগত যোগ্যতা</L>
              <input value={form.education} onChange={upd("education")} className={cls} placeholder="যেমন: এইচএসসি / স্নাতক" />
            </Row>
            <Row><L>পূর্ব অভিজ্ঞতা (যদি থাকে)</L>
              <textarea value={form.experience} onChange={upd("experience")} rows={3} className={cls} placeholder="অতীতে কোনো সংগঠন/স্বেচ্ছাসেবী কাজের অভিজ্ঞতা থাকলে লিখুন" />
            </Row>
          </>
        )}
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
const Row = ({ children }: { children: React.ReactNode }) => <label className="block">{children}</label>;
const L = ({ children }: { children: React.ReactNode }) => <span className="block text-sm font-semibold">{children}</span>;
