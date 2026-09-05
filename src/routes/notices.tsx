import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/notices")({
  head: () => ({
    meta: [
      { title: "Notices | Chandgaon Foundation" },
      { name: "description", content: "Latest notices, announcements and important updates for members of Chandgaon Foundation, all in one place." },
      { property: "og:title", content: "Notices & Announcements | Chandgaon Foundation" },
      { property: "og:description", content: "Read all published notices, member guidance and recent announcements from the foundation." },
      { property: "og:url", content: "https://chandgaonfoundation.com/notices" },
      { name: "twitter:title", content: "Notices & Announcements | Chandgaon Foundation" },
      { name: "twitter:description", content: "Read all published notices, member guidance and recent announcements from the foundation." },
      { property: "og:image", content: "https://chandgaonfoundation.com/og-image.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Notices & Announcements | Chandgaon Foundation" },
      { name: "twitter:image", content: "https://chandgaonfoundation.com/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://chandgaonfoundation.com/notices" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Notices & Announcements | Chandgaon Foundation",
        description: "All notices, announcements and important member updates from Chandgaon Foundation.",
        url: "https://chandgaonfoundation.com/notices",
        isPartOf: { "@type": "WebSite", name: "Chandgaon Foundation", url: "https://chandgaonfoundation.com" },
      }),
    }],
  }),
  component: NoticesPage,
});

type N = {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  published_at: string;
};

function NoticesPage() {
  const { t, lang } = useLanguage();
  const [items, setItems] = useState<N[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<N | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    supabase
      .from("notices")
      .select("id,title,content,image_url,published_at")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .then(({ data }) => {
        setItems((data ?? []) as N[]);
        setLoading(false);
      });
  }, []);

  const filtered = items.filter((n) =>
    !q || (n.title + " " + n.content).toLowerCase().includes(q.toLowerCase()),
  );

  const locale = lang === "bn" ? "bn-BD" : "en-US";

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">{t("ঘোষণা", "Announcements")}</p>
        <h1 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-bold">{t("নোটিশ বোর্ড", "Notice Board")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("ফাউন্ডেশনের প্রকাশিত নোটিশসমূহ।", "Notices published by the foundation.")}</p>
      </header>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t("নোটিশ খুঁজুন...", "Search notices...")}
        className="w-full mb-6 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />

      {loading ? (
        <div className="text-center text-muted-foreground py-12">{t("লোড হচ্ছে...", "Loading...")}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
          {t("কোনো নোটিশ পাওয়া যায়নি।", "No notices found.")}
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((n) => (
            <li key={n.id}>
              <button
                onClick={() => setOpen(n)}
                className="w-full text-left bg-card border border-border rounded-2xl p-4 sm:p-5 hover:border-primary/40 hover:shadow-sm transition-all flex gap-4"
              >
                <span className="h-10 w-10 shrink-0 grid place-items-center rounded-xl bg-primary/10 text-primary">
                  <Megaphone className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs text-muted-foreground">
                    {new Date(n.published_at).toLocaleDateString(locale, { dateStyle: "long" })}
                  </span>
                  <span className="block mt-0.5 font-semibold text-base sm:text-lg truncate">{n.title}</span>
                  <span className="block mt-1 text-sm text-muted-foreground line-clamp-2">{n.content}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="p-5 border-b border-border flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">
                  {new Date(open.published_at).toLocaleDateString(locale, { dateStyle: "long" })}
                </p>
                <h2 className="mt-1 text-lg sm:text-xl font-semibold">{open.title}</h2>
              </div>
              <button
                onClick={() => setOpen(null)}
                className="shrink-0 h-8 w-8 grid place-items-center rounded-lg hover:bg-muted text-muted-foreground"
                aria-label={t("বন্ধ করুন", "Close")}
              >
                ✕
              </button>
            </div>
            <div className="p-5 overflow-y-auto">
              {open.image_url && (
                <img src={open.image_url} alt="" className="w-full rounded-xl mb-4 max-h-72 object-cover" />
              )}
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">{open.content}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
