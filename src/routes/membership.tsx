import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { submitMembership } from "@/lib/members.functions";
import { uploadMemberPhoto } from "@/lib/uploads.functions";
import { useLanguage } from "@/hooks/use-language";


export const Route = createFileRoute("/membership")({
  head: () => ({
    meta: [
      { title: "Membership Application — Chandgaon Foundation" },
      { name: "description", content: "Become a member of Chandgaon Pravasi & Youth Welfare Foundation. Apply now and receive your digital card upon approval." },
      { property: "og:title", content: "Membership Application — Chandgaon Foundation" },
      { property: "og:description", content: "Apply online for membership. After approval, receive your digital member card with QR code." },
      { property: "og:url", content: "https://www.chandgaonfundition.xyz/membership" },
      { name: "twitter:title", content: "Membership Application — Chandgaon Foundation" },
      { name: "twitter:description", content: "Apply online for membership. After approval, receive your digital member card with QR code." },
      { property: "og:image", content: "https://www.chandgaonfundition.xyz/og-image.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Membership Application — Chandgaon Foundation" },
      { name: "twitter:image", content: "https://www.chandgaonfundition.xyz/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://www.chandgaonfundition.xyz/membership" }],
  }),
  component: Page,
  errorComponent: ({ error }) => <div className="py-20 text-center text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="py-20 text-center">Not found</div>,
});

const AREAS = ["চাঁদগাঁও", "লাকসাম", "কুমিল্লা", "ঢাকা", "চট্টগ্রাম", "প্রবাসী", "অন্যান্য"];
const AREAS_EN: Record<string, string> = { "চাঁদগাঁও": "Chandgaon", "লাকসাম": "Laksam", "কুমিল্লা": "Cumilla", "ঢাকা": "Dhaka", "চট্টগ্রাম": "Chattogram", "প্রবাসী": "Expatriate", "অন্যান্য": "Other" };
const ROLES = ["সদস্য", "সহযোগী সদস্য", "স্বেচ্ছাসেবক", "দাতা সদস্য", "আজীবন সদস্য"];
const ROLES_EN: Record<string, string> = { "সদস্য": "Member", "সহযোগী সদস্য": "Associate Member", "স্বেচ্ছাসেবক": "Volunteer", "দাতা সদস্য": "Donor Member", "আজীবন সদস্য": "Lifetime Member" };
const OCCUPATIONS = ["ছাত্র/ছাত্রী", "শিক্ষক", "ব্যবসায়ী", "চাকরিজীবী", "কৃষক", "ডাক্তার", "প্রকৌশলী", "প্রবাসী কর্মী", "গৃহিণী", "অন্যান্য"];
const OCCUPATIONS_EN: Record<string, string> = { "ছাত্র/ছাত্রী": "Student", "শিক্ষক": "Teacher", "ব্যবসায়ী": "Businessperson", "চাকরিজীবী": "Service Holder", "কৃষক": "Farmer", "ডাক্তার": "Doctor", "প্রকৌশলী": "Engineer", "প্রবাসী কর্মী": "Expatriate Worker", "গৃহিণী": "Homemaker", "অন্যান্য": "Other" };

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const idx = result.indexOf(",");
      resolve(idx >= 0 ? result.slice(idx + 1) : result);
    };
    reader.onerror = () => reject(new Error("Could not read image"));
    reader.readAsDataURL(file);
  });
}

