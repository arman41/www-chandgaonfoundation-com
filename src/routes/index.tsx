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
  Target, Eye, Sparkles, ArrowRight, Phone, Mail, MapPin, Send,
  HeartHandshake, Users, HandHeart, Building2,
  GraduationCap, Stethoscope, Utensils, Droplets, Snowflake, Home as HomeIcon,
  BookOpen, Baby, Wheat, TreePine, Quote, Star, ShieldCheck, Clock,
  Facebook, MessageCircle,
} from "lucide-react";
import { listActivities, type Activity } from "@/lib/activities";
import { listActiveProjects, type AidProject } from "@/lib/aid-projects";
import { ActivityCard, ShareModal, DetailModal } from "@/components/ActivityCard";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "চাঁদগাঁও ফাউন্ডেশন — মানবতার সেবায়" },
      { name: "description", content: "চাঁদগাঁওয়ের প্রবাসী ও যুবসমাজের উদ্যোগে পরিচালিত একটি অলাভজনক দাতব্য ফাউন্ডেশন। দান, স্বেচ্ছাসেবা ও মানবিক সহায়তায় আমাদের সাথে যুক্ত হন।" },
      { property: "og:title", content: "চাঁদগাঁও ফাউন্ডেশন — মানবতার সেবায়" },
      { property: "og:description", content: "চাঁদগাঁওয়ের প্রবাসী ও যুবসমাজের উদ্যোগে পরিচালিত একটি অলাভজনক দাতব্য ফাউন্ডেশন। দান, স্বেচ্ছাসেবা ও মানবিক সহায়তায় আমাদের সাথে যুক্ত হন।" },
      { property: "og:url", content: "https://www.chandgaonfundition.xyz/" },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "চাঁদগাঁও ফাউন্ডেশন — মানবতার সেবায়" },
      { name: "twitter:description", content: "চাঁদগাঁওয়ের প্রবাসী ও যুবসমাজের উদ্যোগে পরিচালিত একটি অলাভজনক দাতব্য ফাউন্ডেশন। দান, স্বেচ্ছাসেবা ও মানবিক সহায়তায় আমাদের সাথে যুক্ত হন।" },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/3a9de8da-5e08-4d53-8899-666f76541ef8" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "চাঁদগাঁও ফাউন্ডেশন — মানবতার সেবায় নিবেদিত" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/3a9de8da-5e08-4d53-8899-666f76541ef8" },
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
      <FeaturedCampaigns />
      <EmergencyAppeal />
      <Services />
      <MissionVision />
      <Impact />
      <Activities />
      <RecentNotices />
      <Testimonials />
      <VolunteerCta />
      <DonationSection />
      <DonationMethods />
      <Partners />
      <Gallery />
      <Contact />
    </>
  );
}

