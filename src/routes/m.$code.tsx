import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { verifyMemberCard, type PublicCard } from "@/lib/members.functions";
import { QRCanvas } from "@/components/QRCanvas";

export const Route = createFileRoute("/m/$code")({
  head: ({ params }) => ({
    meta: [
      { title: `সদস্য যাচাই ${params.code} — চাঁদগাঁও ফাউন্ডেশন` },
      { name: "description", content: "চাঁদগাঁও ফাউন্ডেশনের সদস্য কার্ড QR যাচাই পেজ।" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Page,
  errorComponent: ({ error }) => <div className="py-20 text-center text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="py-20 text-center">কার্ড পাওয়া যায়নি</div>,
});

function Page() {
  const { code } = useParams({ from: "/m/$code" });
  const [data, setData] = useState<PublicCard | null | undefined>(undefined);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    verifyMemberCard(code)
      .then((r) => { if (!cancelled) setData(r); })
      .catch((e) => { if (!cancelled) setErr(e?.message || "যাচাই ব্যর্থ"); });
    return () => { cancelled = true; };
  }, [code]);

  if (err) return <div className="py-20 text-center text-destructive">{err}</div>;
  if (data === undefined) return <div className="py-20 text-center text-muted-foreground">যাচাই করা হচ্ছে...</div>;

  if (!data) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-destructive">অবৈধ কার্ড</h1>
        <p className="mt-3 text-sm text-muted-foreground">এই কোডে কোনো অনুমোদিত সদস্য পাওয়া যায়নি।</p>
        <p className="mt-2 font-mono text-xs">{code}</p>
        <Link to="/" className="mt-6 inline-block px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold">হোমে ফিরুন</Link>
      </div>
    );
  }

  const initial = data.name?.charAt(0) || "?";
  const verifyUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="max-w-md mx-auto px-4 py-10 sm:py-16">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-800 text-xs font-bold">
          ✓ যাচাইকৃত সদস্য
        </div>
      </div>

      <div className="rounded-3xl overflow-hidden border-2 border-border bg-card" style={{ boxShadow: "var(--shadow-elegant)" }}>
        <div className="p-5 text-white" style={{ background: "linear-gradient(135deg, #0c2340 0%, #1e3a5f 100%)" }}>
          <p className="text-[10px] uppercase tracking-widest opacity-80">Verified Membership</p>
          <h2 className="font-bold text-lg mt-1">চাঁদগাঁও ফাউন্ডেশন</h2>
        </div>

        <div className="p-6 text-center border-b border-border">
          {data.photo_url ? (
            <img src={data.photo_url} alt={data.name} className="w-24 h-24 rounded-full object-cover mx-auto border-2" style={{ borderColor: "var(--gold)" }} />
          ) : (
            <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center text-3xl font-bold border-2" style={{ background: "var(--secondary)", borderColor: "var(--gold)" }}>{initial}</div>
          )}
          <h3 className="mt-3 text-2xl font-bold">{data.name}</h3>
          <p className="text-sm text-muted-foreground">{data.role || "সদস্য"} {data.area && `· ${data.area}`}</p>
        </div>

        <div className="p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">সদস্য নম্বর</p>
            <p className="font-mono text-lg font-bold" style={{ color: "var(--gold)" }}>{data.member_code}</p>
            <p className="text-[10px] mt-2 uppercase tracking-widest text-muted-foreground">যোগদান</p>
            <p className="text-sm font-semibold">{data.join_date ? new Date(data.join_date).toLocaleDateString("bn-BD") : "-"}</p>
          </div>
          {verifyUrl && <QRCanvas value={verifyUrl} size={100} />}
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        এই পেজ চাঁদগাঁও ফাউন্ডেশন থেকে স্বয়ংক্রিয়ভাবে যাচাইকৃত।
      </p>
      <div className="mt-4 text-center">
        <Link to="/" className="text-sm text-primary underline">হোমে ফিরুন</Link>
      </div>
    </div>
  );
}
