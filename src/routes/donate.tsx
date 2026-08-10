import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { submitDonation } from "@/lib/donations.functions";
import { getDonationInfoFn } from "@/lib/foundation.functions";
import { useLanguage } from "@/hooks/use-language";



export const Route = createFileRoute("/donate")({
  head: () => ({
    meta: [
      { title: "Donate — Chandgaon Foundation" },
      { name: "description", content: "Donate securely via bKash, Nagad, Rocket or Bank. Verify with TX ID." },
      { property: "og:title", content: "Donate — Chandgaon Foundation" },
      { property: "og:description", content: "Support Chandgaon Foundation's health, education and relief programs — secure bKash / Nagad / Rocket / bank payments." },
      { property: "og:url", content: "https://chandgaonfoundation.com/donate" },
      { name: "twitter:title", content: "Donate — Chandgaon Foundation" },
      { name: "twitter:description", content: "Support Chandgaon Foundation's health, education and relief programs." },
      { property: "og:image", content: "https://chandgaonfoundation.com/og-image.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Donate — Chandgaon Foundation" },
      { name: "twitter:image", content: "https://chandgaonfoundation.com/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://chandgaonfoundation.com/donate" }],
  }),
  validateSearch: (s: Record<string, unknown>) => ({
    purpose: typeof s.purpose === "string" ? s.purpose : undefined,
    activity: typeof s.activity === "string" ? s.activity : undefined,
  }),
  component: Donate,
  errorComponent: ({ error }) => (
    <div className="max-w-md mx-auto py-32 text-center">
      <p className="text-destructive font-semibold">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => <div className="py-32 text-center">Not found</div>,
});

const AMOUNTS = [50, 100, 500, 1000, 2500, 5000, 10000];

type Method = {
  id: "bkash" | "nagad" | "rocket" | "bank";
  labelBn: string;
  labelEn: string;
  num: string;
  typeBn: string;
  typeEn: string;
  color: string;
  fg: string;
};

const DEFAULT_METHODS: Method[] = [
  { id: "bkash", labelBn: "বিকাশ", labelEn: "bKash", num: "01711479595", typeBn: "পার্সোনাল (Send Money)", typeEn: "Personal (Send Money)", color: "#E2136E", fg: "#fff" },
  { id: "nagad", labelBn: "নগদ", labelEn: "Nagad", num: "01833221019", typeBn: "পার্সোনাল (Send Money)", typeEn: "Personal (Send Money)", color: "#EE1C25", fg: "#fff" },
  { id: "rocket", labelBn: "রকেট", labelEn: "Rocket", num: "01911306059", typeBn: "পার্সোনাল", typeEn: "Personal", color: "#8E2C8B", fg: "#fff" },
  { id: "bank", labelBn: "ইসলামি ব্যাংক", labelEn: "Islami Bank", num: "02676783", typeBn: "Islami Bank Bangladesh — চাঁদগাঁও শাখা", typeEn: "Islami Bank Bangladesh — Chandgaon Branch", color: "#0c2340", fg: "#fff" },
];

const PURPOSES = [
  { bn: "সাধারণ তহবিল", en: "General Fund" },
  { bn: "খাদ্য সহায়তা", en: "Food Aid" },
  { bn: "শিক্ষা বৃত্তি", en: "Education Scholarship" },
  { bn: "চিকিৎসা সহায়তা", en: "Medical Aid" },
  { bn: "দুর্যোগ ত্রাণ", en: "Disaster Relief" },
  { bn: "মসজিদ ও ধর্মীয় কাজ", en: "Mosque & Religious" },
  { bn: "যাকাত / ফিতরা", en: "Zakat / Fitra" },
];

type BankApp = { id: string; name: string; color: string; emoji: string };
const BANK_APPS: BankApp[] = [
  { id: "citytouch", name: "CityTouch", color: "linear-gradient(135deg,#ec4899,#be185d)", emoji: "C" },
  { id: "cellfin", name: "CellFin", color: "linear-gradient(135deg,#0ea5e9,#0369a1)", emoji: "📱" },
  { id: "nexuspay", name: "NexusPay", color: "linear-gradient(135deg,#6366f1,#4338ca)", emoji: "N" },
  { id: "bankasia", name: "Bank Asia", color: "linear-gradient(135deg,#dc2626,#7f1d1d)", emoji: "A" },
  { id: "upay", name: "Upay", color: "linear-gradient(135deg,#f97316,#c2410c)", emoji: "U" },
  { id: "tap", name: "Tap", color: "linear-gradient(135deg,#10b981,#047857)", emoji: "T" },
  { id: "mycash", name: "MyCash", color: "linear-gradient(135deg,#8b5cf6,#5b21b6)", emoji: "M" },
];

function Donate() {
  const { t, lang } = useLanguage();
  const submit = useServerFn(submitDonation);
  const fetchDonationInfo = useServerFn(getDonationInfoFn);

  const [banking, setBanking] = useState<{
    bkash_number: string | null;
    nagad_number: string | null;
    rocket_number: string | null;
    islami_bank_account: string | null;
  } | null>(null);
  useEffect(() => {
    fetchDonationInfo().then(setBanking).catch(() => setBanking(null));
  }, [fetchDonationInfo]);
  const { purpose: purposeParam, activity: activityIdParam } = Route.useSearch();
  const METHODS = useMemo<Method[]>(() => {
    return DEFAULT_METHODS.map((m) => {
      if (m.id === "bkash" && banking?.bkash_number) return { ...m, num: banking.bkash_number };
      if (m.id === "nagad" && banking?.nagad_number) return { ...m, num: banking.nagad_number };
      if (m.id === "rocket" && banking?.rocket_number) return { ...m, num: banking.rocket_number };
      if (m.id === "bank" && banking?.islami_bank_account) return { ...m, num: banking.islami_bank_account };
      return m;
    });
  }, [banking]);

  const purposeOptions = PURPOSES.map((p) => p.bn);
  const initialPurpose = purposeParam && purposeOptions.includes(purposeParam) ? purposeParam : purposeOptions[0];
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
  const methodLabel = lang === "bn" ? method.labelBn : method.labelEn;
  const methodType = lang === "bn" ? method.typeBn : method.typeEn;
  const locale = lang === "bn" ? "bn-BD" : "en-US";
  const currency = lang === "bn" ? "৳" : "৳";

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
    if (final < 10) return setError(t("সর্বনিম্ন ১০ টাকা দান করুন", "Minimum donation is 10 BDT"));
    if (!/^01[3-9]\d{8}$/.test(phone)) return setError(t("সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন", "Enter a valid 11-digit mobile number"));
    if (txid.trim().length < 4) return setError(t("সঠিক TX ID দিন", "Enter a valid TX ID"));
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
          activity_id: activityIdParam ?? null,
        },
      });
      setReceipt(res as any);
    } catch (err: any) {
      setError(err?.message || t("জমা দেওয়া যায়নি", "Could not submit"));
    } finally {
      setLoading(false);
    }
  };

  if (receipt) return <Receipt receipt={receipt} method={method} purpose={purpose} />;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="text-center mb-8 sm:mb-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">{t("অনলাইন ডোনেশন", "Online Donation")}</p>
        <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
          {t("আপনার দান,", "Your donation,")} <span style={{ color: "var(--gold)" }}>{t("একটি পরিবারের আশা", "hope for a family")}</span>
        </h1>
        <div className="mt-6 flex items-center justify-center gap-2 text-xs">
          <StepDot active={step === 1} done={step > 1} n={1} label={t("পরিমাণ", "Amount")} />
          <span className="w-8 h-px bg-border" />
          <StepDot active={step === 2} n={2} label={t("যাচাই", "Verify")} />
        </div>
      </div>

      {step === 1 && (
        <div className="mb-6 rounded-2xl border-2 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
          style={{ borderColor: "var(--gold)", background: "color-mix(in oklch, var(--gold) 8%, transparent)" }}>
          <div className="text-3xl">🕌</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold">{t("যাকাত / ফিতরা দিতে চান?", "Want to give Zakat / Fitra?")}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("নিচের ক্যালকুলেটর দিয়ে সঠিক হিসাব করুন, তারপর “যাকাত / ফিতরা” উদ্দেশ্য নির্বাচন করে দান করুন।", "Use the calculator below to calculate correctly, then select \"Zakat / Fitra\" as purpose and donate.")}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/zakat-calculator"
              className="px-4 py-2 rounded-full text-xs font-bold border border-current"
              style={{ color: "var(--gold)" }}
            >
              {t("ক্যালকুলেটর", "Calculator")}
            </Link>
            <button
              type="button"
              onClick={() => {
                setPurpose("যাকাত / ফিতরা");
                toast.success(t("উদ্দেশ্য নির্বাচন করা হয়েছে: যাকাত / ফিতরা", "Purpose selected: Zakat / Fitra"));
                setTimeout(() => {
                  const el = document.getElementById("don-purpose");
                  el?.scrollIntoView({ behavior: "smooth", block: "center" });
                  (el as HTMLSelectElement | null)?.focus({ preventScroll: true });
                }, 50);
              }}
              className="px-4 py-2 rounded-full text-xs font-bold"
              style={{ background: "var(--gradient-gold)", color: "oklch(0.22 0.05 160)" }}
            >
              {t("যাকাত দিন", "Give Zakat")}
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
              <label htmlFor="don-amount" className="text-sm font-semibold tracking-tight">{t("দানের পরিমাণ", "Donation Amount")}</label>
              <div className="mt-3 grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                {AMOUNTS.map((a) => {
                  const active = amount === a && !custom;
                  return (
                    <button
                      key={a}
                      type="button"
                      onClick={() => { setAmount(a); setCustom(""); }}
                      className={`relative py-3.5 rounded-2xl text-sm font-bold border-2 transition-all duration-200 ${active ? "text-white scale-[1.04] shadow-lg" : "border-border hover:border-primary/40 bg-background"}`}
                      style={active ? {
                        background: "linear-gradient(135deg, oklch(0.32 0.08 160), oklch(0.22 0.06 160))",
                        borderColor: "oklch(0.32 0.08 160)",
                        boxShadow: "0 8px 24px -8px oklch(0.32 0.08 160 / 0.55)",
                      } : undefined}
                    >
                      {currency}{a.toLocaleString(locale)}
                    </button>
                  );
                })}
              </div>
              <input
                id="don-amount"
                inputMode="numeric"
                value={custom}
                onChange={(e) => setCustom(e.target.value.replace(/\D/g, ""))}
                placeholder={t("অথবা পছন্দমত পরিমাণ", "Or enter a custom amount")}
                className="mt-3 w-full px-4 py-3.5 rounded-2xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              />
            </div>

            <div>
              <label htmlFor="don-purpose" className="text-sm font-semibold tracking-tight">{t("দানের উদ্দেশ্য", "Donation Purpose")}</label>
              <select id="don-purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} className="mt-3 w-full px-4 py-3.5 rounded-2xl border border-input bg-background text-sm">
                {PURPOSES.map((p) => <option key={p.bn} value={p.bn}>{lang === "bn" ? p.bn : p.en}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold tracking-tight">{t("পেমেন্ট পদ্ধতি", "Payment Method")}</label>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {METHODS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethodId(m.id)}
                    className={`py-3.5 rounded-2xl text-sm font-bold border-2 transition-all ${methodId === m.id ? "shadow-md scale-[1.03]" : "opacity-70 hover:opacity-100"}`}
                    style={methodId === m.id
                      ? { backgroundColor: m.color, color: m.fg, borderColor: m.color }
                      : { borderColor: "var(--border)" }}
                  >{lang === "bn" ? m.labelBn : m.labelEn}</button>
                ))}
              </div>

            <button
              type="button"
              onClick={() => { setError(null); if (final >= 10) setStep(2); else setError(t("সর্বনিম্ন ১০ টাকা", "Minimum 10 BDT")); }}
              className="group relative w-full py-4 rounded-full text-base font-extrabold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #fde68a 0%, #f59e0b 45%, #b45309 100%)",
                color: "oklch(0.22 0.05 160)",
                boxShadow: "0 12px 32px -10px rgba(245,158,11,0.55), inset 0 1px 0 rgba(255,255,255,0.55)",
              }}
            >
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.55) 50%, transparent 70%)" }} />
              <span className="relative">{t("পরবর্তী ধাপ —", "Next step —")} {currency}{final.toLocaleString(locale)}</span>
            </button>
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
          </>
        )}

        {step === 2 && (
          <>
            <div className="rounded-2xl p-5 border-2" style={{ borderColor: method.color, background: `${method.color}10` }}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wider opacity-70">{t("পেমেন্ট করুন", "Pay via")}</p>
                  <p className="text-2xl font-bold" style={{ color: method.color }}>{methodLabel}</p>
                  <p className="text-xs mt-1 text-muted-foreground">{methodType}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-70">{t("পরিমাণ", "Amount")}</p>
                  <p className="text-2xl font-bold">{currency}{final.toLocaleString(locale)}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 px-4 py-3 rounded-xl bg-background border border-border font-mono text-base tracking-wider select-all">
                  {method.num}
                </div>
                <button type="button" onClick={copyNumber} className="px-4 py-3 rounded-xl text-sm font-semibold text-white" style={{ background: method.color }}>
                  {copied ? t("✓ কপি হয়েছে", "✓ Copied") : t("কপি", "Copy")}
                </button>
              </div>
              <ol className="mt-4 text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>{t("উপরের নম্বরে", "Send")} <strong>{currency}{final.toLocaleString(locale)}</strong> {methodId === "bank" ? t("জমা", "to the account above") : t("Send Money করুন", "Send Money to the number above")}</li>
                <li>{t("পেমেন্টের", "Copy the")} <strong>TX ID</strong>/{t("রেফারেন্স কপি করুন", "reference of the payment")}</li>
                <li>{t("নিচের ফর্মে তথ্য দিয়ে জমা দিন", "Fill in the form below and submit")}</li>
              </ol>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <input required aria-label={t("আপনার নাম", "Your name")} value={name} onChange={(e) => setName(e.target.value)} placeholder={t("আপনার নাম", "Your name")} className="px-4 py-3 rounded-xl border border-input bg-background text-sm" />
              <input required aria-label={t("মোবাইল নম্বর", "Mobile number")} type="tel" inputMode="numeric" maxLength={11} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} placeholder={t("মোবাইল নম্বর (01XXXXXXXXX)", "Mobile (01XXXXXXXXX)")} className="px-4 py-3 rounded-xl border border-input bg-background text-sm" />
            </div>

            <div>
              <label htmlFor="don-txid" className="text-sm font-semibold">{t("ট্রানজেকশন আইডি (TX ID) *", "Transaction ID (TX ID) *")}</label>
              <input
                id="don-txid"
                required value={txid} onChange={(e) => setTxid(e.target.value.trim())}
                minLength={4} maxLength={50}
                placeholder={t("যেমন: 8FA3K2N9P", "e.g. 8FA3K2N9P")}
                className="mt-3 w-full px-4 py-3 rounded-xl border border-input bg-background font-mono text-sm uppercase"
              />
              <p className="mt-2 text-xs text-muted-foreground">{t("পেমেন্ট সম্পন্ন না করে TX ID দেওয়া যাবে না। যাচাই না হওয়া পর্যন্ত অবস্থা", "Do not submit a TX ID without completing payment. Status will remain")} <strong>pending</strong> {t("থাকবে।", "until verified.")}</p>
            </div>

            {error && <p className="text-sm text-destructive text-center">{error}</p>}

            <div className="flex flex-col sm:flex-row gap-3">
              <button type="button" onClick={() => setStep(1)} className="sm:w-1/3 py-3 rounded-full border border-border text-sm font-semibold">{t("পেছনে", "Back")}</button>
              <button type="submit" disabled={loading} className="flex-1 py-4 rounded-full text-base font-bold disabled:opacity-60"
                style={{ background: "var(--gradient-gold)", color: "oklch(0.22 0.05 160)", boxShadow: "var(--shadow-gold)" }}>
                {loading ? t("জমা হচ্ছে...", "Submitting...") : t("দান নিশ্চিত করুন", "Confirm Donation")}
              </button>
            </div>
            <p className="text-center text-xs text-muted-foreground">🔒 {t("SSL এনক্রিপ্টেড। আপনার তথ্য গোপন থাকবে।", "SSL encrypted. Your information stays private.")}</p>
          </>
        )}
      </form>

      <div className="mt-6 text-center text-sm">
        {t("আগের দান যাচাই করতে চান?", "Want to verify a previous donation?")} <Link to="/donations" className="text-primary font-semibold underline">{t("ডোনেশন ট্র্যাক করুন", "Track donation")}</Link>
      </div>

      {/* Sandbox payment simulation modal */}
      {sandboxApp && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => { setSandboxApp(null); setSandboxStatus(null); }}>
          <div className="w-full sm:max-w-sm bg-card rounded-t-3xl sm:rounded-3xl border border-border shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}>
            <div className="p-5 text-white text-center" style={{ background: sandboxApp.color }}>
              <div className="inline-flex w-14 h-14 rounded-2xl bg-white/20 items-center justify-center text-2xl font-black mb-2">{sandboxApp.emoji}</div>
              <p className="text-xs uppercase tracking-widest opacity-90">{t("সিমুলেটেড স্যান্ডবক্স", "Simulated Sandbox")}</p>
              <p className="text-lg font-bold">{sandboxApp.name}</p>
            </div>
            <div className="p-6 text-center">
              <p className="text-xs text-muted-foreground">{t("পরিমাণ", "Amount")}</p>
              <p className="text-3xl font-extrabold mt-1">৳{final.toLocaleString(locale)}</p>
              <div className="mt-6 min-h-[88px] flex flex-col items-center justify-center gap-2">
                {sandboxStatus === "loading" && (
                  <>
                    <div className="w-10 h-10 rounded-full border-4 border-muted border-t-primary animate-spin" />
                    <p className="text-sm font-medium">{t(`${sandboxApp.name} অ্যাপে রিডিরেক্ট হচ্ছে...`, `Redirecting to ${sandboxApp.name}...`)}</p>
                  </>
                )}
                {sandboxStatus === "success" && (
                  <>
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl">✓</div>
                    <p className="text-sm font-bold text-emerald-700">{t("পেমেন্ট সফল (Sandbox)", "Payment Successful (Sandbox)")}</p>
                    <p className="text-[11px] text-muted-foreground font-mono">TX: SBX{Date.now().toString(36).toUpperCase().slice(-8)}</p>
                  </>
                )}
                {sandboxStatus === "failed" && (
                  <>
                    <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-2xl">✕</div>
                    <p className="text-sm font-bold text-rose-700">{t("পেমেন্ট ব্যর্থ — আবার চেষ্টা করুন", "Payment Failed — Try Again")}</p>
                  </>
                )}
              </div>
              <button
                onClick={() => { setSandboxApp(null); setSandboxStatus(null); }}
                className="mt-6 w-full py-3 rounded-full bg-foreground text-background text-sm font-bold"
              >
                {t("বন্ধ করুন", "Close")}
              </button>
              <p className="mt-3 text-[10px] text-muted-foreground">{t("এটি একটি ডেমো রাউটিং — কোনো রিয়েল পেমেন্ট হয়নি।", "This is demo routing — no real payment was made.")}</p>
            </div>
          </div>
        </div>
      )}
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
  const { t, lang } = useLanguage();
  const locale = lang === "bn" ? "bn-BD" : "en-US";
  const shortId = receipt.id.slice(0, 8).toUpperCase();
  const purposeEn = PURPOSES.find((p) => p.bn === purpose)?.en ?? purpose;
  const purposeLabel = lang === "bn" ? purpose : purposeEn;
  const methodLabel = lang === "bn" ? method.labelBn : method.labelEn;
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="text-center mb-6 print:hidden">
        <div className="text-5xl mb-3">🤲</div>
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">{t("দান গ্রহণ করা হয়েছে", "Donation Received")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("আপনার দানের জন্য অসংখ্য ধন্যবাদ। যাচাইয়ের পর অবস্থা আপডেট হবে।", "Thank you for your donation. Status will update once verified.")}</p>
      </div>

      <div id="receipt" className="bg-card rounded-3xl border-2 border-border p-6 sm:p-10 print:border-black" style={{ boxShadow: "var(--shadow-elegant)" }}>
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{t("রসিদ / Receipt", "Receipt")}</p>
            <h2 className="text-lg sm:text-xl font-bold mt-1">{t("চাঁদগাঁও ফাউন্ডেশন", "Chandgaon Foundation")}</h2>
            <p className="text-xs text-muted-foreground">{t("চাঁদগাঁও, লাকসাম, কুমিল্লা, বাংলাদেশ", "Chandgaon, Laksam, Cumilla, Bangladesh")}</p>
          </div>
          <div className="text-right">
            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${receipt.status === "approved" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
              {receipt.status === "approved" ? t("✓ যাচাইকৃত", "✓ Verified") : t("⏳ যাচাই চলছে", "⏳ Pending")}
            </span>
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
          <Field label={t("রসিদ নং", "Receipt #")} value={`#${shortId}`} />
          <Field label={t("তারিখ", "Date")} value={new Date(receipt.donated_at).toLocaleDateString(locale)} />
          <Field label={t("দাতা", "Donor")} value={receipt.donor_name} />
          <Field label={t("উদ্দেশ্য", "Purpose")} value={purposeLabel} />
          <Field label={t("পদ্ধতি", "Method")} value={methodLabel} />
          <Field label="TX ID" value={receipt.transaction_id || "-"} mono />
        </dl>

        <div className="mt-6 p-5 rounded-2xl text-center" style={{ background: "var(--gradient-gold)", color: "oklch(0.22 0.05 160)" }}>
          <p className="text-xs uppercase tracking-widest opacity-80">{t("মোট পরিমাণ", "Total Amount")}</p>
          <p className="text-3xl sm:text-4xl font-bold mt-1">৳{receipt.amount.toLocaleString(locale)}</p>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          {t("এই রসিদটি সংরক্ষণ করুন। যেকোনো অভিযোগের জন্য রসিদ নম্বর উল্লেখ করুন।", "Keep this receipt. Mention the receipt number for any enquiry.")}
        </p>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3 print:hidden">
        <button onClick={() => window.print()} className="flex-1 py-3 rounded-full bg-primary text-primary-foreground font-semibold">📄 {t("রসিদ ডাউনলোড / প্রিন্ট", "Download / Print Receipt")}</button>
        <Link to="/donations" className="flex-1 py-3 rounded-full border border-border text-center font-semibold">{t("দান ট্র্যাক করুন", "Track Donation")}</Link>
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
