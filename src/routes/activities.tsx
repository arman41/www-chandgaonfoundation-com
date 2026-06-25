import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listActivities, type Activity } from "@/lib/activities";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/activities")({
  head: () => ({
    meta: [
      { title: "কার্যক্রম | চাঁদগাঁও ফাউন্ডেশন" },
      { name: "description", content: "ফাউন্ডেশনের প্রকাশিত কার্যক্রম, ত্রাণ বিতরণ, শিক্ষা ও চিকিৎসা সহায়তাসহ সাম্প্রতিক সকল উদ্যোগ দেখুন।" },
      { property: "og:title", content: "আমাদের কার্যক্রম | চাঁদগাঁও ফাউন্ডেশন" },
      { property: "og:description", content: "ফাউন্ডেশন কর্তৃক পরিচালিত মানবিক, শিক্ষা ও স্বাস্থ্য কর্মসূচির বিস্তারিত তালিকা।" },
      { property: "og:url", content: "https://www.chandgaonfundition.xyz/activities" },
      { name: "twitter:title", content: "আমাদের কার্যক্রম | চাঁদগাঁও ফাউন্ডেশন" },
      { name: "twitter:description", content: "ফাউন্ডেশন কর্তৃক পরিচালিত মানবিক, শিক্ষা ও স্বাস্থ্য কর্মসূচির বিস্তারিত তালিকা।" },
      { property: "og:image", content: "https://www.chandgaonfundition.xyz/og-image.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "আমাদের কার্যক্রম | চাঁদগাঁও ফাউন্ডেশন" },
      { name: "twitter:image", content: "https://www.chandgaonfundition.xyz/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://www.chandgaonfundition.xyz/activities" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "চাঁদগাঁও ফাউন্ডেশনের কার্যক্রম",
        url: "https://www.chandgaonfundition.xyz/activities",
      }),
    }],
  }),
  component: ActivitiesPage,
});

function ActivitiesPage() {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listActivities()
      .then((d) => setItems(d))
      .catch((e) => setError(e?.message ?? "ত্রুটি"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">আমাদের কার্যক্রম</p>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold">প্রকাশিত কার্যক্রম</h1>
          <p className="mt-2 text-sm text-muted-foreground">ফাউন্ডেশনের চলমান ও সম্পন্ন কাজের তালিকা।</p>
        </div>
        {isAdmin && (
          <Link
            to="/activities/new"
            className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            style={{ background: "var(--gradient-gold)", color: "oklch(0.22 0.05 160)", boxShadow: "var(--shadow-gold)" }}
          >
            + নতুন কার্যক্রম প্রকাশ করুন
          </Link>
        )}
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-12">লোড হচ্ছে...</div>
      ) : error ? (
        <div className="text-center text-destructive py-12">{error}</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">এখনও কোনো কার্যক্রম প্রকাশ করা হয়নি।</p>
          {isAdmin && (
            <Link to="/activities/new" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
              প্রথম কার্যক্রম প্রকাশ করুন →
            </Link>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((a) => (
            <article key={a.id} className="bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/30 hover:-translate-y-1 transition-all">
              {a.imageUrl && (
                <img src={a.imageUrl} alt={a.title} className="w-full h-44 object-cover" loading="lazy" />
              )}
              <div className="p-6">
                <span className="inline-block text-[11px] font-semibold uppercase tracking-wide text-primary px-2.5 py-1 rounded-full" style={{ background: "color-mix(in oklab, var(--accent) 40%, transparent)" }}>
                  {a.category}
                </span>
                <h2 className="mt-3 text-lg font-semibold text-primary">{a.title}</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  📅 {a.date} · 📍 {a.location}
                </p>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-4">{a.description}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}