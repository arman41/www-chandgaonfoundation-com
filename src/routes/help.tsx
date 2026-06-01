import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { submitHelpApplication } from "@/lib/help-applications";
import { listActiveProjects, type AidProject } from "@/lib/aid-projects";
import { supabase } from "@/integrations/supabase/client";
import { generateAndUploadReceipt } from "@/lib/application-pdf";
import { useFoundationSettings } from "@/hooks/use-foundation-settings";
import { toast } from "sonner";
import { Download } from "lucide-react";

export const Route = createFileRoute("/help")({
  component: HelpPage,
  head: () => ({
    meta: [
      { title: "সাহায্যের আবেদন | চাঁদগাঁও ফাউন্ডেশন" },
      { name: "description", content: "চাঁদগাঁও ফাউন্ডেশনের চলমান সাহায্য প্রকল্পে আবেদন করুন।" },
    ],
  }),
});

const helpTypes = [
  "আর্থিক সহায়তা",
  "চিকিৎসা সহায়তা",
  "শিক্ষা সহায়তা",
  "খাদ্য সহায়তা",
  "শীতবস্ত্র",
  "দুর্যোগকালীন সহায়তা",
  "অন্যান্য",
];

const MAX_IMAGE = 5 * 1024 * 1024;
const inp = "w-full h-11 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

