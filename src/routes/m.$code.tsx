import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { verifyMemberCard, type PublicCard } from "@/lib/members.functions";
import { MemberSmartCard } from "@/components/MemberSmartCard";

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

  const verifyUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="max-w-md mx-auto px-4 py-10 sm:py-16">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-800 text-xs font-bold">
          ✓ যাচাইকৃত সদস্য
        </div>
      </div>

      <div className="space-y-4">
        <MemberSmartCard data={data} verifyUrl={verifyUrl} side="front" />
        <MemberSmartCard data={data} verifyUrl={verifyUrl} side="back" />
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

