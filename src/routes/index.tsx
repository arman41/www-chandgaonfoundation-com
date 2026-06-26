import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useFoundationSettings } from "@/hooks/use-foundation-settings";
import { useLanguage } from "@/hooks/use-language";

import heroImg from "@/assets/hero.jpg";
import galFood from "@/assets/gallery-food.jpg";
import galEdu from "@/assets/gallery-education.jpg";
import galMed from "@/assets/gallery-medical.jpg";
import galWinter from "@/assets/gallery-winter.jpg";
import {
  Heart, GraduationCap, Stethoscope, Snowflake, Waves, Building2,
  Target, Eye, Sparkles, ArrowRight, Phone, Mail, MapPin, Send, Share2,
  Facebook, Twitter, MessageCircle, Link as LinkIcon, X,
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
      { property: "og:url", content: "https://www.chandgaonfundition.xyz/" },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "চাঁদগাঁও ফাউন্ডেশন — মানবতার সেবায় নিবেদিত" },
      { name: "twitter:description", content: "প্রবাসী ও যুবসমাজের উদ্যোগে দান, ত্রাণ, শিক্ষা ও চিকিৎসা সহায়তা। আমাদের কার্যক্রম দেখুন ও অংশ নিন।" },
      { property: "og:image", content: "https://www.chandgaonfundition.xyz/og-image.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "চাঁদগাঁও ফাউন্ডেশন — মানবতার সেবায় নিবেদিত" },
      { name: "twitter:image", content: "https://www.chandgaonfundition.xyz/og-image.jpg" },
    ],
    links: [
      { rel: "canonical", href: "https://www.chandgaonfundition.xyz/" },
      { rel: "preload", as: "image", href: heroImg, fetchpriority: "high", type: "image/jpeg" },
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
  const { t } = useLanguage();
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroImg} alt={t("ত্রাণ বিতরণ", "Relief distribution")} className="w-full h-full object-cover" width={1600} height={1100} fetchPriority="high" decoding="async" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(120deg, oklch(0.18 0.06 162 / 0.94) 0%, oklch(0.18 0.06 162 / 0.6) 60%, transparent 100%)" }} />
      </div>
      <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-40 text-primary-foreground">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border border-white/20 backdrop-blur-sm" style={{ color: "var(--gold)" }}>
          <Sparkles className="w-3.5 h-3.5" /> {t("মানবতার সেবায় নিবেদিত", "Dedicated to humanity")}
        </span>
        <h1 className="mt-6 text-4xl md:text-6xl font-bold max-w-3xl leading-tight">
          {t("চাঁদগাঁও ফাউন্ডেশন — মানবতার সেবায় নিবেদিত", "Chandgaon Foundation — Dedicated to Humanity")}
        </h1>
        <p className="mt-4 text-2xl md:text-3xl font-semibold max-w-3xl leading-tight" style={{ color: "var(--gold)" }}>
          {t("আপনার একটি দান বদলে দিতে পারে একটি জীবন", "One donation from you can change a life")}
        </p>
        <p className="mt-6 max-w-xl text-base md:text-lg opacity-90 leading-relaxed">
          {t(
            "চাঁদগাঁও প্রবাসী ও যুবসমাজ কল্যান ফাউন্ডেশন — অসহায়, দরিদ্র ও দুঃস্থ মানুষের পাশে দাঁড়াতে আপনার সহযোগিতা কামনা করছে।",
            "Chandgaon Pravasi & Youth Welfare Foundation seeks your support to stand beside the helpless, poor and distressed."
          )}
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            to="/donate"
            className="inline-flex items-center gap-2 justify-center rounded-full px-8 py-3.5 text-sm font-semibold transition-transform hover:scale-105"
            style={{ background: "var(--gradient-gold)", color: "oklch(0.22 0.05 160)", boxShadow: "var(--shadow-gold)" }}
          >
            {t("এখনই দান করুন", "Donate Now")} <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/about"
            className="inline-flex items-center justify-center rounded-full px-8 py-3.5 text-sm font-semibold border border-white/30 hover:bg-white/10 transition-colors"
          >
            {t("আমাদের সম্পর্কে জানুন", "Learn About Us")}
          </Link>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const { t } = useLanguage();
  const items = [
    { n: t("১২,৫০০+", "12,500+"), l: t("উপকারভোগী", "Beneficiaries") },
    { n: t("৮৫+", "85+"), l: t("চলমান প্রকল্প", "Ongoing Projects") },
    { n: t("৩২০+", "320+"), l: t("সক্রিয় স্বেচ্ছাসেবক", "Active Volunteers") },
    { n: t("১৫ বছর", "15 Years"), l: t("নিরলস সেবা", "Tireless Service") },
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
  const { t } = useLanguage();
  return (
    <section className="max-w-7xl mx-auto px-6 py-20 md:py-28">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">{t("আমাদের পথচলা", "Our Journey")}</p>
        <h2 className="mt-3 text-3xl md:text-4xl font-bold">{t("লক্ষ্য ও দৃষ্টিভঙ্গি", "Mission & Vision")}</h2>
        <p className="mt-4 text-muted-foreground">
          {t("মানবতা, সহমর্মিতা ও দায়িত্ববোধই আমাদের পথ চলার মূলমন্ত্র।", "Humanity, empathy and responsibility are the core values that guide our journey.")}
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
            <h3 className="mt-6 text-2xl font-bold text-primary">{t("আমাদের লক্ষ্য", "Our Mission")}</h3>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              {t(
                "চাঁদগাঁও তথা বৃহত্তর কুমিল্লা অঞ্চলের দরিদ্র, অসহায় ও দুঃস্থ মানুষের পাশে দাঁড়িয়ে খাদ্য, শিক্ষা, চিকিৎসা ও সামাজিক সুরক্ষা নিশ্চিত করে একটি মানবিক সমাজ গড়ে তোলা।",
                "To stand beside the poor, helpless and distressed people of Chandgaon and the greater Comilla region, ensuring food, education, healthcare and social protection to build a humane society."
              )}
            </p>
            <ul className="mt-5 space-y-2 text-sm text-foreground/80">
              <li className="flex gap-2"><span style={{ color: "var(--gold)" }}>◆</span> {t("দারিদ্র্য বিমোচনে সক্রিয় ভূমিকা", "Active role in poverty alleviation")}</li>
              <li className="flex gap-2"><span style={{ color: "var(--gold)" }}>◆</span> {t("শিক্ষা ও স্বাস্থ্যে সমান সুযোগ", "Equal access to education and health")}</li>
              <li className="flex gap-2"><span style={{ color: "var(--gold)" }}>◆</span> {t("দুর্যোগে দ্রুত মানবিক সাড়া", "Rapid humanitarian response in disasters")}</li>
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
            <h3 className="mt-6 text-2xl font-bold" style={{ color: "var(--gold)" }}>{t("আমাদের দৃষ্টিভঙ্গি", "Our Vision")}</h3>
            <p className="mt-3 opacity-90 leading-relaxed">
              {t(
                "এমন একটি সমাজ গড়ে তোলা যেখানে কেউ ক্ষুধার্ত থাকবে না, কোনো শিশু শিক্ষা থেকে বঞ্চিত হবে না, এবং প্রতিটি মানুষ সম্মান ও মর্যাদা নিয়ে বাঁচতে পারবে।",
                "To build a society where no one goes hungry, no child is deprived of education, and every person can live with dignity and respect."
              )}
            </p>
            <ul className="mt-5 space-y-2 text-sm opacity-90">
              <li className="flex gap-2"><span style={{ color: "var(--gold)" }}>★</span> {t("স্বচ্ছ ও জবাবদিহিমূলক ব্যবস্থাপনা", "Transparent and accountable management")}</li>
              <li className="flex gap-2"><span style={{ color: "var(--gold)" }}>★</span> {t("প্রবাসী ও স্থানীয় ঐক্যের শক্তি", "Strength of expatriate and local unity")}</li>
              <li className="flex gap-2"><span style={{ color: "var(--gold)" }}>★</span> {t("টেকসই সামাজিক উন্নয়ন", "Sustainable social development")}</li>
            </ul>
          </div>
        </article>
      </div>
    </section>
  );
}

