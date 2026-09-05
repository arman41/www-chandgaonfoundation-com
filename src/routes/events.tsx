import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarDays, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events | Chandgaon Foundation" },
      { name: "description", content: "Upcoming programs, ongoing initiatives and completed events of Chandgaon Foundation — see the full list and details." },
      { property: "og:title", content: "Events & Programs | Chandgaon Foundation" },
      { property: "og:description", content: "Detailed information about upcoming and completed events, relief distribution and social programs of the foundation." },
      { property: "og:url", content: "https://chandgaonfoundation.com/events" },
      { name: "twitter:title", content: "Events & Programs | Chandgaon Foundation" },
      { name: "twitter:description", content: "Detailed information about upcoming and completed events, relief distribution and social programs of the foundation." },
      { property: "og:image", content: "https://chandgaonfoundation.com/og-image.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Events & Programs | Chandgaon Foundation" },
      { name: "twitter:image", content: "https://chandgaonfoundation.com/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://chandgaonfoundation.com/events" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Events & Programs | Chandgaon Foundation",
        description: "Upcoming and completed events, relief distribution and social programs of Chandgaon Foundation.",
        url: "https://chandgaonfoundation.com/events",
        isPartOf: { "@type": "WebSite", name: "Chandgaon Foundation", url: "https://chandgaonfoundation.com" },
      }),
    }],
  }),
  component: EventsPage,
});

type Ev = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  banner_url: string | null;
  event_date: string;
  status: string;
};

function EventsPage() {
  const { t, lang } = useLanguage();
  const [items, setItems] = useState<Ev[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | "upcoming" | "completed">("all");

  useEffect(() => {
    supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: false })
      .then(({ data }) => {
        setItems((data ?? []) as Ev[]);
        setLoading(false);
      });
  }, []);

  const filtered = items.filter((e) => tab === "all" || e.status === tab);

  const statusLabel = (s: string) =>
    s === "upcoming" ? t("আসন্ন", "Upcoming")
    : s === "ongoing" ? t("চলমান", "Ongoing")
    : t("সমাপ্ত", "Completed");

  const locale = lang === "bn" ? "bn-BD" : "en-US";

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">{t("আমাদের আয়োজন", "Our Programs")}</p>
        <h1 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-bold">{t("ইভেন্টসমূহ", "Events")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("ফাউন্ডেশনের আসন্ন কর্মসূচি ও সম্পন্ন আয়োজন।", "Upcoming programs and completed events of the foundation.")}</p>
      </header>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {([
          ["all", t("সব", "All")],
          ["upcoming", t("আসন্ন", "Upcoming")],
          ["completed", t("সমাপ্ত", "Completed")],
        ] as const).map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition ${
              tab === k ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card hover:bg-muted"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-12">{t("লোড হচ্ছে...", "Loading...")}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
          {t("কোনো ইভেন্ট নেই।", "No events yet.")}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((e) => (
            <article
              key={e.id}
              className="bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/40 hover:-translate-y-0.5 transition-all"
            >
              {e.banner_url ? (
                <img src={e.banner_url} alt={e.title} className="w-full h-40 object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-40 bg-gradient-to-br from-primary/15 to-accent/30 grid place-items-center">
                  <CalendarDays className="h-10 w-10 text-primary/60" />
                </div>
              )}
              <div className="p-5">
                <span
                  className={`inline-block text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${
                    e.status === "upcoming"
                      ? "bg-primary/10 text-primary"
                      : e.status === "ongoing"
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {statusLabel(e.status)}
                </span>
                <h2 className="mt-3 text-lg font-semibold">{e.title}</h2>
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {new Date(e.event_date).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                  {e.location && (
                    <p className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {e.location}
                    </p>
                  )}
                </div>
                {e.description && (
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3">{e.description}</p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