async function uploadImage(file: File, folder: string): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `applications/${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("foundation-media").upload(path, file, { upsert: false });
  if (error) throw new Error(error.message);
  return supabase.storage.from("foundation-media").getPublicUrl(path).data.publicUrl;
}

function HelpPage() {
  const { settings } = useFoundationSettings();
  const [projects, setProjects] = useState<AidProject[]>([]);
  const [done, setDone] = useState(false);
  const [appId, setAppId] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    project_id: "",
    name: "",
    father_name: "",
    mother_name: "",
    nid: "",
    dob: "",
    phone: "",
    gender: "" as "" | "male" | "female" | "other",
    occupation: "",
    monthly_income: "",
    family_count: "",
    present_address: "",
    permanent_address: "",
    type: helpTypes[0],
    requested_amount: "",
    reason: "",
    financial_condition: "",
    additional_notes: "",
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [nidFront, setNidFront] = useState<File | null>(null);
  const [nidBack, setNidBack] = useState<File | null>(null);

  useEffect(() => { listActiveProjects().then(setProjects); }, []);

  const update = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const validateNid = (v: string): string => {
    const d = v.replace(/[^0-9]/g, "");
    if (!d) return "NID নম্বর আবশ্যক।";
    if (![10, 13, 17].includes(d.length)) return "NID অবশ্যই ১০, ১৩ বা ১৭ সংখ্যা হতে হবে।";
    return "";
  };
  const nidError = form.nid ? validateNid(form.nid) : "";

  const checkFile = (f: File | null, label: string): string => {
    if (!f) return "";
    if (f.size > MAX_IMAGE) return `${label}: ফাইল ৫ MB এর কম হতে হবে।`;
    if (!f.type.startsWith("image/")) return `${label}: শুধু ছবি আপলোড করা যাবে।`;
    return "";
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.reason.trim()) return;
    if (validateNid(form.nid)) return toast.error(validateNid(form.nid));
    const fileErr = checkFile(photo, "ছবি") || checkFile(nidFront, "NID সামনে") || checkFile(nidBack, "NID পিছনে");
    if (fileErr) return toast.error(fileErr);

    setSubmitting(true);
    try {
      const [photo_url, nid_front_url, nid_back_url] = await Promise.all([
        photo ? uploadImage(photo, "photos") : Promise.resolve(null),
        nidFront ? uploadImage(nidFront, "nid-front") : Promise.resolve(null),
        nidBack ? uploadImage(nidBack, "nid-back") : Promise.resolve(null),
      ]);
      const fileCount = [photo_url, nid_front_url, nid_back_url].filter(Boolean).length;

      const saved = await submitHelpApplication({
        name: form.name.trim(),
        phone: form.phone.trim(),
        nid: form.nid.trim(),
        address: form.present_address.trim(),
        type: form.type,
        amount: form.requested_amount,
        reason: form.reason.trim(),
        fileCount,
        project_id: form.project_id || null,
        father_name: form.father_name.trim() || null,
        mother_name: form.mother_name.trim() || null,
        dob: form.dob || null,
        gender: form.gender || null,
        occupation: form.occupation.trim() || null,
        monthly_income: form.monthly_income ? Number(form.monthly_income) : null,
        family_count: form.family_count ? Number(form.family_count) : null,
        present_address: form.present_address.trim() || null,
        permanent_address: form.permanent_address.trim() || null,
        photo_url,
        nid_front_url,
        nid_back_url,
        requested_amount: form.requested_amount ? Number(form.requested_amount) : null,
        financial_condition: form.financial_condition.trim() || null,
        additional_notes: form.additional_notes.trim() || null,
      });
      setAppId(saved.app_code);
      setDone(true);

      // Generate PDF receipt in background
      setGeneratingPdf(true);
      const selectedProject = projects.find((p) => p.id === form.project_id);
      generateAndUploadReceipt({
        app_code: saved.app_code,
        name: form.name.trim(),
        phone: form.phone.trim(),
        nid: form.nid.trim(),
        type: form.type,
        amount: form.requested_amount,
        requested_amount: form.requested_amount ? Number(form.requested_amount) : null,
        reason: form.reason.trim(),
        project_name: selectedProject?.name ?? null,
        father_name: form.father_name.trim() || null,
        mother_name: form.mother_name.trim() || null,
        present_address: form.present_address.trim() || null,
        photo_url,
        foundation_name: settings?.name || "চাঁদগাঁও ফাউন্ডেশন",
        created_at: new Date().toISOString(),
      }).then((url) => {
        setPdfUrl(url);
        if (url) toast.success("রসিদ PDF প্রস্তুত হয়েছে");
      }).finally(() => setGeneratingPdf(false));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "আবেদন জমা দিতে সমস্যা হয়েছে");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <section className="max-w-2xl mx-auto px-6 py-24 text-center">
        <div className="text-6xl mb-6">🤲</div>
        <h1 className="text-3xl font-bold text-primary">আপনার আবেদন গ্রহণ করা হয়েছে</h1>
        <p className="mt-4 text-muted-foreground">আমাদের প্রতিনিধি যাচাই করে শীঘ্রই যোগাযোগ করবেন।</p>
        {appId && (
          <div className="mt-8 mx-auto max-w-md rounded-2xl border border-border bg-card p-6 text-left" style={{ boxShadow: "var(--shadow-elegant)" }}>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">আপনার আবেদন নম্বর</p>
            <p className="mt-2 text-2xl font-bold text-primary tracking-wider select-all">{appId}</p>

            <div className="mt-5 space-y-2">
              {generatingPdf && (
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  রসিদ PDF তৈরি হচ্ছে...
                </div>
              )}
              {pdfUrl && (
                <a href={pdfUrl} target="_blank" rel="noreferrer" download={`${appId}.pdf`} className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 transition">
                  <Download className="h-4 w-4" /> রসিদ PDF ডাউনলোড
                </a>
              )}
            </div>

            <Link to="/track" search={{ id: appId }} className="mt-4 inline-flex items-center justify-center rounded-full px-5 py-2 text-xs font-semibold border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
              এখনই ট্র্যাক করুন →
            </Link>
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="max-w-3xl mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">সাহায্যের আবেদন</p>
        <h1 className="mt-3 text-3xl md:text-4xl font-bold">আপনার প্রয়োজনের কথা জানান</h1>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto">নিচের ফরমটি পূরণ করে আবেদন জমা দিন। সকল তথ্য গোপন রাখা হবে।</p>
      </div>

      <form onSubmit={onSubmit} className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-8" style={{ boxShadow: "var(--shadow-elegant)" }}>
        {projects.length > 0 && (
          <Section title="প্রকল্প নির্বাচন">
            <Field label="চলমান প্রকল্প (ঐচ্ছিক)">
              <select value={form.project_id} onChange={(e) => update("project_id", e.target.value)} className={inp}>
                <option value="">— সাধারণ আবেদন —</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.category})</option>)}
              </select>
              <p className="mt-1 text-xs text-muted-foreground">একই প্রকল্পে একই NID/মোবাইল দিয়ে একবারের বেশি আবেদন করা যাবে না।</p>
            </Field>
          </Section>
        )}

        <Section title="ব্যক্তিগত তথ্য">
          <div className="grid md:grid-cols-2 gap-5">
            <Field label="পূর্ণ নাম *"><input required value={form.name} onChange={(e) => update("name", e.target.value)} maxLength={100} className={inp} /></Field>
            <Field label="মোবাইল নম্বর *"><input required type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} maxLength={20} className={inp} placeholder="01XXXXXXXXX" /></Field>
            <Field label="বাবার নাম"><input value={form.father_name} onChange={(e) => update("father_name", e.target.value)} maxLength={100} className={inp} /></Field>
            <Field label="মায়ের নাম"><input value={form.mother_name} onChange={(e) => update("mother_name", e.target.value)} maxLength={100} className={inp} /></Field>
            <Field label="NID নম্বর *">
              <input required inputMode="numeric" value={form.nid} onChange={(e) => update("nid", e.target.value.replace(/[^0-9]/g, ""))} maxLength={17} className={inp} placeholder="১০ / ১৩ / ১৭ সংখ্যা" />
              {nidError && <p className="mt-1 text-xs text-destructive">{nidError}</p>}
            </Field>
            <Field label="জন্ম তারিখ"><input type="date" value={form.dob} onChange={(e) => update("dob", e.target.value)} className={inp} /></Field>
            <Field label="লিঙ্গ">
              <select value={form.gender} onChange={(e) => update("gender", e.target.value)} className={inp}>
                <option value="">— নির্বাচন —</option>
                <option value="male">পুরুষ</option>
                <option value="female">মহিলা</option>
                <option value="other">অন্যান্য</option>
              </select>
            </Field>
            <Field label="পেশা"><input value={form.occupation} onChange={(e) => update("occupation", e.target.value)} maxLength={100} className={inp} /></Field>
            <Field label="মাসিক আয় (টাকা)"><input type="number" min={0} value={form.monthly_income} onChange={(e) => update("monthly_income", e.target.value)} className={inp} /></Field>
            <Field label="পরিবারের সদস্য সংখ্যা"><input type="number" min={0} max={50} value={form.family_count} onChange={(e) => update("family_count", e.target.value)} className={inp} /></Field>
          </div>
        </Section>

        <Section title="ঠিকানা">
          <Field label="বর্তমান ঠিকানা"><textarea rows={2} value={form.present_address} onChange={(e) => update("present_address", e.target.value)} maxLength={500} className={inp + " h-auto py-2"} /></Field>
          <Field label="স্থায়ী ঠিকানা"><textarea rows={2} value={form.permanent_address} onChange={(e) => update("permanent_address", e.target.value)} maxLength={500} className={inp + " h-auto py-2"} /></Field>
        </Section>

        <Section title="আবেদনকারীর ছবি ও NID">
          <div className="grid md:grid-cols-3 gap-4">
            <ImgPicker label="ছবি" file={photo} onChange={setPhoto} />
            <ImgPicker label="NID সামনে" file={nidFront} onChange={setNidFront} />
            <ImgPicker label="NID পিছনে" file={nidBack} onChange={setNidBack} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">প্রতিটি ছবি সর্বোচ্চ ৫ MB।</p>
        </Section>

        <Section title="সাহায্যের তথ্য">
          <div className="grid md:grid-cols-2 gap-5">
            <Field label="সাহায্যের ধরন *">
              <select value={form.type} onChange={(e) => update("type", e.target.value)} className={inp}>
                {helpTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="প্রয়োজনীয় পরিমাণ (টাকা)"><input type="number" min={0} value={form.requested_amount} onChange={(e) => update("requested_amount", e.target.value)} className={inp} placeholder="যেমন: ৫০০০" /></Field>
          </div>
          <Field label="আবেদনের কারণ *"><textarea required rows={4} value={form.reason} onChange={(e) => update("reason", e.target.value)} maxLength={1000} className={inp + " h-auto py-2"} placeholder="আপনার সমস্যা সংক্ষেপে লিখুন..." /></Field>
          <Field label="বর্তমান আর্থিক অবস্থা"><textarea rows={3} value={form.financial_condition} onChange={(e) => update("financial_condition", e.target.value)} maxLength={1000} className={inp + " h-auto py-2"} /></Field>
          <Field label="অতিরিক্ত নোট"><textarea rows={2} value={form.additional_notes} onChange={(e) => update("additional_notes", e.target.value)} maxLength={1000} className={inp + " h-auto py-2"} /></Field>
        </Section>

        <p className="text-xs text-muted-foreground">* চিহ্নিত ঘরগুলো পূরণ করা আবশ্যক। সকল তথ্য গোপনীয়।</p>

        <button type="submit" disabled={submitting} className="w-full h-12 rounded-full text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.01] disabled:opacity-60" style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-elegant)" }}>
          {submitting ? "জমা হচ্ছে..." : "আবেদন জমা দিন"}
        </button>
      </form>
    </section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border pb-2">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block mb-2 text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}

function ImgPicker({ label, file, onChange }: { label: string; file: File | null; onChange: (f: File | null) => void }) {
  const url = file ? URL.createObjectURL(file) : null;
  return (
    <label className="block cursor-pointer">
      <span className="block mb-2 text-sm font-medium text-foreground">{label}</span>
      <div className="aspect-[3/4] w-full rounded-lg border-2 border-dashed border-input bg-background hover:bg-accent/30 transition-colors grid place-items-center overflow-hidden relative">
        {url ? (
          <img src={url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center px-2">
            <div className="text-2xl mb-1">📷</div>
            <p className="text-xs text-muted-foreground">ছবি নির্বাচন</p>
          </div>
        )}
      </div>
      <input type="file" accept="image/*" className="hidden" onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
      {file && (
        <button type="button" onClick={(e) => { e.preventDefault(); onChange(null); }} className="mt-1 text-xs text-destructive hover:underline">সরান</button>
      )}
    </label>
  );
}
