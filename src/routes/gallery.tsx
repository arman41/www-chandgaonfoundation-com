import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";

type GalleryItem = {
  id: string;
  title: string | null;
  type: string;
  media_url: string;
  album: string | null;
  created_at: string;
};

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "গ্যালারি — চাঁদগাঁও ফাউন্ডেশন" },
      { name: "description", content: "চাঁদগাঁও ফাউন্ডেশনের কাজের ছবি ও মুহূর্তগুলোর গ্যালারি।" },
      { property: "og:title", content: "গ্যালারি — চাঁদগাঁও ফাউন্ডেশন" },
      { property: "og:description", content: "ত্রাণ বিতরণ, শিক্ষা সহায়তা, চিকিৎসা ক্যাম্প ও সামাজিক কর্মসূচির ছবি—চাঁদগাঁও ফাউন্ডেশনের মানবিক কাজের চাক্ষুষ দলিল।" },
      { property: "og:url", content: "https://chandgaonfoundation-info.lovable.app/gallery" },
    ],
    links: [{ rel: "canonical", href: "https://chandgaonfoundation-info.lovable.app/gallery" }],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<GalleryItem | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("gallery_items")
        .select("*")
        .order("created_at", { ascending: false });
      setItems((data as GalleryItem[] | null) ?? []);
      setLoading(false);
    })();
  }, []);

  const albums = Array.from(new Set(items.map((i) => i.album).filter(Boolean))) as string[];
  const [album, setAlbum] = useState<string>("all");
  const filtered = album === "all" ? items : items.filter((i) => i.album === album);

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="w-4 h-4" /> হোম
      </Link>
      <div className="mt-6 mb-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">গ্যালারি</p>
        <h1 className="mt-3 text-3xl md:text-4xl font-bold">মাঠের কিছু মুহূর্ত</h1>
        <p className="mt-3 text-muted-foreground">আমাদের সকল কার্যক্রমের ছবি এক জায়গায়।</p>
      </div>

      {albums.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          <button
            onClick={() => setAlbum("all")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border ${album === "all" ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card hover:bg-accent/30"}`}
          >
            সব
          </button>
          {albums.map((a) => (
            <button
              key={a}
              onClick={() => setAlbum(a)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border ${album === a ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card hover:bg-accent/30"}`}
            >
              {a}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center text-muted-foreground py-20">লোড হচ্ছে...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-muted-foreground py-20">এখনো কোনো ছবি যোগ করা হয়নি।</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((it) => (
            <button
              key={it.id}
              onClick={() => setActive(it)}
              className="group relative overflow-hidden rounded-2xl border border-border aspect-square focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <img
                src={it.media_url}
                alt={it.title || "গ্যালারি"}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {it.title && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-left">
                  <span className="text-xs font-semibold text-white">{it.title}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {active && (
        <div
          onClick={() => setActive(null)}
          className="fixed inset-0 z-50 bg-black/90 grid place-items-center p-4 cursor-zoom-out"
        >
          <img src={active.media_url} alt={active.title || ""} className="max-h-[90vh] max-w-full rounded-lg" />
        </div>
      )}
    </section>
  );
}
