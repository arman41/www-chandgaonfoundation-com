import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { lookupMyMembership, type MemberPrivate } from "@/lib/members.functions";
import { MemberSmartCard } from "@/components/MemberSmartCard";
import { useLanguage } from "@/hooks/use-language";


export const Route = createFileRoute("/my-membership")({
  head: () => ({
    meta: [
      { title: "My Member Card — Chandgaon Foundation" },
      { name: "description", content: "View your digital member card using your member number and the last 4 digits of your mobile." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Page,
  errorComponent: ({ error }) => <div className="py-20 text-center text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="py-20 text-center">Not found</div>,
});

function Page() {
  const navigate = useNavigate();
  const { t } = useLanguage();
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
    if (code.trim().length < 4) return setError(t("সদস্য নম্বর দিন (যেমন CGF-001234)", "Enter your member number (e.g. CGF-001234)"));
    if (!/^\d{4}$/.test(last4)) return setError(t("ফোন নম্বরের শেষ ৪ ডিজিট দিন", "Enter the last 4 digits of your mobile"));
    setLoading(true);
    try {
      const r = await lookup({ data: { code: code.trim(), phone_last4: last4 } });
      setMember(r as MemberPrivate | null);
    } catch (err: any) {
      setError(err?.message || t("যাচাই করা যায়নি", "Could not verify"));
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="text-center mb-8 print:hidden">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">{t("আমার সদস্যপদ", "My Membership")}</p>
        <h1 className="mt-3 text-3xl sm:text-4xl font-bold">{t("ডিজিটাল সদস্য কার্ড", "Digital Member Card")}</h1>
      </div>

      {!member && (
        <form onSubmit={onSubmit} className="bg-card border border-border rounded-3xl p-5 sm:p-8 space-y-4 print:hidden" style={{ boxShadow: "var(--shadow-elegant)" }}>
          <div>
            <label className="text-sm font-semibold">{t("সদস্য নম্বর", "Member Number")}</label>
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="CGF-001234" className="mt-2 w-full px-4 py-3 rounded-xl border border-input bg-background font-mono tracking-wider text-sm" />
          </div>
          <div>
            <label className="text-sm font-semibold">{t("মোবাইল নম্বরের শেষ ৪ ডিজিট", "Last 4 digits of mobile")}</label>
            <input value={last4} onChange={(e) => setLast4(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" maxLength={4} placeholder="####" className="mt-2 w-full px-4 py-3 rounded-xl border border-input bg-background font-mono tracking-widest text-center text-base" />
          </div>
          {error && <p className="text-sm text-destructive text-center">{error}</p>}
          <button disabled={loading} className="w-full py-3 rounded-full bg-primary text-primary-foreground font-semibold disabled:opacity-60">{loading ? t("খোঁজা হচ্ছে...", "Searching...") : t("কার্ড দেখুন", "View Card")}</button>
          <p className="text-center text-xs text-muted-foreground">
            {t("নতুন?", "New?")} <Link to="/membership" className="text-primary font-semibold underline">{t("আবেদন করুন", "Apply now")}</Link>
          </p>
        </form>
      )}

      {member === null && (
        <div className="mt-6 p-6 bg-card border border-border rounded-2xl text-center text-muted-foreground">
          {t("কোনো সদস্য পাওয়া যায়নি। আপনার আবেদন এখনো অনুমোদিত নাও হতে পারে।", "No member found. Your application may not be approved yet.")}
        </div>
      )}

      {member && <MemberCard m={member} onReset={() => { setMember(undefined); setCode(""); setLast4(""); navigate({ to: "/my-membership" }); }} />}
    </div>
  );
}

function MemberCard({ m, onReset }: { m: MemberPrivate; onReset: () => void }) {
  const { t } = useLanguage();
  const verifyUrl = typeof window !== "undefined" ? `${window.location.origin}/m/${m.member_code}` : `/m/${m.member_code}`;

  return (
    <>
      <div id="receipt" className="mx-auto max-w-md space-y-4">
        <MemberSmartCard data={m} verifyUrl={verifyUrl} side="front" />
        <MemberSmartCard data={m} verifyUrl={verifyUrl} side="back" />
        <p className="text-center text-[11px] text-muted-foreground">
          {t("স্ট্যাটাস:", "Status:")} <span className={`font-semibold ${m.status === "approved" ? "text-emerald-700" : "text-amber-700"}`}>
            {m.status === "approved" ? t("✓ সক্রিয়", "✓ Active") : t("⏳ অপেক্ষমাণ", "⏳ Pending")}
          </span>
        </p>
      </div>

      <div className="mt-5 flex flex-col sm:flex-row gap-3 print:hidden">
        <button onClick={() => window.print()} className="flex-1 py-3 rounded-full bg-primary text-primary-foreground font-semibold">📄 {t("কার্ড ডাউনলোড / প্রিন্ট", "Download / Print Card")}</button>
        <Link to="/m/$code" params={{ code: m.member_code || "" }} className="flex-1 py-3 rounded-full border border-border text-center font-semibold">{t("পাবলিক যাচাই পেজ", "Public Verify Page")}</Link>
        <button onClick={onReset} className="sm:w-auto py-3 px-5 rounded-full border border-border text-sm">{t("বাহির", "Exit")}</button>
      </div>
    </>
  );
}
