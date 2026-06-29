import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Calculator, HandCoins, Info } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/zakat-calculator")({
  head: () => ({
    meta: [
      { title: "Zakat Calculator — Chandgaon Foundation" },
      { name: "description", content: "Simple Zakat calculator for Bangladesh. Calculate accurate Zakat on gold, silver and cash, and donate through Chandgaon Foundation." },
      { property: "og:title", content: "Zakat Calculator — Chandgaon Foundation" },
      { property: "og:description", content: "Calculate accurate Zakat on gold, silver and cash, and donate directly through the foundation." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.chandgaonfundition.xyz/zakat-calculator" },
      { name: "twitter:title", content: "Zakat Calculator — Chandgaon Foundation" },
      { name: "twitter:description", content: "Calculate accurate Zakat on gold, silver and cash." },
      { property: "og:image", content: "https://www.chandgaonfundition.xyz/og-image.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Zakat Calculator — Chandgaon Foundation" },
      { name: "twitter:image", content: "https://www.chandgaonfundition.xyz/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://www.chandgaonfundition.xyz/zakat-calculator" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "What is Zakat and when does it become obligatory?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Zakat is one of the five pillars of Islam. When wealth reaches the Nisab threshold (approximately 87.48g of gold or 612.36g of silver in value) and is held for one lunar year, 2.5% Zakat becomes obligatory.",
              },
            },
            {
              "@type": "Question",
              name: "What is the rate of Zakat?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Zakat is payable on Zakat-eligible wealth at the rate of 2.5% (i.e. 1/40).",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: ZakatCalculator,
});

const GOLD_NISAB_GRAMS = 87.48;
const SILVER_NISAB_GRAMS = 612.36;
const ZAKAT_RATE = 0.025;

function ZakatCalculator() {
  const { t, lang } = useLanguage();
  const [goldGrams, setGoldGrams] = useState("");
  const [silverGrams, setSilverGrams] = useState("");
  const [cash, setCash] = useState("");
  const [business, setBusiness] = useState("");
  const [investments, setInvestments] = useState("");
  const [debtsReceivable, setDebtsReceivable] = useState("");
  const [liabilities, setLiabilities] = useState("");

  const [goldPrice, setGoldPrice] = useState("12500");
  const [silverPrice, setSilverPrice] = useState("140");

  const n = (v: string) => Number(v.replace(/[^0-9.]/g, "")) || 0;

  const r = useMemo(() => {
    const goldValue = n(goldGrams) * n(goldPrice);
    const silverValue = n(silverGrams) * n(silverPrice);
    const totalAssets =
      goldValue + silverValue + n(cash) + n(business) + n(investments) + n(debtsReceivable);
    const zakatable = Math.max(0, totalAssets - n(liabilities));

    const nisabGold = GOLD_NISAB_GRAMS * n(goldPrice);
    const nisabSilver = SILVER_NISAB_GRAMS * n(silverPrice);
    const nisab = Math.min(nisabGold || Infinity, nisabSilver || Infinity);
    const eligible = nisab !== Infinity && zakatable >= nisab;

    return {
      goldValue,
      silverValue,
      totalAssets,
      zakatable,
      nisab: nisab === Infinity ? 0 : nisab,
      eligible,
      zakat: eligible ? Math.round(zakatable * ZAKAT_RATE) : 0,
    };
  }, [goldGrams, silverGrams, cash, business, investments, debtsReceivable, liabilities, goldPrice, silverPrice]);

  const locale = lang === "bn" ? "bn-BD" : "en-US";
  const fmt = (v: number) => `৳ ${Math.round(v).toLocaleString(locale)}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <header className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          <Calculator className="w-3.5 h-3.5" /> Zakat Calculator
        </div>
        <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
          {t("যাকাত ক্যালকুলেটর", "Zakat Calculator")}
        </h1>
        <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
          {t(
            "ইসলামী শরীয়াহ অনুযায়ী আপনার স্বর্ণ, রূপা ও নগদ সম্পদের উপর ২.৫% হারে যাকাত হিসাব করুন। চাঁদগাঁও ফাউন্ডেশনের মাধ্যমে যাকাত প্রদান করে অসহায় পরিবারের পাশে দাঁড়ান।",
            "Calculate 2.5% Zakat on your gold, silver and cash assets according to Islamic Sharia. Give your Zakat through Chandgaon Foundation and stand beside families in need."
          )}
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-6">
        <section className="bg-card border border-border rounded-2xl p-5 sm:p-6 space-y-4" style={{ boxShadow: "var(--shadow-elegant)" }}>
          <h2 className="text-lg font-bold flex items-center gap-2"><HandCoins className="w-4 h-4 text-primary" /> {t("আপনার সম্পদ", "Your Wealth")}</h2>

          <Field label={t("স্বর্ণের পরিমাণ (গ্রাম)", "Gold (grams)")} id="gold-g">
            <input id="gold-g" inputMode="decimal" value={goldGrams} onChange={(e) => setGoldGrams(e.target.value)} placeholder={t("যেমন: 50", "e.g. 50")} className={inp} />
          </Field>
          <Field label={t("স্বর্ণের প্রতি গ্রাম মূল্য (৳)", "Gold price per gram (৳)")} id="gold-p">
            <input id="gold-p" inputMode="decimal" value={goldPrice} onChange={(e) => setGoldPrice(e.target.value)} className={inp} />
          </Field>

          <Field label={t("রূপার পরিমাণ (গ্রাম)", "Silver (grams)")} id="silver-g">
            <input id="silver-g" inputMode="decimal" value={silverGrams} onChange={(e) => setSilverGrams(e.target.value)} placeholder={t("যেমন: 200", "e.g. 200")} className={inp} />
          </Field>
          <Field label={t("রূপার প্রতি গ্রাম মূল্য (৳)", "Silver price per gram (৳)")} id="silver-p">
            <input id="silver-p" inputMode="decimal" value={silverPrice} onChange={(e) => setSilverPrice(e.target.value)} className={inp} />
          </Field>

          <Field label={t("নগদ অর্থ — ব্যাংক, হাতে, মোবাইল ব্যাংকিং (৳)", "Cash — bank, on hand, mobile banking (৳)")} id="cash">
            <input id="cash" inputMode="decimal" value={cash} onChange={(e) => setCash(e.target.value)} className={inp} />
          </Field>
          <Field label={t("ব্যবসার পণ্য / স্টক (৳)", "Business inventory / stock (৳)")} id="biz">
            <input id="biz" inputMode="decimal" value={business} onChange={(e) => setBusiness(e.target.value)} className={inp} />
          </Field>
          <Field label={t("বিনিয়োগ, শেয়ার, সঞ্চয়পত্র (৳)", "Investments, shares, savings certificates (৳)")} id="inv">
            <input id="inv" inputMode="decimal" value={investments} onChange={(e) => setInvestments(e.target.value)} className={inp} />
          </Field>
          <Field label={t("অন্যকে দেওয়া ঋণ (ফেরতযোগ্য) (৳)", "Loans receivable (৳)")} id="dr">
            <input id="dr" inputMode="decimal" value={debtsReceivable} onChange={(e) => setDebtsReceivable(e.target.value)} className={inp} />
          </Field>
          <Field label={t("পরিশোধযোগ্য ঋণ / দেনা (৳)", "Liabilities / payable debts (৳)")} id="liab">
            <input id="liab" inputMode="decimal" value={liabilities} onChange={(e) => setLiabilities(e.target.value)} className={inp} />
          </Field>
        </section>

        <section className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-5 sm:p-6" style={{ boxShadow: "var(--shadow-elegant)" }}>
            <h2 className="text-lg font-bold">{t("ফলাফল", "Result")}</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <Line label={t("মোট সম্পদ", "Total Wealth")} value={fmt(r.totalAssets)} />
              <Line label={t("দেনা বাদে যাকাত-যোগ্য সম্পদ", "Zakat-eligible Wealth (after debts)")} value={fmt(r.zakatable)} />
              <Line label={t("নিসাব (সর্বনিম্ন)", "Nisab (minimum)")} value={fmt(r.nisab)} />
            </dl>

            <div className="mt-5 p-4 rounded-xl" style={{ background: r.eligible ? "var(--gradient-gold)" : "var(--muted)", color: r.eligible ? "oklch(0.22 0.05 160)" : undefined }}>
              <p className="text-xs font-semibold uppercase tracking-wider opacity-80">{t("প্রদেয় যাকাত (২.৫%)", "Zakat Payable (2.5%)")}</p>
              <p className="text-3xl sm:text-4xl font-extrabold mt-1">{fmt(r.zakat)}</p>
              <p className="text-xs mt-2 opacity-90">
                {r.eligible
                  ? t("আপনার সম্পদ নিসাব পরিমাণ অতিক্রম করেছে — যাকাত ফরজ।", "Your wealth has crossed Nisab — Zakat is obligatory.")
                  : t("আপনার সম্পদ এখনো নিসাব পরিমাণ পৌঁছায়নি। যাকাত ফরজ নয়, তবে দান করতে পারেন।", "Your wealth has not yet reached Nisab. Zakat is not obligatory, but you may still donate.")}
              </p>
            </div>

            <Link
              to="/donate"
              search={{ purpose: "যাকাত / ফিতরা" }}
              className="mt-5 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-bold transition-transform hover:scale-[1.02]"
              style={{ background: "var(--gradient-hero)", color: "var(--primary-foreground)", boxShadow: "var(--shadow-elegant)" }}
            >
              {t("এই পরিমাণ যাকাত এখনই প্রদান করুন", "Pay this Zakat amount now")}
            </Link>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 text-xs leading-relaxed text-muted-foreground">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
              <div>
                <p className="font-semibold text-foreground mb-1">{t("দ্রষ্টব্য", "Note")}</p>
                <p>{t("স্বর্ণ/রূপার বাজারমূল্য পরিবর্তনশীল — সঠিক মূল্য দিয়ে হালনাগাদ করুন। এক চান্দ্র বছর সম্পদ হাতে থাকার পরই যাকাত ফরজ। সন্দেহ হলে স্থানীয় আলেমের পরামর্শ নিন।", "Gold/silver market prices change — update with current values. Zakat is due only after holding wealth for one lunar year. Consult a local scholar if in doubt.")}</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="mt-12 bg-card border border-border rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4">{t("যাকাত সম্পর্কিত প্রশ্ন", "Zakat FAQ")}</h2>
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold text-foreground">{t("যাকাত কী এবং কখন ফরজ হয়?", "What is Zakat and when does it become obligatory?")}</h3>
            <p className="mt-1 text-muted-foreground">{t("যাকাত ইসলামের পাঁচটি স্তম্ভের একটি। সম্পদ নিসাব পরিমাণ (প্রায় ৮৭.৪৮ গ্রাম স্বর্ণ বা ৬১২.৩৬ গ্রাম রূপার সমমূল্য) পৌঁছালে এবং তা এক চান্দ্র বছর হাতে থাকলে ২.৫% হারে যাকাত ফরজ হয়।", "Zakat is one of the five pillars of Islam. When wealth reaches Nisab (about 87.48g of gold or 612.36g of silver in value) and is held for one lunar year, 2.5% Zakat is obligatory.")}</p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{t("যাকাতের হার কত?", "What is the rate of Zakat?")}</h3>
            <p className="mt-1 text-muted-foreground">{t("যাকাত-যোগ্য সম্পদের উপর ২.৫% (অর্থাৎ ১/৪০ অংশ) হারে যাকাত আদায় করতে হয়।", "Zakat is payable at 2.5% (1/40) of your Zakat-eligible wealth.")}</p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{t("চাঁদগাঁও ফাউন্ডেশনে যাকাত দিলে কোথায় ব্যয় হয়?", "Where is Zakat spent if given to Chandgaon Foundation?")}</h3>
            <p className="mt-1 text-muted-foreground">{t("যাকাতের অর্থ শরীয়াহসম্মত আটটি খাত মেনে অসহায় পরিবার, এতিম, রোগীর চিকিৎসা ও শিক্ষাবৃত্তিতে ব্যয় করা হয়।", "Zakat funds are spent — following the eight Sharia-prescribed categories — on needy families, orphans, medical treatment and education scholarships.")}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

const inp = "w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm";

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold mb-1.5 text-foreground">{label}</label>
      {children}
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-border/60 pb-1.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
