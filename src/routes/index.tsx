import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <>
      <Hero />
      <Stats />
      <Programs />
      <CallToAction />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroImg} alt="ত্রাণ বিতরণ" className="w-full h-full object-cover" width={1600} height={1100} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(120deg, oklch(0.18 0.06 162 / 0.92) 0%, oklch(0.18 0.06 162 / 0.55) 60%, transparent 100%)" }} />
      </div>
      <div className="relative max-w-7xl mx-auto px-6 py-28 md:py-40 text-primary-foreground">
        <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold border border-white/20 backdrop-blur-sm" style={{ color: "var(--gold)" }}>
          ★ মানবতার সেবায় নিবেদিত
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
            className="inline-flex items-center justify-center rounded-full px-8 py-3.5 text-sm font-semibold transition-transform hover:scale-105"
            style={{ background: "var(--gradient-gold)", color: "oklch(0.22 0.05 160)", boxShadow: "var(--shadow-gold)" }}
          >
            এখনই দান করুন →
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

function Programs() {
  const cards = [
    {
      t: "খাদ্য সহায়তা",
      d: "প্রতি মাসে শত শত দরিদ্র পরিবারের ঘরে ঘরে পৌঁছে দেওয়া হয় চাল, ডাল ও নিত্যপ্রয়োজনীয় খাদ্যসামগ্রী।",
      i: "🍚",
    },
    {
      t: "শিক্ষা বৃত্তি",
      d: "মেধাবী কিন্তু অসচ্ছল শিক্ষার্থীদের জন্য মাসিক বৃত্তি, বইপত্র ও শিক্ষা উপকরণ সরবরাহ।",
      i: "📚",
    },
    {
      t: "চিকিৎসা সহায়তা",
      d: "বিনামূল্যে স্বাস্থ্য ক্যাম্প, ঔষধ বিতরণ এবং জটিল রোগীদের চিকিৎসা ব্যয়ভার বহন।",
      i: "🏥",
    },
    {
      t: "শীতবস্ত্র বিতরণ",
      d: "প্রতি শীতে অসহায় মানুষদের মাঝে কম্বল ও গরম কাপড় বিতরণ কর্মসূচি।",
      i: "🧥",
    },
    {
      t: "দুর্যোগ ত্রাণ",
      d: "বন্যা, ঘূর্ণিঝড় ও অন্যান্য প্রাকৃতিক দুর্যোগে দ্রুত ত্রাণ সহায়তা প্রদান।",
      i: "🌊",
    },
    {
      t: "মসজিদ ও কবরস্থান",
      d: "এলাকার মসজিদ সংস্কার, কবরস্থান রক্ষণাবেক্ষণ ও ধর্মীয় শিক্ষা কার্যক্রম পরিচালনা।",
      i: "🕌",
    },
  ];
  return (
    <section className="max-w-7xl mx-auto px-6 py-24">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">আমাদের কার্যক্রম</p>
        <h2 className="mt-3 text-3xl md:text-4xl font-bold">যে ছয়টি ক্ষেত্রে আমরা কাজ করছি</h2>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((c) => (
          <article key={c.t} className="group bg-card rounded-2xl p-7 border border-border hover:border-primary/30 transition-all hover:-translate-y-1" style={{ boxShadow: "0 1px 2px oklch(0 0 0 / 0.04)" }}>
            <div className="w-12 h-12 rounded-xl grid place-items-center text-2xl mb-5" style={{ background: "color-mix(in oklab, var(--accent) 30%, transparent)" }}>
              {c.i}
            </div>
            <h3 className="text-lg font-semibold text-primary">{c.t}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{c.d}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function CallToAction() {
  return (
    <section className="max-w-7xl mx-auto px-6 pb-20">
      <div className="rounded-3xl px-8 md:px-16 py-16 md:py-20 text-primary-foreground text-center relative overflow-hidden" style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-elegant)" }}>
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-20" style={{ background: "var(--gradient-gold)" }} />
        <h2 className="text-3xl md:text-5xl font-bold relative">
          আজই হোন <span style={{ color: "var(--gold)" }}>পরিবর্তনের অংশীদার</span>
        </h2>
        <p className="mt-5 max-w-xl mx-auto opacity-90 relative">
          আপনার ছোট্ট একটি দান গড়ে তুলতে পারে অনেক বড় পরিবর্তন। আজই এগিয়ে আসুন।
        </p>
        <Link
          to="/donate"
          className="mt-10 inline-flex items-center justify-center rounded-full px-10 py-4 text-base font-semibold transition-transform hover:scale-105 relative"
          style={{ background: "var(--gradient-gold)", color: "oklch(0.22 0.05 160)", boxShadow: "var(--shadow-gold)" }}
        >
          দান করুন
        </Link>
      </div>
    </section>
  );
}
