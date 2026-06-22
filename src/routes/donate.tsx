import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { submitDonation } from "@/lib/donations.functions";
import { useFoundationSettings } from "@/hooks/use-foundation-settings";

export const Route = createFileRoute("/donate")({
  head: () => ({
    meta: [
      { title: "দান করুন — চাঁদগাঁও ফাউন্ডেশন" },
      { name: "description", content: "বিকাশ, নগদ, রকেট বা ব্যাংকের মাধ্যমে নিরাপদে দান করুন। TX ID দিয়ে যাচাই করুন।" },
      { property: "og:title", content: "দান করুন — চাঁদগাঁও ফাউন্ডেশন" },
      { property: "og:description", content: "চাঁদগাঁও ফাউন্ডেশনের স্বাস্থ্য, শিক্ষা ও ত্রাণ কর্মসূচিতে দান করে চাঁদগাঁও কমিউনিটির পাশে দাঁড়ান—বিকাশ, নগদ, রকেট বা ব্যাংকে নিরাপদ পেমেন্ট।" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({
    purpose: typeof s.purpose === "string" ? s.purpose : undefined,
  }),
  component: Donate,
  errorComponent: ({ error }) => (
    <div className="max-w-md mx-auto py-32 text-center">
      <p className="text-destructive font-semibold">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => <div className="py-32 text-center">পাওয়া যায়নি</div>,
});

const AMOUNTS = [500, 1000, 2500, 5000, 10000];

type Method = {
  id: "bkash" | "nagad" | "rocket" | "bank";
  label: string;
  num: string;
  type: string;
  color: string;
  fg: string;
};

const DEFAULT_METHODS: Method[] = [
  { id: "bkash", label: "বিকাশ", num: "01953851695", type: "পার্সোনাল (Send Money)", color: "#E2136E", fg: "#fff" },
  { id: "nagad", label: "নগদ", num: "01953851695", type: "পার্সোনাল (Send Money)", color: "#EE1C25", fg: "#fff" },
  { id: "rocket", label: "রকেট", num: "01953851695", type: "পার্সোনাল", color: "#8E2C8B", fg: "#fff" },
  { id: "bank", label: "ইসলামি ব্যাংক", num: "02676783", type: "Islami Bank Bangladesh — চাঁদগাঁও শাখা", color: "#0c2340", fg: "#fff" },
];

const PURPOSES = [
  "সাধারণ তহবিল",
  "খাদ্য সহায়তা",
  "শিক্ষা বৃত্তি",
  "চিকিৎসা সহায়তা",
  "দুর্যোগ ত্রাণ",
  "মসজিদ ও ধর্মীয় কাজ",
  "যাকাত / ফিতরা",
];

function Donate() {
  const submit = useServerFn(submitDonation);
  const { settings } = useFoundationSettings();
  const { purpose: purposeParam } = Route.useSearch();
  const METHODS = useMemo<Method[]>(() => {
    return DEFAULT_METHODS.map((m) => {
      if (m.id === "bkash" && settings?.bkash_number) return { ...m, num: settings.bkash_number };
      if (m.id === "nagad" && settings?.nagad_number) return { ...m, num: settings.nagad_number };
      if (m.id === "rocket" && settings?.rocket_number) return { ...m, num: settings.rocket_number };
      if (m.id === "bank" && settings?.islami_bank_account) return { ...m, num: settings.islami_bank_account };
      return m;
    });
  }, [settings]);

  const initialPurpose = purposeParam && PURPOSES.includes(purposeParam) ? purposeParam : PURPOSES[0];
  const [step, setStep] = useState<1 | 2>(1);
  const [amount, setAmount] = useState(1000);
  const [custom, setCustom] = useState("");
  const [purpose, setPurpose] = useState(initialPurpose);
  const [methodId, setMethodId] = useState<Method["id"]>("bkash");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [txid, setTxid] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<null | {
    id: string;
    transaction_id: string | null;
    amount: number;
    donor_name: string;
    donated_at: string;
    status: string;
  }>(null);

  const final = useMemo(() => (custom ? Number(custom) || 0 : amount), [custom, amount]);
  const method = METHODS.find((m) => m.id === methodId)!;

  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText(method.num);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (final < 10) return setError("সর্বনিম্ন ১০ টাকা দান করুন");
    if (!/^01[3-9]\d{8}$/.test(phone)) return setError("সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন");
    if (txid.trim().length < 4) return setError("সঠিক TX ID দিন");
    setLoading(true);
    try {
      const res = await submit({
        data: {
          donor_name: name.trim(),
          donor_phone: phone.trim(),
          amount: final,
          method: methodId,
          purpose,
          transaction_id: txid.trim(),
        },
      });
      setReceipt(res as any);
    } catch (err: any) {
      setError(err?.message || "জমা দেওয়া যায়নি");
    } finally {
      setLoading(false);
    }
  };

  if (receipt) return <Receipt receipt={receipt} method={method} purpose={purpose} />;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="text-center mb-8 sm:mb-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">অনলাইন ডোনেশন</p>
        <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
          আপনার দান, <span style={{ color: "var(--gold)" }}>একটি পরিবারের আশা</span>
        </h1>
        <div className="mt-6 flex items-center justify-center gap-2 text-xs">
          <StepDot active={step === 1} done={step > 1} n={1} label="পরিমাণ" />
          <span className="w-8 h-px bg-border" />
          <StepDot active={step === 2} n={2} label="যাচাই" />
        </div>
      </div>

      {step === 1 && (
        <div className="mb-6 rounded-2xl border-2 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
          style={{ borderColor: "var(--gold)", background: "color-mix(in oklch, var(--gold) 8%, transparent)" }}>
          <div className="text-3xl">🕌</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold">যাকাত / ফিতরা দিতে চান?</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              নিচের ক্যালকুলেটর দিয়ে সঠিক হিসাব করুন, তারপর “যাকাত / ফিতরা” উদ্দেশ্য নির্বাচন করে দান করুন।
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/zakat-calculator"
              className="px-4 py-2 rounded-full text-xs font-bold border border-current"
              style={{ color: "var(--gold)" }}
            >
              ক্যালকুলেটর
            </Link>
            <button
              type="button"
              onClick={() => setPurpose("যাকাত / ফিতরা")}
              className="px-4 py-2 rounded-full text-xs font-bold text-white"
              style={{ background: "var(--gradient-gold)", color: "oklch(0.22 0.05 160)" }}
            >
              যাকাত দিন
            </button>
          </div>
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className="bg-card rounded-3xl p-5 sm:p-8 md:p-10 border border-border space-y-7"
        style={{ boxShadow: "var(--shadow-elegant)" }}
      >
        {step === 1 && (
          <>
            <div>
              <label htmlFor="don-amount" className="text-sm font-semibold">দানের পরিমাণ</label>
              <div className="mt-3 grid grid-cols-3 sm:grid-cols-5 gap-2">
                {AMOUNTS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => { setAmount(a); setCustom(""); }}
                    className={`py-3 rounded-xl text-sm font-semibold border transition-all ${amount === a && !custom ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/40"}`}
                  >৳{a.toLocaleString("bn-BD")}</button>
                ))}
              </div>
              <input
                id="don-amount"
                inputMode="numeric"
                value={custom}
                onChange={(e) => setCustom(e.target.value.replace(/\D/g, ""))}
                placeholder="অথবা পছন্দমত পরিমাণ"
                className="mt-3 w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              />
            </div>

            <div>
              <label htmlFor="don-purpose" className="text-sm font-semibold">দানের উদ্দেশ্য</label>
              <select id="don-purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} className="mt-3 w-full px-4 py-3 rounded-xl border border-input bg-background text-sm">
                {PURPOSES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold">পেমেন্ট পদ্ধতি</label>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                {METHODS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethodId(m.id)}
                    className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${methodId === m.id ? "shadow-md scale-[1.02]" : "opacity-70"}`}
                    style={methodId === m.id
                      ? { backgroundColor: m.color, color: m.fg, borderColor: m.color }
                      : { borderColor: "var(--border)" }}
                  >{m.label}</button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => { setError(null); if (final >= 10) setStep(2); else setError("সর্বনিম্ন ১০ টাকা"); }}
              className="w-full py-4 rounded-full text-base font-bold transition-transform hover:scale-[1.02]"
              style={{ background: "var(--gradient-gold)", color: "oklch(0.22 0.05 160)", boxShadow: "var(--shadow-gold)" }}
            >
              পরবর্তী ধাপ — ৳{final.toLocaleString("bn-BD")}
            </button>
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
          </>
        )}

        {step === 2 && (
          <>
            <div className="rounded-2xl p-5 border-2" style={{ borderColor: method.color, background: `${method.color}10` }}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wider opacity-70">পেমেন্ট করুন</p>
                  <p className="text-2xl font-bold" style={{ color: method.color }}>{method.label}</p>
                  <p className="text-xs mt-1 text-muted-foreground">{method.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-70">পরিমাণ</p>
                  <p className="text-2xl font-bold">৳{final.toLocaleString("bn-BD")}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 px-4 py-3 rounded-xl bg-background border border-border font-mono text-base tracking-wider select-all">
                  {method.num}
                </div>
                <button type="button" onClick={copyNumber} className="px-4 py-3 rounded-xl text-sm font-semibold text-white" style={{ background: method.color }}>
                  {copied ? "✓ কপি হয়েছে" : "কপি"}
                </button>
              </div>
              <ol className="mt-4 text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>উপরের নম্বরে <strong>৳{final.toLocaleString("bn-BD")}</strong> {methodId === "bank" ? "জমা" : "Send Money"} করুন</li>
                <li>পেমেন্টের <strong>TX ID</strong>/রেফারেন্স কপি করুন</li>
                <li>নিচের ফর্মে তথ্য দিয়ে জমা দিন</li>
              </ol>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <input required aria-label="আপনার নাম" value={name} onChange={(e) => setName(e.target.value)} placeholder="আপনার নাম" className="px-4 py-3 rounded-xl border border-input bg-background text-sm" />
              <input required aria-label="মোবাইল নম্বর" type="tel" inputMode="numeric" maxLength={11} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} placeholder="মোবাইল নম্বর (01XXXXXXXXX)" className="px-4 py-3 rounded-xl border border-input bg-background text-sm" />
            </div>

            <div>
              <label htmlFor="don-txid" className="text-sm font-semibold">ট্রানজেকশন আইডি (TX ID) *</label>
              <input
                id="don-txid"
                required value={txid} onChange={(e) => setTxid(e.target.value.trim())}
                minLength={4} maxLength={50}
                placeholder="যেমন: 8FA3K2N9P"
                className="mt-3 w-full px-4 py-3 rounded-xl border border-input bg-background font-mono text-sm uppercase"
              />
              <p className="mt-2 text-xs text-muted-foreground">পেমেন্ট সম্পন্ন না করে TX ID দেওয়া যাবে না। যাচাই না হওয়া পর্যন্ত অবস্থা <strong>pending</strong> থাকবে।</p>
            </div>

            {error && <p className="text-sm text-destructive text-center">{error}</p>}

            <div className="flex flex-col sm:flex-row gap-3">
              <button type="button" onClick={() => setStep(1)} className="sm:w-1/3 py-3 rounded-full border border-border text-sm font-semibold">পেছনে</button>
              <button type="submit" disabled={loading} className="flex-1 py-4 rounded-full text-base font-bold disabled:opacity-60"
                style={{ background: "var(--gradient-gold)", color: "oklch(0.22 0.05 160)", boxShadow: "var(--shadow-gold)" }}>
                {loading ? "জমা হচ্ছে..." : "দান নিশ্চিত করুন"}
              </button>
            </div>
            <p className="text-center text-xs text-muted-foreground">🔒 SSL এনক্রিপ্টেড। আপনার তথ্য গোপন থাকবে।</p>
          </>
        )}
      </form>

      <div className="mt-6 text-center text-sm">
        আগের দান যাচাই করতে চান? <Link to="/donations" className="text-primary font-semibold underline">ডোনেশন ট্র্যাক করুন</Link>
      </div>
    </div>
  );
}

function StepDot({ n, label, active, done }: { n: number; label: string; active?: boolean; done?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${active ? "bg-primary text-primary-foreground" : done ? "bg-secondary text-foreground" : "bg-muted text-muted-foreground"}`}>{done ? "✓" : n}</span>
      <span className={`text-xs font-medium ${active ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
    </div>
  );
}

function Receipt({ receipt, method, purpose }: {
  receipt: { id: string; transaction_id: string | null; amount: number; donor_name: string; donated_at: string; status: string };
  method: Method;
  purpose: string;
}) {
  const shortId = receipt.id.slice(0, 8).toUpperCase();
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="text-center mb-6 print:hidden">
        <div className="text-5xl mb-3">🤲</div>
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">দান গ্রহণ করা হয়েছে</h1>
        <p className="mt-2 text-sm text-muted-foreground">আপনার দানের জন্য অসংখ্য ধন্যবাদ। যাচাইয়ের পর অবস্থা আপডেট হবে।</p>
      </div>

      <div id="receipt" className="bg-card rounded-3xl border-2 border-border p-6 sm:p-10 print:border-black" style={{ boxShadow: "var(--shadow-elegant)" }}>
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">রসিদ / Receipt</p>
            <h2 className="text-lg sm:text-xl font-bold mt-1">চাঁদগাঁও ফাউন্ডেশন</h2>
            <p className="text-xs text-muted-foreground">চাঁদগাঁও, লাকসাম, কুমিল্লা, বাংলাদেশ</p>
          </div>
          <div className="text-right">
            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${receipt.status === "approved" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
              {receipt.status === "approved" ? "✓ যাচাইকৃত" : "⏳ যাচাই চলছে"}
            </span>
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
          <Field label="রসিদ নং" value={`#${shortId}`} />
          <Field label="তারিখ" value={new Date(receipt.donated_at).toLocaleDateString("bn-BD")} />
          <Field label="দাতা" value={receipt.donor_name} />
          <Field label="উদ্দেশ্য" value={purpose} />
          <Field label="পদ্ধতি" value={method.label} />
          <Field label="TX ID" value={receipt.transaction_id || "-"} mono />
        </dl>

        <div className="mt-6 p-5 rounded-2xl text-center" style={{ background: "var(--gradient-gold)", color: "oklch(0.22 0.05 160)" }}>
          <p className="text-xs uppercase tracking-widest opacity-80">মোট পরিমাণ</p>
          <p className="text-3xl sm:text-4xl font-bold mt-1">৳{receipt.amount.toLocaleString("bn-BD")}</p>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          এই রসিদটি সংরক্ষণ করুন। যেকোনো অভিযোগের জন্য রসিদ নম্বর উল্লেখ করুন।
        </p>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3 print:hidden">
        <button onClick={() => window.print()} className="flex-1 py-3 rounded-full bg-primary text-primary-foreground font-semibold">📄 রসিদ ডাউনলোড / প্রিন্ট</button>
        <Link to="/donations" className="flex-1 py-3 rounded-full border border-border text-center font-semibold">দান ট্র্যাক করুন</Link>
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className={`mt-1 font-semibold ${mono ? "font-mono text-xs" : ""}`}>{value}</dd>
    </div>
  );
}
