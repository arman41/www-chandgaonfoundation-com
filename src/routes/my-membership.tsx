import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { lookupMyMembership, type MemberPrivate } from "@/lib/members.functions";
import { QRCanvas } from "@/components/QRCanvas";

export const Route = createFileRoute("/my-membership")({
  head: () => ({
    meta: [
      { title: "আমার সদস্য কার্ড — চাঁদগাঁও ফাউন্ডেশন" },
      { name: "description", content: "সদস্য নম্বর ও মোবাইলের শেষ ৪ ডিজিট দিয়ে আপনার ডিজিটাল সদস্য কার্ড দেখুন।" },
    ],
  }),
  component: Page,
  errorComponent: ({ error }) => <div className="py-20 text-center text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="py-20 text-center">পাওয়া যায়নি</div>,
});

function Page() {
  const navigate = useNavigate();
  const lookup = useServerFn(lookupMyMembership);
  const [code, setCode] = useState("");
  const [last4, setLast4] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [member, setMember] = useState<MemberPrivate | null | undefined>(undefined);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMember(undefined);
    if (code.trim().length < 4) return setError("সদস্য নম্বর দিন (যেমন CGF-001234)");
    if (!/^\d{4}$/.test(last4)) return setError("ফোন নম্বরের শেষ ৪ ডিজিট দিন");
    setLoading(true);
    try {
      const r = await lookup({ data: { code: code.trim(), phone_last4: last4 } });
      setMember(r as MemberPrivate | null);
    } catch (err: any) {
      setError(err?.message || "যাচাই করা যায়নি");
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="text-center mb-8 print:hidden">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">আমার সদস্যপদ</p>
        <h1 className="mt-3 text-3xl sm:text-4xl font-bold">ডিজিটাল সদস্য কার্ড</h1>
      </div>

      {!member && (
        <form onSubmit={onSubmit} className="bg-card border border-border rounded-3xl p-5 sm:p-8 space-y-4 print:hidden" style={{ boxShadow: "var(--shadow-elegant)" }}>
          <div>
            <label className="text-sm font-semibold">সদস্য নম্বর</label>
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="CGF-001234" className="mt-2 w-full px-4 py-3 rounded-xl border border-input bg-background font-mono tracking-wider text-sm" />
          </div>
          <div>
            <label className="text-sm font-semibold">মোবাইল নম্বরের শেষ ৪ ডিজিট</label>
            <input value={last4} onChange={(e) => setLast4(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" maxLength={4} placeholder="####" className="mt-2 w-full px-4 py-3 rounded-xl border border-input bg-background font-mono tracking-widest text-center text-base" />
          </div>
          {error && <p className="text-sm text-destructive text-center">{error}</p>}
          <button disabled={loading} className="w-full py-3 rounded-full bg-primary text-primary-foreground font-semibold disabled:opacity-60">{loading ? "খোঁজা হচ্ছে..." : "কার্ড দেখুন"}</button>
          <p className="text-center text-xs text-muted-foreground">
            নতুন? <Link to="/membership" className="text-primary font-semibold underline">আবেদন করুন</Link>
          </p>
        </form>
      )}

      {member === null && (
        <div className="mt-6 p-6 bg-card border border-border rounded-2xl text-center text-muted-foreground">
          কোনো সদস্য পাওয়া যায়নি। আপনার আবেদন এখনো অনুমোদিত নাও হতে পারে।
        </div>
      )}

      {member && <MemberCard m={member} onReset={() => { setMember(undefined); setCode(""); setLast4(""); navigate({ to: "/my-membership" }); }} />}
    </div>
  );
}

function MemberCard({ m, onReset }: { m: MemberPrivate; onReset: () => void }) {
  const verifyUrl = typeof window !== "undefined" ? `${window.location.origin}/m/${m.member_code}` : `/m/${m.member_code}`;
  const initial = m.name?.charAt(0) || "?";

  return (
    <>
      <div id="receipt" className="relative mx-auto max-w-md rounded-3xl overflow-hidden border-2 border-border bg-card" style={{ boxShadow: "var(--shadow-elegant)" }}>
        <div className="relative p-5 text-white overflow-hidden" style={{ background: "linear-gradient(120deg, #064e3b 0%, #047857 35%, #0d9488 65%, #0891b2 100%)" }}>
          <div aria-hidden className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-40 blur-2xl" style={{ background: "radial-gradient(circle, #fde68a, transparent 70%)" }} />
          <div aria-hidden className="absolute -bottom-12 -left-8 w-44 h-44 rounded-full opacity-30 blur-2xl" style={{ background: "radial-gradient(circle, #f472b6, transparent 70%)" }} />
          <div aria-hidden className="absolute inset-x-0 top-0 h-1.5" style={{ background: "linear-gradient(90deg,#ef4444,#f59e0b,#10b981,#0ea5e9,#8b5cf6)" }} />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest opacity-90">Membership Card</p>
              <h2 className="font-bold text-lg leading-tight mt-1">চাঁদগাঁও ফাউন্ডেশন</h2>
              <p className="text-[10px] opacity-80">প্রবাসী ও যুবসমাজ কল্যান</p>
            </div>
            <span className="text-2xl drop-shadow-lg">🌿</span>
          </div>
        </div>


        <div className="p-5 flex gap-4 items-center border-b border-border">
          {m.photo_url ? (
            <img src={m.photo_url} alt={m.name} className="w-20 h-20 rounded-full object-cover border-2" style={{ borderColor: "var(--gold)" }} />
          ) : (
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold border-2" style={{ background: "var(--secondary)", borderColor: "var(--gold)" }}>{initial}</div>
          )}
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{m.role || "সদস্য"}</p>
            <h3 className="text-xl font-bold truncate">{m.name}</h3>
            <p className="text-xs text-muted-foreground">{m.area}</p>
          </div>
        </div>

        <div className="p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">সদস্য নম্বর</p>
            <p className="font-mono text-lg font-bold" style={{ color: "var(--gold)" }}>{m.member_code}</p>
            <p className="text-[10px] mt-2 uppercase tracking-widest text-muted-foreground">যোগদান</p>
            <p className="text-sm font-semibold">{m.join_date ? new Date(m.join_date).toLocaleDateString("bn-BD") : "-"}</p>
            <span className={`mt-2 inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold ${m.status === "approved" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
              {m.status === "approved" ? "✓ সক্রিয়" : "⏳ অপেক্ষমাণ"}
            </span>
          </div>
          <div className="text-center">
            <QRCanvas value={verifyUrl} size={110} />
            <p className="mt-1 text-[9px] text-muted-foreground">যাচাই করুন</p>
          </div>
        </div>

        <div className="px-5 py-3 text-[10px] text-center bg-secondary/30 text-muted-foreground">
          এই কার্ড চাঁদগাঁও ফাউন্ডেশন কর্তৃক ইস্যুকৃত
        </div>
      </div>

      <div className="mt-5 flex flex-col sm:flex-row gap-3 print:hidden">
        <button onClick={() => window.print()} className="flex-1 py-3 rounded-full bg-primary text-primary-foreground font-semibold">📄 কার্ড ডাউনলোড / প্রিন্ট</button>
        <Link to="/m/$code" params={{ code: m.member_code || "" }} className="flex-1 py-3 rounded-full border border-border text-center font-semibold">পাবলিক যাচাই পেজ</Link>
        <button onClick={onReset} className="sm:w-auto py-3 px-5 rounded-full border border-border text-sm">বাহির</button>
      </div>
    </>
  );
}
