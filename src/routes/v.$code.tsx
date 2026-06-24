import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { VolunteerSmartCard, type VolunteerCardData } from "@/components/VolunteerSmartCard";

export const Route = createFileRoute("/v/$code")({
  head: ({ params }) => ({
    meta: [
      { title: `স্বেচ্ছাসেবক যাচাই ${params.code} — চাঁদগাঁও ফাউন্ডেশন` },
      { name: "description", content: "চাঁদগাঁও ফাউন্ডেশনের স্বেচ্ছাসেবক স্মার্ট আইডি কার্ড যাচাই।" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Page,
  errorComponent: ({ error }) => <div className="py-20 text-center text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="py-20 text-center">কার্ড পাওয়া যায়নি</div>,
});

function Page() {
  const { code } = useParams({ from: "/v/$code" });
  const [data, setData] = useState<VolunteerCardData | null | undefined>(undefined);
  const [err, setErr] = useState<string | null>(null);
  const [flip, setFlip] = useState(false);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("volunteer_public_card")
      .select("volunteer_code,name,role,area,skills,assigned_task,status,photo_url,blood_group,joined_at,expires_at")
      .eq("volunteer_code", code.toUpperCase())
      .maybeSingle()
      .then(({ data: row, error }) => {
        if (cancelled) return;
        if (error) return setErr(error.message);
        setData((row as any) ?? null);
      });
    return () => { cancelled = true; };
  }, [code]);


  if (err) return <div className="py-20 text-center text-destructive">{err}</div>;
  if (data === undefined) return <div className="py-20 text-center text-muted-foreground">যাচাই করা হচ্ছে...</div>;

  if (!data) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-destructive">অবৈধ কার্ড</h1>
        <p className="mt-3 text-sm text-muted-foreground">এই কোডে কোনো সক্রিয় স্বেচ্ছাসেবক পাওয়া যায়নি।</p>
        <p className="mt-2 font-mono text-xs">{code}</p>
        <Link to="/" className="mt-6 inline-block px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold">হোমে ফিরুন</Link>
      </div>
    );
  }

  const verifyUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="max-w-md mx-auto px-4 py-10 sm:py-14">
      <div className="text-center mb-5">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-800 text-xs font-bold">
          ✓ যাচাইকৃত স্বেচ্ছাসেবক
        </div>
      </div>

      <button
        type="button"
        onClick={() => setFlip((f) => !f)}
        className="w-full block focus:outline-none"
        aria-label="কার্ড উল্টান"
      >
        <VolunteerSmartCard data={data} verifyUrl={verifyUrl} side={flip ? "back" : "front"} />
      </button>

      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        কার্ডে ট্যাপ করে সামনে/পেছনে দেখুন
      </p>

      <div className="mt-6 rounded-2xl border border-border bg-card p-4 text-sm">
        <Row label="নাম" value={data.name} />
        <Row label="ভূমিকা" value={data.role || "স্বেচ্ছাসেবক"} />
        {data.area && <Row label="এলাকা" value={data.area} />}
        {data.assigned_task && <Row label="দায়িত্ব" value={data.assigned_task} />}
        {data.skills && <Row label="দক্ষতা" value={data.skills} />}
        {data.blood_group && <Row label="রক্তের গ্রুপ" value={data.blood_group} />}
        <Row label="যোগদান" value={data.joined_at ? new Date(data.joined_at).toLocaleDateString("bn-BD") : "—"} />
        <Row label="মেয়াদ" value={data.expires_at ? new Date(data.expires_at).toLocaleDateString("bn-BD") : "—"} />
        <Row label="কোড" value={<span className="font-mono">{data.volunteer_code}</span>} />
      </div>

      <div className="mt-6 text-center">
        <Link to="/" className="text-sm text-primary underline">হোমে ফিরুন</Link>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 py-1.5 border-b border-border/60 last:border-0">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="font-semibold text-right">{value}</span>
    </div>
  );
}