/* ---------------- HERO ---------------- */
function Hero() {
  const { t } = useLanguage();
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroImg} alt={t("ত্রাণ বিতরণ", "Relief distribution")} className="w-full h-full object-cover" width={1600} height={1100} fetchPriority="high" decoding="async" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(120deg, oklch(0.18 0.06 148 / 0.95) 0%, oklch(0.2 0.07 148 / 0.72) 55%, oklch(0.2 0.07 148 / 0.35) 100%)" }} />
      </div>
      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 py-20 md:py-36 text-primary-foreground">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border border-white/25 backdrop-blur-sm" style={{ color: "var(--gold)" }}>
          <Sparkles className="w-3.5 h-3.5" /> {t("মানবতার সেবায় নিবেদিত", "Dedicated to humanity")}
        </span>
        <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-bold max-w-3xl leading-tight tracking-tight">
          {t("মানবতা শুরু হয় সহমর্মিতা থেকে", "Humanity Begins With Compassion")}
        </h1>
        <p className="mt-6 max-w-xl text-base md:text-lg opacity-90 leading-relaxed">
          {t(
            "চাঁদগাঁও প্রবাসী ও যুবসমাজ কল্যান ফাউন্ডেশন — অসহায়, দরিদ্র ও দুঃস্থ মানুষের পাশে দাঁড়াতে আপনার সহযোগিতা কামনা করছে।",
            "Chandgaon Pravasi & Youth Welfare Foundation seeks your support to stand beside the helpless, poor and distressed."
          )}
        </p>
        <div className="mt-10 flex flex-wrap gap-3 sm:gap-4">
          <Link
            to="/donate"
            className="inline-flex items-center gap-2 justify-center rounded-full px-6 sm:px-8 py-3 sm:py-3.5 text-sm font-semibold transition-transform hover:scale-105"
            style={{ background: "var(--gradient-gold)", color: "oklch(0.22 0.05 160)", boxShadow: "var(--shadow-gold)" }}
          >
            {t("এখনই দান করুন", "Donate Now")} <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/membership"
            className="inline-flex items-center gap-2 justify-center rounded-full px-6 sm:px-8 py-3 sm:py-3.5 text-sm font-semibold bg-white/10 backdrop-blur-sm border border-white/30 hover:bg-white/20 transition-colors"
          >
            <HandHeart className="w-4 h-4" /> {t("স্বেচ্ছাসেবক হোন", "Become Volunteer")}
          </Link>
          <Link
            to="/help"
            className="inline-flex items-center gap-2 justify-center rounded-full px-6 sm:px-8 py-3 sm:py-3.5 text-sm font-semibold border border-white/30 hover:bg-white/10 transition-colors"
          >
            {t("সাহায্যের আবেদন", "Apply For Help")}
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------------- STATS ---------------- */
function Stats() {
  const { t } = useLanguage();
  const items = [
    { n: t("১২,৫০০+", "12,500+"), l: t("উপকারভোগী", "Beneficiaries"), i: Users },
    { n: t("৮৫+", "85+"), l: t("চলমান প্রকল্প", "Ongoing Projects"), i: Target },
    { n: t("৩২০+", "320+"), l: t("সক্রিয় স্বেচ্ছাসেবক", "Active Volunteers"), i: HandHeart },
    { n: t("১৫ বছর", "15 Years"), l: t("নিরলস সেবা", "Tireless Service"), i: ShieldCheck },
  ];
  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-6 -mt-12 relative z-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden bg-border" style={{ boxShadow: "var(--shadow-elegant)" }}>
        {items.map((it) => (
          <div key={it.l} className="bg-card p-5 md:p-7 text-center">
            <it.i className="w-6 h-6 mx-auto mb-2 text-primary" style={{ color: "var(--gold)" }} />
            <div className="text-2xl md:text-3xl font-bold text-primary">{it.n}</div>
            <div className="mt-1 text-xs md:text-sm text-muted-foreground">{it.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- FEATURED CAMPAIGNS ---------------- */
function fmtNum(n: number) {
  return n.toLocaleString("bn-BD", { maximumFractionDigits: 0 });
}
function FeaturedCampaigns() {
  const { t } = useLanguage();
  const [items, setItems] = useState<AidProject[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    listActiveProjects().then((d) => setItems(d.slice(0, 3))).finally(() => setLoading(false));
  }, []);

  if (!loading && items.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-6 py-16 md:py-24">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">{t("চলমান ক্যাম্পেইন", "Featured Campaigns")}</p>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold">{t("আপনার দান যেসব প্রকল্পে যাবে", "Where your donation goes")}</h2>
        </div>
        <Link to="/activities" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
          {t("সকল ক্যাম্পেইন", "All campaigns")} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      {loading ? (
        <div className="text-center text-muted-foreground py-10">{t("লোড হচ্ছে...", "Loading...")}</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((p) => {
            const goal = Number(p.goal_amount ?? p.budget ?? 0);
            const raised = Number(p.raised_amount ?? 0);
            const pct = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
            const remaining = Math.max(0, goal - raised);
            return (
              <article key={p.id} className="group rounded-2xl overflow-hidden bg-card border border-border transition-all hover:-translate-y-1" style={{ boxShadow: "var(--shadow-elegant)" }}>
                <div className="aspect-[16/10] relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
                  <div className="absolute inset-0 opacity-30" style={{ background: "var(--gradient-gold)" }} />
                  <div className="absolute inset-0 grid place-items-center text-primary-foreground">
                    <HeartHandshake className="w-16 h-16 opacity-90" />
                  </div>
                  <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/95 text-primary">
                    {p.category}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg leading-snug line-clamp-2 min-h-[3rem]">{p.name}</h3>
                  {p.description && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{p.description}</p>}
                  {goal > 0 && (
                    <div className="mt-4">
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: "var(--gradient-gold)" }} />
                      </div>
                      <div className="mt-2 flex justify-between text-xs">
                        <span className="font-bold text-primary">৳{fmtNum(raised)}</span>
                        <span className="text-muted-foreground">{t("লক্ষ্য", "Goal")}: ৳{fmtNum(goal)}</span>
                      </div>
                      <div className="mt-1 text-[11px] text-muted-foreground">
                        {t("বাকি", "Remaining")}: ৳{fmtNum(remaining)} · {pct}%
                      </div>
                    </div>
                  )}
                  <div className="mt-4 flex gap-2">
                    <Link to="/donate" className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full py-2.5 text-xs font-bold text-primary-foreground" style={{ background: "var(--gradient-hero)" }}>
                      <HeartHandshake className="w-4 h-4" /> {t("দান করুন", "Donate")}
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        if (navigator.share) navigator.share({ title: p.name, text: p.description ?? "", url: window.location.href }).catch(() => {});
                        else { navigator.clipboard?.writeText(window.location.href); toast.success(t("লিংক কপি হয়েছে", "Link copied")); }
                      }}
                      className="inline-flex items-center justify-center rounded-full w-10 h-10 border border-border hover:bg-secondary"
                      aria-label={t("শেয়ার", "Share")}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

/* ---------------- EMERGENCY APPEAL ---------------- */
function EmergencyAppeal() {
  const { t } = useLanguage();
  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-6 pb-8">
      <div className="relative overflow-hidden rounded-3xl border border-destructive/30 p-6 md:p-10" style={{ background: "linear-gradient(120deg, oklch(0.35 0.15 25) 0%, oklch(0.28 0.12 30) 100%)" }}>
        <div className="absolute -right-16 -top-16 w-60 h-60 rounded-full opacity-20" style={{ background: "var(--gradient-gold)" }} />
        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
          <div className="flex items-start gap-4 text-primary-foreground">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl grid place-items-center shrink-0" style={{ background: "var(--gradient-gold)", color: "oklch(0.22 0.05 160)" }}>
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-white/15 mb-2">
                {t("জরুরি আবেদন", "Emergency Appeal")}
              </span>
              <h2 className="text-2xl md:text-3xl font-bold leading-tight">
                {t("দুর্যোগে মানবিক সাড়ায় আপনার পাশে দরকার", "Urgent humanitarian response — we need you")}
              </h2>
              <p className="mt-2 text-sm md:text-base opacity-90 max-w-2xl">
                {t(
                  "বন্যা, শীতার্ত ও দুর্যোগ কবলিত পরিবারদের জরুরি খাদ্য, ওষুধ ও আশ্রয়ে পাশে দাঁড়ান — প্রতিটি টাকা সরাসরি কাজে লাগবে।",
                  "Stand beside families hit by floods, cold waves and disasters — every taka goes directly to food, medicine and shelter."
                )}
              </p>
            </div>
          </div>
          <Link
            to="/donate"
            className="shrink-0 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold whitespace-nowrap"
            style={{ background: "var(--gradient-gold)", color: "oklch(0.22 0.05 160)", boxShadow: "var(--shadow-gold)" }}
          >
            {t("এখনই সাহায্য করুন", "Donate Now")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------------- SERVICES ---------------- */
function Services() {
  const { t } = useLanguage();
  const items = [
    { i: GraduationCap, name: t("শিক্ষা", "Education") },
    { i: Stethoscope, name: t("চিকিৎসা", "Medical") },
    { i: Droplets, name: t("বন্যা ত্রাণ", "Flood Relief") },
    { i: Utensils, name: t("খাদ্য বিতরণ", "Food Distribution") },
    { i: Building2, name: t("মসজিদ নির্মাণ", "Mosque Construction") },
    { i: TreePine, name: t("টিউবওয়েল স্থাপন", "Tube Wells") },
    { i: Snowflake, name: t("শীতবস্ত্র", "Winter Support") },
    { i: Wheat, name: t("কুরবানি", "Qurbani") },
    { i: HeartHandshake, name: t("যাকাত", "Zakat") },
    { i: Baby, name: t("অনাথ সেবা", "Orphan Care") },
  ];
  return (
    <section id="services" className="bg-secondary/40 border-y border-border">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 py-16 md:py-24">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">{t("আমাদের সেবা", "Our Services")}</p>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold">{t("যেসব ক্ষেত্রে আমরা কাজ করি", "Areas we work in")}</h2>
          <p className="mt-3 text-muted-foreground">
            {t("সমগ্র মানবিক চাহিদায় সাড়া দিতে বহুমুখী কার্যক্রম।", "Multi-sector programs that respond to the full spectrum of human need.")}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          {items.map((s) => (
            <div key={s.name} className="group rounded-2xl bg-card border border-border p-4 sm:p-5 text-center hover:border-primary hover:-translate-y-1 transition-all" style={{ boxShadow: "0 4px 20px -12px oklch(0.32 0.09 148 / 0.15)" }}>
              <div className="mx-auto w-11 h-11 sm:w-12 sm:h-12 rounded-2xl grid place-items-center text-primary-foreground group-hover:scale-110 transition-transform" style={{ background: "var(--gradient-hero)" }}>
                <s.i className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="mt-3 text-xs sm:text-sm font-semibold text-foreground/90 leading-snug">{s.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- MISSION / VISION ---------------- */
function MissionVision() {
  const { t } = useLanguage();
  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-6 py-16 md:py-24">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">{t("আমাদের পথচলা", "Our Journey")}</p>
        <h2 className="mt-3 text-3xl md:text-4xl font-bold">{t("লক্ষ্য ও দৃষ্টিভঙ্গি", "Mission & Vision")}</h2>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <article className="relative overflow-hidden rounded-3xl p-8 md:p-10 border border-border bg-card" style={{ boxShadow: "var(--shadow-elegant)" }}>
          <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full opacity-10" style={{ background: "var(--gradient-hero)" }} />
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl grid place-items-center text-primary-foreground" style={{ background: "var(--gradient-hero)" }}>
              <Target className="w-6 h-6" />
            </div>
            <h3 className="mt-6 text-2xl font-bold text-primary">{t("আমাদের লক্ষ্য", "Our Mission")}</h3>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              {t(
                "চাঁদগাঁও তথা বৃহত্তর কুমিল্লা অঞ্চলের দরিদ্র, অসহায় ও দুঃস্থ মানুষের পাশে দাঁড়িয়ে খাদ্য, শিক্ষা, চিকিৎসা ও সামাজিক সুরক্ষা নিশ্চিত করে একটি মানবিক সমাজ গড়ে তোলা।",
                "To stand beside the poor, helpless and distressed people of Chandgaon, ensuring food, education, healthcare and social protection to build a humane society."
              )}
            </p>
            <ul className="mt-5 space-y-2 text-sm text-foreground/80">
              <li className="flex gap-2"><span style={{ color: "var(--gold)" }}>◆</span> {t("দারিদ্র্য বিমোচনে সক্রিয় ভূমিকা", "Active role in poverty alleviation")}</li>
              <li className="flex gap-2"><span style={{ color: "var(--gold)" }}>◆</span> {t("শিক্ষা ও স্বাস্থ্যে সমান সুযোগ", "Equal access to education and health")}</li>
              <li className="flex gap-2"><span style={{ color: "var(--gold)" }}>◆</span> {t("দুর্যোগে দ্রুত মানবিক সাড়া", "Rapid humanitarian response in disasters")}</li>
            </ul>
          </div>
        </article>

        <article className="relative overflow-hidden rounded-3xl p-8 md:p-10 border text-primary-foreground" style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-elegant)" }}>
          <div className="absolute -left-10 -bottom-10 w-44 h-44 rounded-full opacity-20" style={{ background: "var(--gradient-gold)" }} />
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl grid place-items-center" style={{ background: "var(--gradient-gold)", color: "oklch(0.22 0.05 160)" }}>
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="mt-6 text-2xl font-bold" style={{ color: "var(--gold)" }}>{t("আমাদের দৃষ্টিভঙ্গি", "Our Vision")}</h3>
            <p className="mt-3 opacity-90 leading-relaxed">
              {t(
                "এমন একটি সমাজ গড়ে তোলা যেখানে কেউ ক্ষুধার্ত থাকবে না, কোনো শিশু শিক্ষা থেকে বঞ্চিত হবে না, এবং প্রতিটি মানুষ সম্মান ও মর্যাদা নিয়ে বাঁচতে পারবে।",
                "A society where no one goes hungry, no child is deprived of education, and every person can live with dignity and respect."
              )}
            </p>
            <ul className="mt-5 space-y-2 text-sm opacity-90">
              <li className="flex gap-2"><span style={{ color: "var(--gold)" }}>★</span> {t("স্বচ্ছ ও জবাবদিহিমূলক ব্যবস্থাপনা", "Transparent and accountable")}</li>
              <li className="flex gap-2"><span style={{ color: "var(--gold)" }}>★</span> {t("প্রবাসী ও স্থানীয় ঐক্যের শক্তি", "Expatriate and local unity")}</li>
              <li className="flex gap-2"><span style={{ color: "var(--gold)" }}>★</span> {t("টেকসই সামাজিক উন্নয়ন", "Sustainable social development")}</li>
            </ul>
          </div>
        </article>
      </div>
    </section>
  );
}

/* ---------------- IMPACT ---------------- */
function Impact() {
  const { t } = useLanguage();
  const items = [
    { n: "৳৪৫ লক্ষ+", nEn: "৳4.5M+", l: t("মোট বিতরণ", "Total distributed") },
    { n: "১,২০০+", nEn: "1,200+", l: t("পরিবার সহায়তা", "Families supported") },
    { n: "৯৫০+", nEn: "950+", l: t("দাতা", "Donors") },
    { n: "৫০+", nEn: "50+", l: t("এলাকা", "Areas served") },
  ];
  return (
    <section className="relative overflow-hidden text-primary-foreground" style={{ background: "var(--gradient-hero)" }}>
      <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full opacity-10" style={{ background: "var(--gradient-gold)" }} />
      <div className="max-w-7xl mx-auto px-5 sm:px-6 py-16 md:py-24 relative">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--gold)" }}>{t("প্রভাব", "Our Impact")}</p>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold">{t("সংখ্যায় আমাদের সাফল্যের গল্প", "Our story, told in numbers")}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {items.map((it) => (
            <div key={it.l} className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 p-6 text-center">
              <div className="text-3xl md:text-4xl font-bold" style={{ color: "var(--gold)" }}>{it.n}</div>
              <div className="mt-2 text-xs md:text-sm opacity-90">{it.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- ACTIVITIES (existing behavior) ---------------- */
function Activities() {
  const { t } = useLanguage();
  const [items, setItems] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [shareFor, setShareFor] = useState<Activity | null>(null);
  const [detailFor, setDetailFor] = useState<Activity | null>(null);

  useEffect(() => {
    listActivities().then((d) => setItems(d)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const visible = showAll ? items : items.slice(0, 4);

  return (
    <section id="activities" className="bg-secondary/40 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="flex items-start gap-3 mb-8">
          <span className="mt-1 w-1.5 h-12 rounded-full bg-primary" />
          <div>
            <h2 className="text-2xl md:text-4xl font-bold uppercase tracking-tight">{t("সাম্প্রতিক কার্যক্রম", "Recent Activities")}</h2>
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
                <ActivityCard key={a.id} a={a} onShare={setShareFor} onDetail={setDetailFor} />
              ))}
            </div>
            {items.length > 4 && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowAll((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-primary border-2 border-primary/30 hover:bg-primary/5 transition"
                >
                  {showAll ? t("কম দেখান", "Show less") : t(`আরও দেখুন (${items.length - 4} টি)`, `View more (${items.length - 4})`)}
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

/* ---------------- RECENT NOTICES ---------------- */
function RecentNotices() {
  const { t } = useLanguage();
  const [items, setItems] = useState<Array<{ id: string; title: string; content: string; image_url: string | null; published_at: string }>>([]);
  useEffect(() => {
    supabase
      .from("notices")
      .select("id,title,content,image_url,published_at")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(3)
      .then(({ data }) => setItems(data ?? []));
  }, []);
  if (items.length === 0) return null;
  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-6 py-16 md:py-24">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">{t("সাম্প্রতিক", "News & Notices")}</p>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold">{t("সর্বশেষ নোটিশ ও ঘোষণা", "Latest updates")}</h2>
        </div>
        <Link to="/notices" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
          {t("সব দেখুন", "View all")} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        {items.map((n) => (
          <Link key={n.id} to="/notices" className="group rounded-2xl overflow-hidden bg-card border border-border hover:-translate-y-1 transition-all" style={{ boxShadow: "var(--shadow-elegant)" }}>
            <div className="aspect-video overflow-hidden bg-secondary">
              {n.image_url ? (
                <img src={n.image_url} alt={n.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full grid place-items-center text-primary-foreground" style={{ background: "var(--gradient-hero)" }}>
                  <BookOpen className="w-12 h-12 opacity-80" />
                </div>
              )}
            </div>
            <div className="p-5">
              <div className="text-xs text-muted-foreground mb-2">{new Date(n.published_at).toLocaleDateString("bn-BD")}</div>
              <h3 className="font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">{n.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{n.content}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ---------------- TESTIMONIALS ---------------- */
function Testimonials() {
  const { t } = useLanguage();
  const items = [
    {
      quote: t(
        "চাঁদগাঁও ফাউন্ডেশন আমার মেয়ের চিকিৎসায় পাশে দাঁড়িয়েছে — তাদের কাজের স্বচ্ছতায় আমি মুগ্ধ।",
        "Chandgaon Foundation stood beside my daughter's treatment — I am moved by the transparency of their work."
      ),
      name: t("রাহেলা বেগম", "Rahela Begum"),
      role: t("উপকারভোগী পরিবার", "Beneficiary family"),
    },
    {
      quote: t(
        "বিদেশে থেকেও প্রতিটি দানের ডিজিটাল রসিদ পাই — গ্রামের মানুষের জন্য কাজ করার এটাই সবচেয়ে বিশ্বস্ত মাধ্যম।",
        "Even from abroad, I receive digital receipts for every donation — the most trusted way to serve our village."
      ),
      name: t("মোঃ ইব্রাহিম", "Md. Ibrahim"),
      role: t("প্রবাসী দাতা, দুবাই", "Expat donor, Dubai"),
    },
    {
      quote: t(
        "স্বেচ্ছাসেবক হিসেবে কাজ করে আমার জীবনের সবচেয়ে অর্থবহ অভিজ্ঞতা পেয়েছি।",
        "Volunteering here has been the most meaningful experience of my life."
      ),
      name: t("সাদিয়া আক্তার", "Sadia Akter"),
      role: t("সক্রিয় স্বেচ্ছাসেবক", "Active Volunteer"),
    },
  ];
  return (
    <section className="bg-secondary/40 border-y border-border">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 py-16 md:py-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">{t("মতামত", "Voices")}</p>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold">{t("যাদের জীবনে বদল এসেছে", "Stories from those we've touched")}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {items.map((it) => (
            <blockquote key={it.name} className="rounded-2xl bg-card border border-border p-6 relative" style={{ boxShadow: "var(--shadow-elegant)" }}>
              <Quote className="absolute -top-3 left-6 w-8 h-8 p-1.5 rounded-full text-primary-foreground" style={{ background: "var(--gradient-hero)" }} />
              <div className="flex gap-0.5 mb-3" style={{ color: "var(--gold)" }}>
                {[0, 1, 2, 3, 4].map((i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed italic">"{it.quote}"</p>
              <footer className="mt-5 pt-4 border-t border-border">
                <div className="font-bold text-sm">{it.name}</div>
                <div className="text-xs text-muted-foreground">{it.role}</div>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- VOLUNTEER CTA ---------------- */
function VolunteerCta() {
  const { t } = useLanguage();
  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-6 py-16 md:py-24">
      <div className="grid md:grid-cols-2 rounded-3xl overflow-hidden border border-border" style={{ boxShadow: "var(--shadow-elegant)" }}>
        <div className="p-8 md:p-12 bg-card">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">{t("স্বেচ্ছাসেবক", "Volunteer")}</p>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold">{t("আমাদের সাথে যুক্ত হন", "Join our mission")}</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            {t(
              "সময়, দক্ষতা কিংবা সহমর্মিতা — যেকোনোভাবে যুক্ত হয়ে পাশে দাঁড়ান। প্রশিক্ষণ, স্মার্ট আইডি কার্ড ও সম্প্রদায়ের অংশ হওয়ার সুযোগ।",
              "Contribute your time, skill or compassion. Get training, a smart ID card and be part of a driven community."
            )}
          </p>
          <ul className="mt-5 space-y-2 text-sm">
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> {t("বিনামূল্যে প্রশিক্ষণ", "Free training")}</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> {t("স্মার্ট ভলান্টিয়ার আইডি", "Smart volunteer ID")}</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> {t("রেফারেন্স সার্টিফিকেট", "Reference certificate")}</li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/membership" className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-primary-foreground" style={{ background: "var(--gradient-hero)" }}>
              {t("এখনই যোগ দিন", "Join Now")} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <div className="relative min-h-[280px] overflow-hidden">
          <img src={galFood} alt={t("স্বেচ্ছাসেবক দল", "Volunteer team")} loading="lazy" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, oklch(0.28 0.08 148 / 0.2) 0%, transparent 60%)" }} />
        </div>
      </div>
    </section>
  );
}

/* ---------------- DONATION SECTION (existing behavior) ---------------- */
function DonationSection() {
  const { t } = useLanguage();
  const tiers = [
    { amt: t("৫০০", "500"), l: t("একটি পরিবারের সপ্তাহের খাবার", "A week of food for one family") },
    { amt: t("১,০০০", "1,000"), l: t("একজন শিক্ষার্থীর মাসিক বৃত্তি", "Monthly stipend for one student") },
    { amt: t("২,৫০০", "2,500"), l: t("একটি শীতবস্ত্রের প্যাকেজ", "One winter clothing package") },
    { amt: t("৫,০০০", "5,000"), l: t("একজন রোগীর চিকিৎসা সহায়তা", "Medical aid for one patient") },
  ];
  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-6 py-16 md:py-24">
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
                <Link to="/donate" className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold transition-transform hover:scale-105" style={{ background: "var(--gradient-gold)", color: "oklch(0.22 0.05 160)", boxShadow: "var(--shadow-gold)" }}>
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
                <Link key={tier.amt} to="/donate" className="group rounded-xl border border-border p-4 hover:border-primary hover:bg-secondary/40 transition-all">
                  <div className="text-xl font-bold text-primary">৳ {tier.amt}</div>
                  <div className="mt-1 text-xs text-muted-foreground leading-snug">{tier.l}</div>
                </Link>
              ))}
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground border-t border-border pt-5 flex-wrap">
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

/* ---------------- DONATION METHODS ---------------- */
function DonationMethods() {
  const { t } = useLanguage();
  const methods = [
    { name: "bKash", color: "#E2136E" },
    { name: "Nagad", color: "#F58220" },
    { name: "Rocket", color: "#8C3494" },
    { name: t("ইসলামি ব্যাংক", "Islami Bank"), color: "#00733E" },
  ];
  return (
    <section className="bg-secondary/40 border-y border-border">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 py-14 md:py-20">
        <div className="text-center max-w-xl mx-auto mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">{t("পেমেন্ট পদ্ধতি", "Payment Methods")}</p>
          <h2 className="mt-3 text-2xl md:text-3xl font-bold">{t("যেভাবে দান করতে পারেন", "Ways to donate")}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {methods.map((m) => (
            <Link key={m.name} to="/donate" className="group rounded-2xl bg-card border border-border p-5 text-center hover:-translate-y-1 hover:shadow-lg transition-all">
              <div className="mx-auto w-14 h-14 rounded-2xl grid place-items-center text-white font-black text-lg" style={{ background: m.color }}>
                {m.name.charAt(0)}
              </div>
              <div className="mt-3 font-bold text-sm">{m.name}</div>
              <div className="mt-1 text-[11px] text-muted-foreground">{t("বিস্তারিত দেখুন", "View details")}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- PARTNERS ---------------- */
function Partners() {
  const { t } = useLanguage();
  const partners = ["Chandgaon Youth", "Pravasi Kalyan", "Local Committee", "Union Council", "Youth Alliance", "Aid Network"];
  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-6 py-14 md:py-16">
      <div className="text-center mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t("আমাদের সহযোগী", "Our Partners & Supporters")}</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 items-center">
        {partners.map((p) => (
          <div key={p} className="h-16 rounded-xl border border-dashed border-border grid place-items-center text-xs font-semibold text-muted-foreground/70 hover:text-primary hover:border-primary/40 transition-colors px-3 text-center">
            {p}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- GALLERY (existing) ---------------- */
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
      <div className="max-w-7xl mx-auto px-5 sm:px-6 py-16 md:py-24">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">{t("গ্যালারি", "Gallery")}</p>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold">{t("মাঠের কিছু মুহূর্ত", "Moments from the Field")}</h2>
          </div>
          <Link to="/gallery" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
            {t("পুরো গ্যালারি", "Full Gallery")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {items.map((it, i) => (
            <figure key={`${it.t}-${i}`} className={`group relative overflow-hidden rounded-2xl border border-border ${i === 0 ? "md:col-span-2 md:row-span-2" : ""}`}>
              <img src={it.src} alt={it.t} loading="lazy" width={800} height={800} className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${i === 0 ? "aspect-square md:aspect-auto md:h-full" : "aspect-square"}`} />
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

/* ---------------- CONTACT (existing) ---------------- */
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
    <section id="contact" className="max-w-7xl mx-auto px-5 sm:px-6 py-16 md:py-24">
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
                <div className="text-sm text-muted-foreground">{t(settings?.address || "চাঁদগাঁও, লাকসাম, কুমিল্লা, বাংলাদেশ", "Chandgaon, Laksam, Comilla, Bangladesh")}</div>
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
          <div className="mt-8 flex flex-wrap gap-2">
            {settings?.facebook_url && (
              <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-10 h-10 rounded-full grid place-items-center bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
            )}
            {settings?.whatsapp_url && (
              <a href={settings.whatsapp_url} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="w-10 h-10 rounded-full grid place-items-center bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors">
                <MessageCircle className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        <form onSubmit={onSubmit} className="bg-card rounded-3xl p-7 md:p-9 border border-border" style={{ boxShadow: "var(--shadow-elegant)" }}>
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
          <button type="submit" disabled={sending} className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-60" style={{ background: "var(--gradient-hero)" }}>
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