function Page() {
  const { t, lang } = useLanguage();
  const submit = useServerFn(submitMembership);
  const uploadPhoto = useServerFn(uploadMemberPhoto);
  const [form, setForm] = useState({ name: "", name_en: "", phone: "", email: "", area: AREAS[0], role: ROLES[0], occupation: OCCUPATIONS[0], occupationOther: "", notes: "", photo_url: "", education: "", experience: "", nid: "" });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ id: string; name: string } | null>(null);

  const label = (bn: string) => lang === "bn" ? bn : (AREAS_EN[bn] ?? ROLES_EN[bn] ?? OCCUPATIONS_EN[bn] ?? bn);

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError(t("ছবি ফাইল নির্বাচন করুন", "Please select an image file"));
    if (file.size > 3 * 1024 * 1024) return setError(t("ছবির আকার ৩MB-এর কম হতে হবে", "Image must be smaller than 3MB"));
    setError(null);
    setUploading(true);
    try {
      const dataBase64 = await fileToBase64(file);
      const r = await uploadPhoto({ data: { filename: file.name, contentType: file.type, dataBase64 } });
      setForm((f) => ({ ...f, photo_url: r.url }));
    } catch (err: any) {
      setError(err?.message || t("ছবি আপলোড ব্যর্থ", "Photo upload failed"));
    } finally { setUploading(false); }
  };

  const upd = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.photo_url) return setError(t("আইডি কার্ডের জন্য আপনার ছবি আপলোড করুন", "Please upload your photo for the ID card"));
    if (!form.name.trim()) return setError(t("বাংলায় পূর্ণ নাম লিখুন", "Please enter your full name in Bangla"));
    if (!/[\u0980-\u09FF]/.test(form.name)) return setError(t("নাম অবশ্যই বাংলায় লিখতে হবে", "Name must be written in Bangla"));
    if (!form.name_en.trim()) return setError(t("ইংরেজিতে পূর্ণ নাম লিখুন", "Please enter your full name in English"));
    if (!/^01[3-9]\d{8}$/.test(form.phone)) return setError(t("সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন", "Enter a valid 11-digit mobile number"));
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
        name: form.name, name_en: form.name_en.trim().toUpperCase(),
        phone: form.phone, email: form.email, area: form.area,
        role: form.role, notes: mergedNotes, photo_url: form.photo_url,
        nid: form.nid.trim(),
      };
      const r = await submit({ data: payload });
      setDone(r as any);
    } catch (err: any) {
      setError(err?.message || t("জমা দেওয়া যায়নি", "Could not submit"));
    } finally { setLoading(false); }
  };

  if (done) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
        <div className="text-6xl mb-5">🎉</div>
        <h1 className="text-3xl font-bold text-primary">{t("আবেদন গৃহীত হয়েছে", "Application Received")}</h1>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          {t("ধন্যবাদ", "Thank you")} <strong>{done.name}</strong>। {t("আপনার আবেদন", "Your application is")} <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">{t("যাচাই চলছে", "under review")}</span>। {t("অনুমোদনের পর SMS-এ আপনার সদস্য নম্বর পাবেন।", "You will receive your member number by SMS after approval.")}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/my-membership" className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold">{t("আমার কার্ড দেখুন", "View My Card")}</Link>
          <Link to="/" className="px-6 py-3 rounded-full border border-border font-semibold">{t("হোমে ফিরুন", "Back to Home")}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="text-center mb-8 sm:mb-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">{t("সদস্যপদ আবেদন", "Membership Application")}</p>
        <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
          {t("আমাদের", "Become part of our")} <span style={{ color: "var(--gold)" }}>{t("পরিবারের অংশ", "family")}</span> {t("হোন", "")}
        </h1>
        <p className="mt-4 text-sm text-muted-foreground max-w-md mx-auto">
          {t("আবেদন জমা দিন, অনুমোদনের পর QR সহ ডিজিটাল সদস্য কার্ড পাবেন।", "Submit your application — receive a digital member card with QR after approval.")}
        </p>
      </div>

      <form onSubmit={onSubmit} className="bg-card border border-border rounded-3xl p-5 sm:p-8 md:p-10 space-y-5" style={{ boxShadow: "var(--shadow-elegant)" }}>
        <div className="flex flex-col items-center gap-3 pb-5 border-b border-border">
          <L>{t("আপনার ছবি *", "Your Photo *")} <span className="text-xs font-normal text-muted-foreground">({t("আইডি কার্ডে ব্যবহৃত হবে", "used on ID card")})</span></L>
          <div className="relative">
            {form.photo_url ? (
              <img src={form.photo_url} alt={t("সদস্যের ছবির প্রিভিউ", "Member photo preview")} className="w-28 h-28 rounded-full object-cover border-4" style={{ borderColor: "var(--gold)" }} />
            ) : (
              <div className="w-28 h-28 rounded-full bg-muted border-2 border-dashed border-border flex flex-col items-center justify-center text-center">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><circle cx="12" cy="13" r="3.5"/></svg>
                <span className="text-[10px] font-semibold text-muted-foreground mt-1">{t("ছবি", "Photo")}</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <label className="cursor-pointer text-xs font-semibold px-3 py-2 rounded-full border border-input bg-background hover:bg-accent/30">
              📷 {t("ক্যামেরা", "Camera")}
              <input type="file" accept="image/*" capture="user" className="hidden" onChange={onPhoto} disabled={uploading} />
            </label>
            <label className="cursor-pointer text-xs font-semibold px-3 py-2 rounded-full border border-input bg-background hover:bg-accent/30">
              🖼️ {t("গ্যালারি", "Gallery")}
              <input type="file" accept="image/*" className="hidden" onChange={onPhoto} disabled={uploading} />
            </label>
            {form.photo_url && (
              <button type="button" onClick={() => setForm((f) => ({ ...f, photo_url: "" }))} className="text-xs text-destructive font-semibold px-3 py-2">{t("মুছুন", "Remove")}</button>
            )}
          </div>
          {uploading && <span className="text-xs text-muted-foreground">{t("আপলোড হচ্ছে...", "Uploading...")}</span>}
        </div>


        <Row><L>{t("পূর্ণ নাম (বাংলা) *", "Full Name (Bangla) *")}</L><input required value={form.name} onChange={upd("name")} className={cls} placeholder={t("যেমন: আব্দুল করিম", "e.g. আব্দুল করিম")} /></Row>
        <Row><L>{t("পূর্ণ নাম (ইংরেজি — বড় হাতের অক্ষরে) *", "Full Name (English — UPPERCASE) *")}</L>
          <input required value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value.toUpperCase() })} className={cls} style={{ textTransform: "uppercase" }} placeholder="e.g. ABDUL KARIM" autoCapitalize="characters" />
        </Row>
        <div className="grid sm:grid-cols-2 gap-4">
          <Row><L>{t("মোবাইল নম্বর *", "Mobile Number *")}</L><input required value={form.phone} onChange={upd("phone")} inputMode="numeric" maxLength={11} className={cls} placeholder="01XXXXXXXXX" /></Row>
          <Row><L>{t("ইমেইল", "Email")}</L><input type="email" value={form.email} onChange={upd("email")} className={cls} placeholder="optional@example.com" /></Row>
        </div>
        <Row><L>{t("জাতীয় পরিচয়পত্র (NID) নম্বর", "National ID (NID) Number")}</L>
          <input value={form.nid} onChange={upd("nid")} inputMode="numeric" maxLength={20} className={cls} placeholder={t("যেমন: ১২৩৪৫৬৭৮৯০", "e.g. 1234567890")} />
        </Row>
        <div className="grid sm:grid-cols-2 gap-4">
          <Row><L>{t("এলাকা *", "Area *")}</L>
            <select value={form.area} onChange={upd("area")} className={cls}>{AREAS.map((a) => <option key={a} value={a}>{label(a)}</option>)}</select>
          </Row>
          <Row><L>{t("সদস্যপদের ধরন", "Membership Type")}</L>
            <select value={form.role} onChange={upd("role")} className={cls}>{ROLES.map((r) => <option key={r} value={r}>{label(r)}</option>)}</select>
          </Row>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Row><L>{t("পেশা *", "Occupation *")}</L>
            <select value={form.occupation} onChange={upd("occupation")} className={cls}>{OCCUPATIONS.map((o) => <option key={o} value={o}>{label(o)}</option>)}</select>
          </Row>
          {form.occupation === "অন্যান্য" && (
            <Row><L>{t("পেশা লিখুন *", "Specify Occupation *")}</L>
              <input value={form.occupationOther} onChange={upd("occupationOther")} className={cls} placeholder={t("আপনার পেশা", "Your occupation")} />
            </Row>
          )}
        </div>
        {form.role === "স্বেচ্ছাসেবক" && (
          <>
            <Row><L>{t("শিক্ষাগত যোগ্যতা", "Education")}</L>
              <input value={form.education} onChange={upd("education")} className={cls} placeholder={t("যেমন: এইচএসসি / স্নাতক", "e.g. HSC / Bachelor's")} />
            </Row>
            <Row><L>{t("পূর্ব অভিজ্ঞতা (যদি থাকে)", "Previous Experience (if any)")}</L>
              <textarea value={form.experience} onChange={upd("experience")} rows={3} className={cls} placeholder={t("অতীতে কোনো সংগঠন/স্বেচ্ছাসেবী কাজের অভিজ্ঞতা থাকলে লিখুন", "Mention any past organisation / volunteer work")} />
            </Row>
          </>
        )}
        <Row><L>{t("কেন সদস্য হতে চান?", "Why do you want to become a member?")}</L>
          <textarea value={form.notes} onChange={upd("notes")} rows={3} className={cls} placeholder={t("সংক্ষেপে লিখুন...", "Write briefly...")} />
        </Row>

        {error && <p className="text-sm text-destructive text-center">{error}</p>}
        <button disabled={loading} className="w-full py-4 rounded-full text-base font-bold disabled:opacity-60" style={{ background: "var(--gradient-gold)", color: "oklch(0.22 0.05 160)", boxShadow: "var(--shadow-gold)" }}>
          {loading ? t("জমা হচ্ছে...", "Submitting...") : t("আবেদন জমা দিন", "Submit Application")}
        </button>
        <p className="text-center text-xs text-muted-foreground">
          {t("আগেই সদস্য?", "Already a member?")} <Link to="/my-membership" className="text-primary font-semibold underline">{t("আমার কার্ড দেখুন", "View my card")}</Link>
        </p>
      </form>
    </div>
  );
}

const cls = "mt-2 w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm";
const Row = ({ children }: { children: React.ReactNode }) => <label className="block">{children}</label>;
const L = ({ children }: { children: React.ReactNode }) => <span className="block text-sm font-semibold">{children}</span>;
