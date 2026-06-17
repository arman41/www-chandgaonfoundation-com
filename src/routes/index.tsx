import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useFoundationSettings } from "@/hooks/use-foundation-settings";

import heroImg from "@/assets/hero.jpg";
import galFood from "@/assets/gallery-food.jpg";
import galEdu from "@/assets/gallery-education.jpg";
import galMed from "@/assets/gallery-medical.jpg";
import galWinter from "@/assets/gallery-winter.jpg";
import {
  Heart, GraduationCap, Stethoscope, Snowflake, Waves, Building2,
  Target, Eye, Sparkles, ArrowRight, Phone, Mail, MapPin, Send, Share2,
} from "lucide-react";
import { listActivities, type Activity } from "@/lib/activities";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "চাঁদগাঁও ফাউন্ডেশন — মানবতার সেবায়" },
      { name: "description", content: "চাঁদগাঁওয়ের প্রবাসী ও যুবসমাজের উদ্যোগে পরিচালিত একটি অলাভজনক দাতব্য ফাউন্ডেশন। দান, স্বেচ্ছাসেবা ও মানবিক সহায়তায় আমাদের সাথে যুক্ত হন।" },
      { property: "og:title", content: "চাঁদগাঁও ফাউন্ডেশন — মানবতার সেবায় নিবেদিত" },
      { property: "og:description", content: "প্রবাসী ও যুবসমাজের উদ্যোগে দান, ত্রাণ, শিক্ষা ও চিকিৎসা সহায়তা। আমাদের কার্যক্রম দেখুন ও অংশ নিন।" },
      { property: "og:url", content: "https://chandgaonfoundation-info.lovable.app/" },
    ],
    links: [
      { rel: "canonical", href: "https://chandgaonfoundation-info.lovable.app/" },
      { rel: "preload", as: "image", href: heroImg, fetchpriority: "high" },
    ],
  }),
});

