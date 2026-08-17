import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listActivities, type Activity } from "@/lib/activities";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { ActivityCard, ShareModal, DetailModal } from "@/components/ActivityCard";

export const Route = createFileRoute("/activities")({
  head: () => ({
    meta: [
      { title: "Activities | Chandgaon Foundation" },
      { name: "description", content: "All published activities of Chandgaon Foundation — relief distribution, education and healthcare support." },
      { property: "og:title", content: "Our Activities | Chandgaon Foundation" },
      { property: "og:description", content: "A detailed list of humanitarian, education and health programs run by the foundation." },
      { property: "og:url", content: "https://chandgaonfoundation.com/activities" },
      { name: "twitter:title", content: "Our Activities | Chandgaon Foundation" },
      { name: "twitter:description", content: "A detailed list of humanitarian, education and health programs run by the foundation." },
      { property: "og:image", content: "https://chandgaonfoundation.com/og-image.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Our Activities | Chandgaon Foundation" },
      { name: "twitter:image", content: "https://chandgaonfoundation.com/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://chandgaonfoundation.com/activities" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Chandgaon Foundation Activities",
        url: "https://chandgaonfoundation.com/activities",
      }),
    }],
  }),
  component: ActivitiesPage,
});

function ActivitiesPage() {
  const { isAdmin } = useAuth();
  const { t } = useLanguage();
  const [items, setItems] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareFor, setShareFor] = useState<Activity | null>(null);
  const [detailFor, setDetailFor] = useState<Activity | null>(null);

  useEffect(() => {
    listActivities()
      .then((d) => setItems(d))
      .catch((e) => setError(e?.message ?? t("ত্রুটি", "Error")))
      .finally(() => setLoading(false));
  }, [t]);

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">{t("আমাদের কার্যক্রম", "Our Activities")}</p>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold">{t("প্রকাশিত কার্যক্রম", "Published Activities")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("ফাউন্ডেশনের চলমান ও সম্পন্ন কাজের তালিকা।", "Ongoing and completed work of the foundation.")}</p>
        </div>
        {isAdmin && (
          <Link
            to="/activities/new"
            className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            style={{ background: "var(--gradient-gold)", color: "oklch(0.22 0.05 160)", boxShadow: "var(--shadow-gold)" }}
          >
            {t("+ নতুন কার্যক্রম প্রকাশ করুন", "+ Publish New Activity")}
          </Link>
        )}
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-12">{t("লোড হচ্ছে...", "Loading...")}</div>
      ) : error ? (
        <div className="text-center text-destructive py-12">{error}</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">{t("এখনও কোনো কার্যক্রম প্রকাশ করা হয়নি।", "No activities published yet.")}</p>
          {isAdmin && (
            <Link to="/activities/new" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
              {t("প্রথম কার্যক্রম প্রকাশ করুন →", "Publish the first activity →")}
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((a) => (
            <ActivityCard key={a.id} a={a} onShare={setShareFor} onDetail={setDetailFor} />
          ))}
        </div>
      )}

      {shareFor && <ShareModal activity={shareFor} onClose={() => setShareFor(null)} />}
      {detailFor && <DetailModal activity={detailFor} onClose={() => setDetailFor(null)} />}
    </section>
  );
}
