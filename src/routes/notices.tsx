import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/notices")({
  head: () => ({
    meta: [
      { title: "নোটিশ | চাঁদগাঁও ফাউন্ডেশন" },
      { name: "description", content: "চাঁদগাঁও ফাউন্ডেশনের সর্বশেষ নোটিশ, ঘোষণা ও সদস্যদের জন্য গুরুত্বপূর্ণ আপডেটসমূহ এক জায়গায় দেখুন।" },
      { property: "og:title", content: "নোটিশ ও ঘোষণা | চাঁদগাঁও ফাউন্ডেশন" },
      { property: "og:description", content: "ফাউন্ডেশনের প্রকাশিত সকল নোটিশ, সদস্যদের জন্য নির্দেশনা ও সাম্প্রতিক ঘোষণা পড়ুন।" },
      { property: "og:url", content: "https://chandgaonfoundation-info.lovable.app/notices" },
    ],
    links: [{ rel: "canonical", href: "https://chandgaonfoundation-info.lovable.app/notices" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "নোটিশ ও ঘোষণা | চাঁদগাঁও ফাউন্ডেশন",
        description: "চাঁদগাঁও ফাউন্ডেশনের প্রকাশিত সকল নোটিশ, ঘোষণা ও সদস্যদের জন্য গুরুত্বপূর্ণ আপডেট।",
        url: "https://chandgaonfoundation-info.lovable.app/notices",
        isPartOf: { "@type": "WebSite", name: "চাঁদগাঁও ফাউন্ডেশন", url: "https://chandgaonfoundation-info.lovable.app" },
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

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">ঘোষণা</p>
        <h1 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-bold">নোটিশ বোর্ড</h1>
        <p className="mt-2 text-sm text-muted-foreground">ফাউন্ডেশনের প্রকাশিত নোটিশসমূহ।</p>
      </header>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="নোটিশ খুঁজুন..."
        className="w-full mb-6 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />

      {loading ? (
        <div className="text-center text-muted-foreground py-12">লোড হচ্ছে...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
          কোনো নোটিশ পাওয়া যায়নি।
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
                    {new Date(n.published_at).toLocaleDateString("bn-BD", { dateStyle: "long" })}
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
                  {new Date(open.published_at).toLocaleDateString("bn-BD", { dateStyle: "long" })}
                </p>
                <h2 className="mt-1 text-lg sm:text-xl font-semibold">{open.title}</h2>
              </div>
              <button
                onClick={() => setOpen(null)}
                className="shrink-0 h-8 w-8 grid place-items-center rounded-lg hover:bg-muted text-muted-foreground"
                aria-label="বন্ধ করুন"
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