function Index() {
  return (
    <>
      <Hero />
      <Stats />
      <MissionVision />
      <Activities />
      <DonationSection />
      <Gallery />
      <Contact />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroImg} alt="ত্রাণ বিতরণ" className="w-full h-full object-cover" width={1600} height={1100} fetchPriority="high" decoding="async" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(120deg, oklch(0.18 0.06 162 / 0.94) 0%, oklch(0.18 0.06 162 / 0.6) 60%, transparent 100%)" }} />
      </div>
      <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-40 text-primary-foreground">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border border-white/20 backdrop-blur-sm" style={{ color: "var(--gold)" }}>
          <Sparkles className="w-3.5 h-3.5" /> মানবতার সেবায় নিবেদিত
        </span>
        <h1 className="mt-6 text-4xl md:text-6xl font-bold max-w-3xl leading-tight">
          আপনার একটি দান <br />
          বদলে দিতে পারে <span style={{ color: "var(--gold)" }}>একটি জীবন</span>
        </h1>
        <p className="mt-6 max-w-xl text-base md:text-lg opacity-90 leading-relaxed">
          চাঁদগাঁও প্রবাসী ও যুবসমাজ কল্যান ফাউন্ডেশন — অসহায়, দরিদ্র ও দুঃস্থ মানুষের পাশে দাঁড়াতে আপনার সহযোগিতা কামনা করছে।
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            to="/donate"
            className="inline-flex items-center gap-2 justify-center rounded-full px-8 py-3.5 text-sm font-semibold transition-transform hover:scale-105"
            style={{ background: "var(--gradient-gold)", color: "oklch(0.22 0.05 160)", boxShadow: "var(--shadow-gold)" }}
          >
            এখনই দান করুন <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/about"
            className="inline-flex items-center justify-center rounded-full px-8 py-3.5 text-sm font-semibold border border-white/30 hover:bg-white/10 transition-colors"
          >
            আমাদের সম্পর্কে জানুন
          </Link>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const items = [
    { n: "১২,৫০০+", l: "উপকারভোগী" },
    { n: "৮৫+", l: "চলমান প্রকল্প" },
    { n: "৩২০+", l: "সক্রিয় স্বেচ্ছাসেবক" },
    { n: "১৫ বছর", l: "নিরলস সেবা" },
  ];
  return (
    <section className="max-w-7xl mx-auto px-6 -mt-12 relative z-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden bg-border" style={{ boxShadow: "var(--shadow-elegant)" }}>
        {items.map((it) => (
          <div key={it.l} className="bg-card p-6 md:p-8 text-center">
            <div className="text-2xl md:text-3xl font-bold text-primary">{it.n}</div>
            <div className="mt-1 text-xs md:text-sm text-muted-foreground">{it.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function MissionVision() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20 md:py-28">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">আমাদের পথচলা</p>
        <h2 className="mt-3 text-3xl md:text-4xl font-bold">লক্ষ্য ও দৃষ্টিভঙ্গি</h2>
        <p className="mt-4 text-muted-foreground">
          মানবতা, সহমর্মিতা ও দায়িত্ববোধই আমাদের পথ চলার মূলমন্ত্র।
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <article
          className="relative overflow-hidden rounded-3xl p-8 md:p-10 border border-border bg-card"
          style={{ boxShadow: "var(--shadow-elegant)" }}
        >
          <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full opacity-10" style={{ background: "var(--gradient-hero)" }} />
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl grid place-items-center text-primary-foreground" style={{ background: "var(--gradient-hero)" }}>
              <Target className="w-6 h-6" />
            </div>
            <h3 className="mt-6 text-2xl font-bold text-primary">আমাদের লক্ষ্য</h3>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              চাঁদগাঁও তথা বৃহত্তর কুমিল্লা অঞ্চলের দরিদ্র, অসহায় ও দুঃস্থ মানুষের পাশে দাঁড়িয়ে খাদ্য, শিক্ষা, চিকিৎসা ও সামাজিক সুরক্ষা নিশ্চিত করে একটি মানবিক সমাজ গড়ে তোলা।
            </p>
            <ul className="mt-5 space-y-2 text-sm text-foreground/80">
              <li className="flex gap-2"><span style={{ color: "var(--gold)" }}>◆</span> দারিদ্র্য বিমোচনে সক্রিয় ভূমিকা</li>
              <li className="flex gap-2"><span style={{ color: "var(--gold)" }}>◆</span> শিক্ষা ও স্বাস্থ্যে সমান সুযোগ</li>
              <li className="flex gap-2"><span style={{ color: "var(--gold)" }}>◆</span> দুর্যোগে দ্রুত মানবিক সাড়া</li>
            </ul>
          </div>
        </article>

        <article
          className="relative overflow-hidden rounded-3xl p-8 md:p-10 border text-primary-foreground"
          style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-elegant)" }}
        >
          <div className="absolute -left-10 -bottom-10 w-44 h-44 rounded-full opacity-20" style={{ background: "var(--gradient-gold)" }} />
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl grid place-items-center" style={{ background: "var(--gradient-gold)", color: "oklch(0.22 0.05 160)" }}>
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="mt-6 text-2xl font-bold" style={{ color: "var(--gold)" }}>আমাদের দৃষ্টিভঙ্গি</h3>
            <p className="mt-3 opacity-90 leading-relaxed">
              এমন একটি সমাজ গড়ে তোলা যেখানে কেউ ক্ষুধার্ত থাকবে না, কোনো শিশু শিক্ষা থেকে বঞ্চিত হবে না, এবং প্রতিটি মানুষ সম্মান ও মর্যাদা নিয়ে বাঁচতে পারবে।
            </p>
            <ul className="mt-5 space-y-2 text-sm opacity-90">
              <li className="flex gap-2"><span style={{ color: "var(--gold)" }}>★</span> স্বচ্ছ ও জবাবদিহিমূলক ব্যবস্থাপনা</li>
              <li className="flex gap-2"><span style={{ color: "var(--gold)" }}>★</span> প্রবাসী ও স্থানীয় ঐক্যের শক্তি</li>
              <li className="flex gap-2"><span style={{ color: "var(--gold)" }}>★</span> টেকসই সামাজিক উন্নয়ন</li>
            </ul>
          </div>
        </article>
      </div>
    </section>
  );
}

function Activities() {
  const [items, setItems] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    listActivities()
      .then((d) => setItems(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function share(a: Activity) {
    const url = `${window.location.origin}/activities`;
    const text = `${a.title} — চাঁদগাঁও ফাউন্ডেশন`;
    const payload = `${text}\n${url}`;
    // Try native share (mobile). May be blocked inside preview iframe — fall back to clipboard.
    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({ title: a.title, text, url });
        return;
      }
    } catch (err) {
      // user cancelled or permission denied — fall through to clipboard
      if ((err as DOMException)?.name === "AbortError") return;
    }
    try {
      await navigator.clipboard.writeText(payload);
      toast.success("লিঙ্ক কপি হয়েছে");
      return;
    } catch {}
    try {
      const ta = document.createElement("textarea");
      ta.value = payload;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      toast.success("লিঙ্ক কপি হয়েছে");
    } catch {
      toast.error("শেয়ার করা যায়নি");
    }
  }

  const visible = showAll ? items : items.slice(0, 4);

  return (
    <section id="activities" className="bg-secondary/40 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="flex items-start gap-3 mb-8">
          <span className="mt-1 w-1.5 h-12 rounded-full bg-primary" />
          <div>
            <h2 className="text-2xl md:text-4xl font-bold uppercase tracking-tight">আমাদের কার্যক্রম</h2>
            <p className="mt-1 text-xs md:text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              সরাসরি একটি কার্যক্রমে দান করতে ডোনেট চাপুন
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground py-12">লোড হচ্ছে...</div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
            এখনও কোনো কার্যক্রম প্রকাশ করা হয়নি।
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {visible.map((a) => (
                <article key={a.id} className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col">
                  <div className="relative aspect-[4/3] bg-secondary/40 overflow-hidden">
                    {a.imageUrl ? (
                      <img src={a.imageUrl} alt={a.title} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full grid place-items-center text-muted-foreground">
                        <Heart className="w-10 h-10 opacity-30" />
                      </div>
                    )}
                    <span className="absolute top-3 left-3 inline-block text-[10px] font-semibold uppercase tracking-wide text-primary px-2.5 py-1 rounded-full bg-background/90 backdrop-blur">
                      {a.category}
                    </span>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-base font-bold uppercase tracking-tight text-foreground line-clamp-2">{a.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">📅 {a.date} · 📍 {a.location}</p>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <Link
                        to="/donate"
                        className="inline-flex items-center justify-center gap-1 rounded-full px-2 py-2 text-xs font-semibold text-primary-foreground bg-primary hover:opacity-90 transition"
                      >
                        <Heart className="w-3.5 h-3.5" /> ডোনেট
                      </Link>
                      <button
                        type="button"
                        onClick={() => share(a)}
                        className="inline-flex items-center justify-center gap-1 rounded-full px-2 py-2 text-xs font-semibold border border-border hover:border-primary hover:text-primary transition"
                      >
                        <Share2 className="w-3.5 h-3.5" /> শেয়ার
                      </button>
                      <Link
                        to="/activities"
                        className="inline-flex items-center justify-center gap-1 rounded-full px-2 py-2 text-xs font-semibold border border-border hover:border-primary hover:text-primary transition"
                      >
                        <ArrowRight className="w-3.5 h-3.5" /> বিস্তারিত
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {items.length > 4 && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowAll((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-primary border-2 border-primary/30 hover:bg-primary/5 transition"
                >
                  {showAll ? "কম দেখান" : `আরও দেখুন (${items.length - 4} টি কার্যক্রম)`}
                  <ArrowRight className={`w-4 h-4 transition-transform ${showAll ? "rotate-90" : ""}`} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}



function DonationSection() {
  const tiers = [
    { amt: "৫০০", l: "একটি পরিবারের সপ্তাহের খাবার" },
    { amt: "১,০০০", l: "একজন শিক্ষার্থীর মাসিক বৃত্তি" },
    { amt: "২,৫০০", l: "একটি শীতবস্ত্রের প্যাকেজ" },
    { amt: "৫,০০০", l: "একজন রোগীর চিকিৎসা সহায়তা" },
  ];
  return (
    <section className="max-w-7xl mx-auto px-6 py-20 md:py-28">
      <div className="rounded-3xl overflow-hidden border border-border" style={{ boxShadow: "var(--shadow-elegant)" }}>
        <div className="grid md:grid-cols-2">
          <div className="p-8 md:p-12 text-primary-foreground relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
            <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full opacity-20" style={{ background: "var(--gradient-gold)" }} />
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--gold)" }}>দান করুন</p>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold leading-tight">
                আপনার সাহায্যে <br />
                বদলাবে <span style={{ color: "var(--gold)" }}>একটি জীবন</span>
              </h2>
              <p className="mt-5 opacity-90 leading-relaxed">
                বিকাশ, নগদ, রকেট অথবা ব্যাংক — যেকোনো মাধ্যমে নিরাপদে দান করুন। প্রতিটি দানের জন্য পাবেন ডিজিটাল রসিদ ও TX ID যাচাইয়ের সুবিধা।
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/donate"
                  className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold transition-transform hover:scale-105"
                  style={{ background: "var(--gradient-gold)", color: "oklch(0.22 0.05 160)", boxShadow: "var(--shadow-gold)" }}
                >
                  এখনই দান করুন <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/donations" className="inline-flex items-center rounded-full px-7 py-3 text-sm font-semibold border border-white/30 hover:bg-white/10">
                  দান যাচাই
                </Link>
              </div>
            </div>
          </div>
          <div className="p-8 md:p-12 bg-card">
            <h3 className="text-lg font-semibold text-primary">যেকোনো পরিমাণ অর্থই মূল্যবান</h3>
            <p className="mt-1 text-sm text-muted-foreground">নিচের একটি বেছে নিন অথবা নিজের পছন্দমতো পরিমাণ লিখুন।</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {tiers.map((t) => (
                <Link
                  key={t.amt}
                  to="/donate"
                  className="group rounded-xl border border-border p-4 hover:border-primary hover:bg-secondary/40 transition-all"
                >
                  <div className="text-xl font-bold text-primary">৳ {t.amt}</div>
                  <div className="mt-1 text-xs text-muted-foreground leading-snug">{t.l}</div>
                </Link>
              ))}
            </div>
            <div className="mt-6 flex items-center gap-3 text-xs text-muted-foreground border-t border-border pt-5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-primary font-semibold">bKash</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-primary font-semibold">Nagad</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-primary font-semibold">Rocket</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-primary font-semibold">Bank</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Gallery() {
  const fallback = [
    { src: galFood, t: "খাদ্য বিতরণ" },
    { src: galEdu, t: "শিক্ষা বৃত্তি" },
    { src: galMed, t: "স্বাস্থ্য ক্যাম্প" },
    { src: galWinter, t: "শীতবস্ত্র" },
  ];
  const [items, setItems] = useState(fallback);

  useEffect(() => {
    supabase
      .from("gallery_items")
      .select("media_url, title, type, created_at")
      .eq("type", "photo")
      .order("created_at", { ascending: false })
      .limit(4)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setItems(data.map((g) => ({ src: g.media_url, t: g.title || "গ্যালারি" })));
        }
      });
  }, []);

  return (
    <section id="gallery" className="bg-secondary/40 border-y border-border">
      <div className="max-w-7xl mx-auto px-6 py-20 md:py-28">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">গ্যালারি</p>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold">মাঠের কিছু মুহূর্ত</h2>
          </div>
          <Link to="/gallery" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
            পুরো গ্যালারি <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((it, i) => (
            <figure
              key={`${it.t}-${i}`}
              className={`group relative overflow-hidden rounded-2xl border border-border ${i === 0 ? "md:col-span-2 md:row-span-2" : ""}`}
            >
              <img
                src={it.src}
                alt={it.t}
                loading="lazy"
                width={800}
                height={800}
                className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${i === 0 ? "aspect-square md:aspect-auto md:h-full" : "aspect-square"}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <figcaption className="absolute bottom-0 left-0 right-0 p-4 text-primary-foreground translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                <span className="text-sm font-semibold">{it.t}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const [sent, setSent] = useState(false);
  const { settings } = useFoundationSettings();
  return (

    <section id="contact" className="max-w-7xl mx-auto px-6 py-20 md:py-28">
      <div className="grid lg:grid-cols-2 gap-10 items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">যোগাযোগ</p>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold">আমাদের সাথে কথা বলুন</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            আপনার যেকোনো জিজ্ঞাসা, সহযোগিতার প্রস্তাব বা স্বেচ্ছাসেবক হওয়ার আগ্রহ জানাতে আমাদের সাথে যোগাযোগ করুন।
          </p>
          <ul className="mt-8 space-y-5">
            <li className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl grid place-items-center text-primary-foreground shrink-0" style={{ background: "var(--gradient-hero)" }}>
                <div className="text-sm text-muted-foreground">{settings?.address || "চাঁদগাঁও, লাকসাম, কুমিল্লা, বাংলাদেশ"}</div>

              </div>
              <div>
                <div className="text-sm font-semibold">ঠিকানা</div>
                <div className="text-sm text-muted-foreground">চাঁদগাঁও, লাকসাম, কুমিল্লা, বাংলাদেশ</div>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl grid place-items-center text-primary-foreground shrink-0" style={{ background: "var(--gradient-hero)" }}>
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">ফোন</div>
                <div className="text-sm text-muted-foreground">{settings?.phone || "—"}</div>
              </div>
            </li>

            <li className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl grid place-items-center text-primary-foreground shrink-0" style={{ background: "var(--gradient-hero)" }}>
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">ইমেইল</div>
                <div className="text-sm text-muted-foreground">{settings?.email || "—"}</div>

              </div>
            </li>
          </ul>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); setSent(true); }}
          className="bg-card rounded-3xl p-7 md:p-9 border border-border"
          style={{ boxShadow: "var(--shadow-elegant)" }}
        >
          <h3 className="text-lg font-semibold text-primary">বার্তা পাঠান</h3>
          <p className="mt-1 text-sm text-muted-foreground">আমরা ২৪ ঘণ্টার মধ্যে যোগাযোগ করব।</p>
          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-medium text-foreground/80">নাম</span>
              <input required className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-foreground/80">ফোন</span>
              <input required type="tel" className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </label>
          </div>
          <label className="block mt-4">
            <span className="text-xs font-medium text-foreground/80">ইমেইল</span>
            <input required type="email" className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </label>
          <label className="block mt-4">
            <span className="text-xs font-medium text-foreground/80">বার্তা</span>
            <textarea required rows={4} className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </label>
          <button
            type="submit"
            className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
            style={{ background: "var(--gradient-hero)" }}
          >
            {sent ? "ধন্যবাদ! ✓" : (<>পাঠান <Send className="w-4 h-4" /></>)}
          </button>
          <p className="mt-3 text-[11px] text-center text-muted-foreground">
            অথবা সরাসরি যোগাযোগ পৃষ্ঠায় যান —{" "}
            <Link to="/contact" className="text-primary font-medium hover:underline">যোগাযোগ</Link>
          </p>
        </form>
      </div>
    </section>
  );
}