function Activities() {
  const { t } = useLanguage();
  const [items, setItems] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [shareFor, setShareFor] = useState<Activity | null>(null);
  const [detailFor, setDetailFor] = useState<Activity | null>(null);

  useEffect(() => {
    listActivities()
      .then((d) => setItems(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const visible = showAll ? items : items.slice(0, 4);

  return (
    <section id="activities" className="bg-secondary/40 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="flex items-start gap-3 mb-8">
          <span className="mt-1 w-1.5 h-12 rounded-full bg-primary" />
          <div>
            <h2 className="text-2xl md:text-4xl font-bold uppercase tracking-tight">{t("আমাদের কার্যক্রম", "Our Activities")}</h2>
            <p className="mt-1 text-xs md:text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              {t("সরাসরি একটি কার্যক্রমে দান করতে ডোনেট চাপুন", "Tap Donate to give directly to an activity")}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground py-12">{t("লোড হচ্ছে...", "Loading...")}</div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
            {t("এখনও কোনো কার্যক্রম প্রকাশ করা হয়নি।", "No activities have been published yet.")}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {visible.map((a) => (
                <article key={a.id} className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col">
                  <div className="relative aspect-[4/3] bg-secondary/40 overflow-hidden">
                    {a.imageUrl ? (
                      <img src={a.imageUrl} alt={a.title} className="w-full h-full object-cover" loading="lazy" width={400} height={300} />
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
                        search={{ purpose: a.category }}
                        className="inline-flex items-center justify-center gap-1 rounded-full px-2 py-2 text-xs font-semibold text-primary-foreground bg-primary hover:opacity-90 transition"
                      >
                        <Heart className="w-3.5 h-3.5" /> {t("ডোনেট", "Donate")}
                      </Link>
                      <button
                        type="button"
                        onClick={() => setShareFor(a)}
                        className="inline-flex items-center justify-center gap-1 rounded-full px-2 py-2 text-xs font-semibold border border-border hover:border-primary hover:text-primary transition"
                      >
                        <Share2 className="w-3.5 h-3.5" /> {t("শেয়ার", "Share")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDetailFor(a)}
                        className="inline-flex items-center justify-center gap-1 rounded-full px-2 py-2 text-xs font-semibold border border-border hover:border-primary hover:text-primary transition"
                      >
                        <ArrowRight className="w-3.5 h-3.5" /> {t("বিস্তারিত", "Details")}
                      </button>
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
                  {showAll
                    ? t("কম দেখান", "Show less")
                    : t(`আমাদের আরও কার্যক্রম দেখুন (${items.length - 4} টি)`, `View more activities (${items.length - 4})`)}
                  <ArrowRight className={`w-4 h-4 transition-transform ${showAll ? "rotate-90" : ""}`} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {shareFor && <ShareModal activity={shareFor} onClose={() => setShareFor(null)} />}
      {detailFor && <DetailModal activity={detailFor} onClose={() => setDetailFor(null)} />}
    </section>
  );
}

function ShareModal({ activity, onClose }: { activity: Activity; onClose: () => void }) {
  const { t } = useLanguage();
  const url = typeof window !== "undefined" ? `${window.location.origin}/activities` : "/activities";
  const text = `${activity.title} — ${t("চাঁদগাঁও ফাউন্ডেশন", "Chandgaon Foundation")}`;
  const enc = encodeURIComponent;
  const links = [
    { label: "Facebook", icon: Facebook, color: "#1877F2", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}&quote=${enc(text)}` },
    { label: "WhatsApp", icon: MessageCircle, color: "#25D366", href: `https://wa.me/?text=${enc(text + "\n" + url)}` },
    { label: "Twitter", icon: Twitter, color: "#1DA1F2", href: `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}` },
    { label: "Messenger", icon: Send, color: "#0084FF", href: `https://www.facebook.com/dialog/send?link=${enc(url)}&app_id=140586622674265&redirect_uri=${enc(url)}` },
  ];
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      toast.success(t("লিঙ্ক কপি হয়েছে", "Link copied"));
    } catch {
      toast.error(t("কপি করা যায়নি", "Could not copy"));
    }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="bg-card rounded-3xl max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{t("শেয়ার করুন", "Share")}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-accent" aria-label={t("বন্ধ করুন", "Close")}><X className="w-4 h-4" /></button>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-5">{activity.title}</p>
        <div className="grid grid-cols-4 gap-3">
          {links.map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-accent transition">
              <span className="w-12 h-12 rounded-full grid place-items-center text-white" style={{ background: l.color }}>
                <l.icon className="w-5 h-5" />
              </span>
              <span className="text-[11px] font-semibold">{l.label}</span>
            </a>
          ))}
        </div>
        <button onClick={copyLink} className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold border border-border hover:bg-accent">
          <LinkIcon className="w-4 h-4" /> {t("লিঙ্ক কপি করুন", "Copy link")}
        </button>
      </div>
    </div>
  );
}

function DetailModal({ activity, onClose }: { activity: Activity; onClose: () => void }) {
  const { t } = useLanguage();
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-card rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-8" onClick={(e) => e.stopPropagation()}>
        {activity.imageUrl && (
          <img src={activity.imageUrl} alt={activity.title} className="w-full max-h-72 object-cover" />
        )}
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 mb-3">
            <span className="inline-block text-[11px] font-semibold uppercase tracking-wide text-primary px-2.5 py-1 rounded-full" style={{ background: "color-mix(in oklab, var(--accent) 40%, transparent)" }}>
              {activity.category}
            </span>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-accent" aria-label={t("বন্ধ করুন", "Close")}><X className="w-4 h-4" /></button>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold">{activity.title}</h3>
          <p className="mt-2 text-xs text-muted-foreground">📅 {activity.date} · 📍 {activity.location}</p>
          <p className="mt-4 text-sm leading-relaxed whitespace-pre-wrap">{activity.description}</p>
          <div className="mt-6 flex gap-2">
            <Link
              to="/donate"
              search={{ purpose: activity.category }}
              className="flex-1 inline-flex items-center justify-center gap-1 rounded-full px-4 py-2.5 text-sm font-semibold text-primary-foreground bg-primary"
            >
              <Heart className="w-4 h-4" /> {t("এই কার্যক্রমে ডোনেট করুন", "Donate to this activity")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}




function DonationSection() {
  const { t } = useLanguage();
  const tiers = [
    { amt: t("৫০০", "500"), l: t("একটি পরিবারের সপ্তাহের খাবার", "A week of food for one family") },
    { amt: t("১,০০০", "1,000"), l: t("একজন শিক্ষার্থীর মাসিক বৃত্তি", "Monthly stipend for one student") },
    { amt: t("২,৫০০", "2,500"), l: t("একটি শীতবস্ত্রের প্যাকেজ", "One winter clothing package") },
    { amt: t("৫,০০০", "5,000"), l: t("একজন রোগীর চিকিৎসা সহায়তা", "Medical aid for one patient") },
  ];
  return (
    <section className="max-w-7xl mx-auto px-6 py-20 md:py-28">
      <div className="rounded-3xl overflow-hidden border border-border" style={{ boxShadow: "var(--shadow-elegant)" }}>
        <div className="grid md:grid-cols-2">
          <div className="p-8 md:p-12 text-primary-foreground relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
            <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full opacity-20" style={{ background: "var(--gradient-gold)" }} />
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--gold)" }}>{t("দান করুন", "Donate")}</p>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold leading-tight">
                {t("আপনার সাহায্যে", "Your support can")} <br />
                {t("বদলাবে", "change")} <span style={{ color: "var(--gold)" }}>{t("একটি জীবন", "a life")}</span>
              </h2>
              <p className="mt-5 opacity-90 leading-relaxed">
                {t(
                  "বিকাশ, নগদ, রকেট অথবা ব্যাংক — যেকোনো মাধ্যমে নিরাপদে দান করুন। প্রতিটি দানের জন্য পাবেন ডিজিটাল রসিদ ও TX ID যাচাইয়ের সুবিধা।",
                  "Donate securely via bKash, Nagad, Rocket or bank. Every donation comes with a digital receipt and TX ID verification."
                )}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/donate"
                  className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold transition-transform hover:scale-105"
                  style={{ background: "var(--gradient-gold)", color: "oklch(0.22 0.05 160)", boxShadow: "var(--shadow-gold)" }}
                >
                  {t("এখনই দান করুন", "Donate Now")} <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/donations" className="inline-flex items-center rounded-full px-7 py-3 text-sm font-semibold border border-white/30 hover:bg-white/10">
                  {t("দান যাচাই", "Verify Donation")}
                </Link>
              </div>
            </div>
          </div>
          <div className="p-8 md:p-12 bg-card">
            <h3 className="text-lg font-semibold text-primary">{t("যেকোনো পরিমাণ অর্থই মূল্যবান", "Every amount matters")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t("নিচের একটি বেছে নিন অথবা নিজের পছন্দমতো পরিমাণ লিখুন।", "Pick one below or enter your own amount.")}</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {tiers.map((tier) => (
                <Link
                  key={tier.amt}
                  to="/donate"
                  className="group rounded-xl border border-border p-4 hover:border-primary hover:bg-secondary/40 transition-all"
                >
                  <div className="text-xl font-bold text-primary">৳ {tier.amt}</div>
                  <div className="mt-1 text-xs text-muted-foreground leading-snug">{tier.l}</div>
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
  const { t } = useLanguage();
  const fallback = [
    { src: galFood, t: t("খাদ্য বিতরণ", "Food Distribution") },
    { src: galEdu, t: t("শিক্ষা বৃত্তি", "Education Scholarship") },
    { src: galMed, t: t("স্বাস্থ্য ক্যাম্প", "Health Camp") },
    { src: galWinter, t: t("শীতবস্ত্র", "Winter Clothing") },
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
          setItems(data.map((g) => ({ src: g.media_url, t: g.title || t("গ্যালারি", "Gallery") })));
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section id="gallery" className="bg-secondary/40 border-y border-border">
      <div className="max-w-7xl mx-auto px-6 py-20 md:py-28">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">{t("গ্যালারি", "Gallery")}</p>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold">{t("মাঠের কিছু মুহূর্ত", "Moments from the Field")}</h2>
          </div>
          <Link to="/gallery" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
            {t("পুরো গ্যালারি", "Full Gallery")} <ArrowRight className="w-4 h-4" />
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
  const { t } = useLanguage();
  const { settings } = useFoundationSettings();
  const submit = useCallback(async (payload: { name: string; email: string; message: string }) => {
    const { submitContactMessage } = await import("@/lib/contact.functions");
    return submitContactMessage({ data: payload });
  }, []);
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    try {
      const message = form.phone ? `${form.message}\n\n${t("ফোন", "Phone")}: ${form.phone}` : form.message;
      await submit({ name: form.name, email: form.email, message });
      toast.success(t("আপনার বার্তা পাঠানো হয়েছে। ধন্যবাদ!", "Your message has been sent. Thank you!"));
      setForm({ name: "", phone: "", email: "", message: "" });
      setSent(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("বার্তা পাঠানো যায়নি", "Could not send message"));
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="max-w-7xl mx-auto px-6 py-20 md:py-28">
      <div className="grid lg:grid-cols-2 gap-10 items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">{t("যোগাযোগ", "Contact")}</p>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold">{t("আমাদের সাথে কথা বলুন", "Talk to us")}</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            {t(
              "আপনার যেকোনো জিজ্ঞাসা, সহযোগিতার প্রস্তাব বা স্বেচ্ছাসেবক হওয়ার আগ্রহ জানাতে আমাদের সাথে যোগাযোগ করুন।",
              "Reach out to us with any question, offer of support, or interest in volunteering."
            )}
          </p>
          <ul className="mt-8 space-y-5">
            <li className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl grid place-items-center text-primary-foreground shrink-0" style={{ background: "var(--gradient-hero)" }}>
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">{t("ঠিকানা", "Address")}</div>
                <div className="text-sm text-muted-foreground">{settings?.address || t("চাঁদগাঁও, লাকসাম, কুমিল্লা, বাংলাদেশ", "Chandgaon, Laksam, Comilla, Bangladesh")}</div>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl grid place-items-center text-primary-foreground shrink-0" style={{ background: "var(--gradient-hero)" }}>
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">{t("ফোন", "Phone")}</div>
                <div className="text-sm text-muted-foreground">{settings?.phone || "—"}</div>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl grid place-items-center text-primary-foreground shrink-0" style={{ background: "var(--gradient-hero)" }}>
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">{t("ইমেইল", "Email")}</div>
                <div className="text-sm text-muted-foreground">{settings?.email || "—"}</div>
              </div>
            </li>
          </ul>
        </div>

        <form
          onSubmit={onSubmit}
          className="bg-card rounded-3xl p-7 md:p-9 border border-border"
          style={{ boxShadow: "var(--shadow-elegant)" }}
        >
          <h3 className="text-lg font-semibold text-primary">{t("বার্তা পাঠান", "Send a message")}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{t("আমরা ২৪ ঘণ্টার মধ্যে যোগাযোগ করব।", "We will respond within 24 hours.")}</p>
          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-medium text-foreground/80">{t("নাম", "Name")}</span>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-foreground/80">{t("ফোন", "Phone")}</span>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </label>
          </div>
          <label className="block mt-4">
            <span className="text-xs font-medium text-foreground/80">{t("ইমেইল", "Email")}</span>
            <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </label>
          <label className="block mt-4">
            <span className="text-xs font-medium text-foreground/80">{t("বার্তা", "Message")}</span>
            <textarea required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </label>
          <button
            type="submit"
            disabled={sending}
            className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-60"
            style={{ background: "var(--gradient-hero)" }}
          >
            {sending ? t("পাঠানো হচ্ছে...", "Sending...") : sent ? t("ধন্যবাদ! ✓", "Thank you! ✓") : (<>{t("পাঠান", "Send")} <Send className="w-4 h-4" /></>)}
          </button>
          <p className="mt-3 text-[11px] text-center text-muted-foreground">
            {t("অথবা সরাসরি যোগাযোগ পৃষ্ঠায় যান —", "Or go directly to the contact page —")}{" "}
            <Link to="/contact" className="text-primary font-medium hover:underline">{t("যোগাযোগ", "Contact")}</Link>
          </p>
        </form>
      </div>
    </section>
  );
}
