import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { saveApplication } from "@/lib/help-applications";

export const Route = createFileRoute("/help")({
  component: HelpPage,
  head: () => ({
    meta: [
      { title: "সাহায্যের আবেদন | চাঁদগাঁও ফাউন্ডেশন" },
      { name: "description", content: "আর্থিক, চিকিৎসা, শিক্ষা বা অন্য কোনো সাহায্যের জন্য চাঁদগাঁও ফাউন্ডেশনে আবেদন করুন।" },
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

function HelpPage() {
  const [done, setDone] = useState(false);
  const [appId, setAppId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    type: helpTypes[0],
    amount: "",
    reason: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const MAX_FILES = 5;
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

  const onFiles = (list: FileList | null) => {
    setFileError("");
    if (!list) return;
    const incoming = Array.from(list);
    const combined = [...files, ...incoming];
    if (combined.length > MAX_FILES) {
      setFileError(`সর্বোচ্চ ${MAX_FILES} টি ফাইল আপলোড করা যাবে।`);
      return;
    }
    const tooBig = incoming.find((f) => f.size > MAX_SIZE);
    if (tooBig) {
      setFileError(`প্রতিটি ফাইল সর্বোচ্চ ৫ MB হতে পারবে। (${tooBig.name})`);
      return;
    }
    setFiles(combined);
  };

  const removeFile = (i: number) => setFiles((arr) => arr.filter((_, idx) => idx !== i));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.reason.trim()) return;
    const saved = saveApplication({
      name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      type: form.type,
      amount: form.amount,
      reason: form.reason.trim(),
      fileCount: files.length,
    });
    setAppId(saved.id);
    setDone(true);
  };

  if (done) {
    return (
      <section className="max-w-2xl mx-auto px-6 py-24 text-center">
        <div className="text-6xl mb-6">🤲</div>
        <h1 className="text-3xl font-bold text-primary">আপনার আবেদন গ্রহণ করা হয়েছে</h1>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          আমাদের প্রতিনিধি যাচাই-বাছাই করে শীঘ্রই আপনার সাথে যোগাযোগ করবেন। ধৈর্য ধরার জন্য ধন্যবাদ।
        </p>
        {appId && (
          <div
            className="mt-8 mx-auto max-w-md rounded-2xl border border-border bg-card p-6 text-left"
            style={{ boxShadow: "var(--shadow-elegant)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              আপনার আবেদন নম্বর
            </p>
            <p className="mt-2 text-2xl font-bold text-primary tracking-wider select-all">
              {appId}
            </p>
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
              এই নম্বরটি সংরক্ষণ করুন। যেকোনো সময় <span className="font-semibold text-foreground">"আবেদন ট্র্যাক"</span> পেজ থেকে এই নম্বর দিয়ে আপনার আবেদনের বর্তমান অবস্থা দেখতে পারবেন।
            </p>
            <Link
              to="/track"
              search={{ id: appId }}
              className="mt-4 inline-flex items-center justify-center rounded-full px-5 py-2 text-xs font-semibold border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              এখনই ট্র্যাক করুন →
            </Link>
          </div>
        )}
        <button
          onClick={() => {
            setDone(false);
            setAppId(null);
            setForm({ name: "", phone: "", address: "", type: helpTypes[0], amount: "", reason: "" });
            setFiles([]);
            setFileError("");
          }}
          className="mt-8 inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-semibold text-primary-foreground"
          style={{ background: "var(--gradient-hero)" }}
        >
          আরেকটি আবেদন
        </button>
      </section>
    );
  }

  return (
    <section className="max-w-3xl mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">সাহায্যের আবেদন</p>
        <h1 className="mt-3 text-3xl md:text-4xl font-bold">আপনার প্রয়োজনের কথা জানান</h1>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
          নিচের ফরমটি পূরণ করে আবেদন জমা দিন। সকল তথ্য গোপন রাখা হবে এবং আমাদের প্রতিনিধি যাচাইয়ের পর যোগাযোগ করবেন।
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-5"
        style={{ boxShadow: "var(--shadow-elegant)" }}
      >
        <div className="grid md:grid-cols-2 gap-5">
          <Field label="পূর্ণ নাম *">
            <input
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              maxLength={100}
              className="w-full h-11 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              placeholder="আপনার নাম"
            />
          </Field>
          <Field label="মোবাইল নম্বর *">
            <input
              required
              type="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              maxLength={20}
              className="w-full h-11 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              placeholder="01XXXXXXXXX"
            />
          </Field>
        </div>

        <Field label="ঠিকানা">
          <input
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            maxLength={200}
            className="w-full h-11 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            placeholder="গ্রাম / মহল্লা, থানা, জেলা"
          />
        </Field>

        <div className="grid md:grid-cols-2 gap-5">
          <Field label="সাহায্যের ধরন *">
            <select
              value={form.type}
              onChange={(e) => update("type", e.target.value)}
              className="w-full h-11 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              {helpTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="আনুমানিক প্রয়োজনীয় পরিমাণ (টাকা)">
            <input
              type="number"
              min={0}
              value={form.amount}
              onChange={(e) => update("amount", e.target.value)}
              className="w-full h-11 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              placeholder="যেমন: ৫০০০"
            />
          </Field>
        </div>

        <Field label="সাহায্যের কারণ / পরিস্থিতির বর্ণনা *">
          <textarea
            required
            value={form.reason}
            onChange={(e) => update("reason", e.target.value)}
            maxLength={1000}
            rows={5}
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 resize-none"
            placeholder="আপনার সমস্যা ও প্রয়োজন সংক্ষেপে লিখুন..."
          />
        </Field>

        <Field label="প্রমাণপত্র / ছবি / ডকুমেন্ট (ঐচ্ছিক)">
          <label
            htmlFor="help-files"
            className="flex flex-col items-center justify-center w-full px-4 py-6 rounded-lg border-2 border-dashed border-input bg-background hover:bg-accent/30 cursor-pointer transition-colors text-center"
          >
            <div className="text-3xl mb-2">📎</div>
            <p className="text-sm font-medium text-foreground">ফাইল নির্বাচন করুন বা এখানে ছেড়ে দিন</p>
            <p className="mt-1 text-xs text-muted-foreground">
              ছবি (JPG, PNG) বা PDF — সর্বোচ্চ {MAX_FILES} টি, প্রতিটি ৫ MB পর্যন্ত
            </p>
            <input
              id="help-files"
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              onChange={(e) => {
                onFiles(e.target.files);
                e.target.value = "";
              }}
              className="hidden"
            />
          </label>
          {fileError && (
            <p className="mt-2 text-xs font-medium text-destructive">{fileError}</p>
          )}
          {files.length > 0 && (
            <ul className="mt-3 space-y-2">
              {files.map((f, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg border border-border bg-background"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-lg shrink-0">
                      {f.type.startsWith("image/") ? "🖼️" : "📄"}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm text-foreground truncate">{f.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(f.size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="text-xs font-semibold text-destructive hover:underline shrink-0"
                  >
                    সরান
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Field>

        <p className="text-xs text-muted-foreground">
          * চিহ্নিত ঘরগুলো পূরণ করা আবশ্যক। আপনার দেওয়া সকল তথ্য গোপনীয়ভাবে রাখা হবে।
        </p>

        <button
          type="submit"
          className="w-full h-12 rounded-full text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.01]"
          style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-elegant)" }}
        >
          আবেদন জমা দিন
        </button>
      </form>
    </section>
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