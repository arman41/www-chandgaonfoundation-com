import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { lookupDonation, type DonationRecord } from "@/lib/donations.functions";

export const Route = createFileRoute("/donations")({
  head: () => ({
    meta: [
      { title: "ডোনেশন ট্র্যাক — চাঁদগাঁও ফাউন্ডেশন" },
      { name: "description", content: "TX ID বা রসিদ নম্বর দিয়ে আপনার দানের অবস্থা যাচাই করুন এবং রসিদ ডাউনলোড করুন।" },
    ],
  }),
  component: DonationsPage,
  errorComponent: ({ error }) => <div className="py-20 text-center text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="py-20 text-center">পাওয়া যায়নি</div>,
});

function DonationsPage() {
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
    if (query.trim().length < 4) return setError("TX ID বা রসিদ নম্বর দিন");
    if (!/^\d{4}$/.test(last4)) return setError("ফোন নম্বরের শেষ ৪ ডিজিট দিন");
    setLoading(true);
    try {
      const res = await lookup({ data: { query: query.trim(), phone_last4: last4 } });
      setResult(res as DonationRecord | null);
    } catch (err: any) {
      setError(err?.message || "যাচাই করা যায়নি");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="text-center mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">দান যাচাই</p>
        <h1 className="mt-3 text-3xl sm:text-4xl font-bold">আপনার দানের অবস্থা দেখুন</h1>
        <p className="mt-3 text-sm text-muted-foreground">নিরাপত্তার জন্য TX ID + মোবাইল নম্বরের শেষ ৪ ডিজিট প্রয়োজন।</p>
      </div>

      <form onSubmit={onSubmit} className="bg-card border border-border rounded-3xl p-5 sm:p-8 space-y-4" style={{ boxShadow: "var(--shadow-elegant)" }}>
        <div>
          <label className="text-sm font-semibold">TX ID বা রসিদ নম্বর</label>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="যেমন: 8FA3K2N9P" className="mt-2 w-full px-4 py-3 rounded-xl border border-input bg-background font-mono text-sm" />
        </div>
        <div>
          <label className="text-sm font-semibold">মোবাইল নম্বরের শেষ ৪ ডিজিট</label>
          <input value={last4} onChange={(e) => setLast4(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" maxLength={4} placeholder="####" className="mt-2 w-full px-4 py-3 rounded-xl border border-input bg-background font-mono tracking-widest text-center text-base" />
        </div>
        {error && <p className="text-sm text-destructive text-center">{error}</p>}
        <button disabled={loading} className="w-full py-3 rounded-full bg-primary text-primary-foreground font-semibold disabled:opacity-60">
          {loading ? "খোঁজা হচ্ছে..." : "যাচাই করুন"}
        </button>
      </form>

      {result === null && (
        <div className="mt-6 p-6 bg-card border border-border rounded-2xl text-center text-muted-foreground">
          কোনো দান পাওয়া যায়নি। TX ID যাচাই করুন।
        </div>
      )}

      {result && <ResultCard r={result} />}

      <div className="mt-8 text-center text-sm">
        নতুন দান করতে চান? <Link to="/donate" className="text-primary font-semibold underline">এখানে ক্লিক করুন</Link>
      </div>
    </div>
  );
}

function ResultCard({ r }: { r: DonationRecord }) {
  const status = r.status;
  const badge = status === "approved" ? "bg-green-100 text-green-800" : status === "rejected" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800";
  const label = status === "approved" ? "✓ যাচাইকৃত" : status === "rejected" ? "✗ বাতিল" : "⏳ যাচাই চলছে";
  return (
    <>
      <div id="receipt" className="mt-6 bg-card border-2 border-border rounded-3xl p-6 sm:p-10" style={{ boxShadow: "var(--shadow-elegant)" }}>
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">রসিদ</p>
            <h2 className="text-lg sm:text-xl font-bold mt-1">চাঁদগাঁও ফাউন্ডেশন</h2>
            <p className="text-xs text-muted-foreground">চাঁদগাঁও, লাকসাম, কুমিল্লা</p>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${badge}`}>{label}</span>
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
          <F label="রসিদ নং" value={`#${r.id.slice(0, 8).toUpperCase()}`} />
          <F label="তারিখ" value={new Date(r.donated_at).toLocaleDateString("bn-BD")} />
          <F label="দাতা" value={r.donor_name} />
          <F label="উদ্দেশ্য" value={r.purpose || "-"} />
          <F label="পদ্ধতি" value={r.method} />
          <F label="TX ID" value={r.transaction_id || "-"} mono />
        </dl>
        <div className="mt-6 p-5 rounded-2xl text-center" style={{ background: "var(--gradient-gold)", color: "oklch(0.22 0.05 160)" }}>
          <p className="text-xs uppercase tracking-widest opacity-80">মোট পরিমাণ</p>
          <p className="text-3xl sm:text-4xl font-bold mt-1">৳{Number(r.amount).toLocaleString("bn-BD")}</p>
        </div>
      </div>
      <button onClick={() => window.print()} className="mt-4 w-full py-3 rounded-full bg-primary text-primary-foreground font-semibold print:hidden">
        📄 রসিদ ডাউনলোড / প্রিন্ট
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
