import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { lookupDonation, type DonationRecord } from "@/lib/donations.functions";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/donations")({
  head: () => ({
    meta: [
      { title: "Track Donation — Chandgaon Foundation" },
      { name: "description", content: "Verify your donation status and download your receipt using your TX ID or receipt number." },
      { property: "og:title", content: "Donation Tracker & Receipt Verification" },
      { property: "og:description", content: "Verify your donation status using your TX ID and the last 4 digits of your mobile number." },
      { property: "og:url", content: "https://www.chandgaonfundition.xyz/donations" },
      { name: "twitter:title", content: "Donation Tracker & Receipt Verification" },
      { name: "twitter:description", content: "Verify your donation status using your TX ID and the last 4 digits of your mobile number." },
      { property: "og:image", content: "https://www.chandgaonfundition.xyz/og-image.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Donation Tracker & Receipt Verification" },
      { name: "twitter:image", content: "https://www.chandgaonfundition.xyz/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://www.chandgaonfundition.xyz/donations" }],
  }),
  component: DonationsPage,
  errorComponent: ({ error }) => <div className="py-20 text-center text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="py-20 text-center">Not found</div>,
});

function DonationsPage() {
  const { t } = useLanguage();
  const lookup = useServerFn(lookupDonation);
  const [query, setQuery] = useState("");
  const [last4, setLast4] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DonationRecord | null | undefined>(undefined);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(undefined);
    if (query.trim().length < 4) return setError(t("TX ID বা রসিদ নম্বর দিন", "Enter TX ID or receipt number"));
    if (!/^\d{4}$/.test(last4)) return setError(t("ফোন নম্বরের শেষ ৪ ডিজিট দিন", "Enter the last 4 digits of your mobile"));
    setLoading(true);
    try {
      const res = await lookup({ data: { query: query.trim(), phone_last4: last4 } });
      setResult(res as DonationRecord | null);
    } catch (err: any) {
      setError(err?.message || t("যাচাই করা যায়নি", "Could not verify"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="text-center mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">{t("দান যাচাই", "Donation Lookup")}</p>
        <h1 className="mt-3 text-3xl sm:text-4xl font-bold">{t("আপনার দানের অবস্থা দেখুন", "Check your donation status")}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{t("নিরাপত্তার জন্য TX ID + মোবাইল নম্বরের শেষ ৪ ডিজিট প্রয়োজন।", "For security we need TX ID + last 4 digits of mobile.")}</p>
      </div>

      <form onSubmit={onSubmit} className="bg-card border border-border rounded-3xl p-5 sm:p-8 space-y-4" style={{ boxShadow: "var(--shadow-elegant)" }}>
        <div>
          <label htmlFor="don-txid" className="text-sm font-semibold">{t("TX ID বা রসিদ নম্বর", "TX ID or Receipt Number")}</label>
          <input id="don-txid" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("যেমন: 8FA3K2N9P", "e.g. 8FA3K2N9P")} className="mt-2 w-full px-4 py-3 rounded-xl border border-input bg-background font-mono text-sm" />
        </div>
        <div>
          <label htmlFor="don-last4" className="text-sm font-semibold">{t("মোবাইল নম্বরের শেষ ৪ ডিজিট", "Last 4 digits of mobile")}</label>
          <input id="don-last4" value={last4} onChange={(e) => setLast4(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" maxLength={4} placeholder="####" className="mt-2 w-full px-4 py-3 rounded-xl border border-input bg-background font-mono tracking-widest text-center text-base" />
        </div>
        {error && <p className="text-sm text-destructive text-center">{error}</p>}
        <button disabled={loading} className="w-full py-3 rounded-full bg-primary text-primary-foreground font-semibold disabled:opacity-60">
          {loading ? t("খোঁজা হচ্ছে...", "Searching...") : t("যাচাই করুন", "Verify")}
        </button>
      </form>

      {result === null && (
        <div className="mt-6 p-6 bg-card border border-border rounded-2xl text-center text-muted-foreground">
          {t("কোনো দান পাওয়া যায়নি। TX ID যাচাই করুন।", "No donation found. Please check the TX ID.")}
        </div>
      )}

      {result && <ResultCard r={result} />}

      <div className="mt-8 text-center text-sm">
        {t("নতুন দান করতে চান?", "Want to make a new donation?")} <Link to="/donate" className="text-primary font-semibold underline">{t("নতুন দান করতে এই ফরমটি ব্যবহার করুন", "Use this form to donate")}</Link>
      </div>
    </div>
  );
}

function ResultCard({ r }: { r: DonationRecord }) {
  const { t, lang } = useLanguage();
  const status = r.status;
  const badge = status === "approved" ? "bg-green-100 text-green-800" : status === "rejected" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800";
  const label = status === "approved" ? t("✓ যাচাইকৃত", "✓ Verified") : status === "rejected" ? t("✗ বাতিল", "✗ Rejected") : t("⏳ যাচাই চলছে", "⏳ Pending");
  const locale = lang === "bn" ? "bn-BD" : "en-US";
  return (
    <>
      <div id="receipt" className="mt-6 bg-card border-2 border-border rounded-3xl p-6 sm:p-10" style={{ boxShadow: "var(--shadow-elegant)" }}>
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{t("রসিদ", "Receipt")}</p>
            <h2 className="text-lg sm:text-xl font-bold mt-1">{t("চাঁদগাঁও ফাউন্ডেশন", "Chandgaon Foundation")}</h2>
            <p className="text-xs text-muted-foreground">{t("চাঁদগাঁও, লাকসাম, কুমিল্লা", "Chandgaon, Laksam, Cumilla")}</p>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${badge}`}>{label}</span>
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
          <F label={t("রসিদ নং", "Receipt #")} value={`#${r.id.slice(0, 8).toUpperCase()}`} />
          <F label={t("তারিখ", "Date")} value={new Date(r.donated_at).toLocaleDateString(locale)} />
          <F label={t("দাতা", "Donor")} value={r.donor_name} />
          <F label={t("উদ্দেশ্য", "Purpose")} value={r.purpose || "-"} />
          <F label={t("পদ্ধতি", "Method")} value={r.method} />
          <F label="TX ID" value={r.transaction_id || "-"} mono />
        </dl>
        <div className="mt-6 p-5 rounded-2xl text-center" style={{ background: "var(--gradient-gold)", color: "oklch(0.22 0.05 160)" }}>
          <p className="text-xs uppercase tracking-widest opacity-80">{t("মোট পরিমাণ", "Total Amount")}</p>
          <p className="text-3xl sm:text-4xl font-bold mt-1">৳{Number(r.amount).toLocaleString(locale)}</p>
        </div>
      </div>
      <button onClick={() => window.print()} className="mt-4 w-full py-3 rounded-full bg-primary text-primary-foreground font-semibold print:hidden">
        📄 {t("রসিদ ডাউনলোড / প্রিন্ট", "Download / Print Receipt")}
      </button>
    </>
  );
}

function F({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className={`mt-1 font-semibold break-words ${mono ? "font-mono text-xs" : ""}`}>{value}</dd>
    </div>
  );
}
