import { createFileRoute, Link } from "@tanstack/react-router";
import { Calculator, HandCoins, BookOpen, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/zakat-guide")({
  head: () => ({
    meta: [
      { title: "Zakat Guide & How to Calculate Zakat on Gold | Chandgaon Foundation" },
      {
        name: "description",
        content:
          "Complete Zakat guide: Nisab, eligible wealth, and step-by-step how to calculate Zakat on gold in Islam with Bangladesh price examples.",
      },
      { property: "og:title", content: "Zakat Guide — Rules & Calculator" },
      {
        property: "og:description",
        content: "Nisab, Zakat-eligible wealth, calculation method and distribution categories — a complete Zakat guide.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://www.chandgaonfundition.xyz/zakat-guide" },
      { name: "twitter:title", content: "Zakat Guide — Rules & Calculator" },
      { name: "twitter:description", content: "Nisab, Zakat-eligible wealth, calculation method and distribution categories." },
      { property: "og:image", content: "https://www.chandgaonfundition.xyz/og-image.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Zakat Guide — Chandgaon Foundation" },
      { name: "twitter:image", content: "https://www.chandgaonfundition.xyz/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://www.chandgaonfundition.xyz/zakat-guide" }],
  }),
  component: ZakatGuide,
});

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mt-10 scroll-mt-24">
      <h2 className="text-2xl md:text-3xl font-bold mb-4">{title}</h2>
      <div className="space-y-4 text-base leading-relaxed text-foreground/90">{children}</div>
    </section>
  );
}

function ZakatGuide() {
  const { t } = useLanguage();
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
      <nav className="text-sm text-muted-foreground mb-4">
        <Link to="/" className="hover:text-foreground">{t("হোম", "Home")}</Link>
        <span className="mx-2">/</span>
        <span>{t("যাকাত গাইড", "Zakat Guide")}</span>
      </nav>

      <header>
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
          <BookOpen className="w-3.5 h-3.5" /> {t("ইসলামিক গাইড", "Islamic Guide")}
        </span>
        <h1 className="mt-4 text-3xl md:text-5xl font-bold leading-tight">
          {t("যাকাত দেয়ার নিয়ম ও যাকাত ক্যালকুলেটর — সম্পূর্ণ বাংলা গাইড", "Zakat Rules & Calculator — A Complete Guide")}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {t(
            "নিসাব, যাকাতযোগ্য সম্পদ, গণনার পদ্ধতি, বিতরণের আটটি খাত — যাকাত সম্পর্কে সবকিছু একসাথে। সঠিকভাবে যাকাত হিসাব করে আপনার দায়িত্ব আদায় করুন এবং অসহায় মানুষের পাশে দাঁড়ান।",
            "Nisab, Zakat-eligible wealth, calculation method, the eight categories of distribution — everything about Zakat in one place. Calculate correctly, fulfil your duty and stand beside those in need."
          )}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/zakat-calculator"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90"
          >
            <Calculator className="w-4 h-4" /> {t("যাকাত ক্যালকুলেটর খুলুন", "Open Zakat Calculator")}
          </Link>
          <Link
            to="/donate"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold border border-border hover:bg-accent"
          >
            <HandCoins className="w-4 h-4" /> {t("যাকাত প্রদান করুন", "Give Zakat")}
          </Link>
        </div>
      </header>

      <aside className="mt-8 rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">{t("এই গাইডে যা যা আছে", "In this guide")}</h2>
        <ul className="grid sm:grid-cols-2 gap-2 text-sm">
          <li><a href="#nisab" className="hover:underline">{t("১. নিসাব কী?", "1. What is Nisab?")}</a></li>
          <li><a href="#kar-upor" className="hover:underline">{t("২. কার উপর যাকাত ফরজ?", "2. Who must pay Zakat?")}</a></li>
          <li><a href="#sompod" className="hover:underline">{t("৩. কোন কোন সম্পদে যাকাত", "3. Zakat-eligible wealth")}</a></li>
          <li><a href="#gonona" className="hover:underline">{t("৪. যাকাত গণনার পদ্ধতি", "4. How to calculate Zakat")}</a></li>
          <li><a href="#gold" className="hover:underline">{t("৫. স্বর্ণের উপর যাকাত হিসাব", "5. How to calculate Zakat on gold")}</a></li>
          <li><a href="#udahoron" className="hover:underline">{t("৬. উদাহরণসহ হিসাব", "6. Worked example")}</a></li>
          <li><a href="#khat" className="hover:underline">{t("৭. যাকাত বিতরণের আটটি খাত", "7. The eight Zakat categories")}</a></li>
          <li><a href="#vul" className="hover:underline">{t("৮. সাধারণ ভুল", "8. Common mistakes")}</a></li>
          <li><a href="#faq" className="hover:underline">{t("৯. প্রশ্নোত্তর (FAQ)", "9. FAQ")}</a></li>
        </ul>
      </aside>

      <Section id="nisab" title={t("১. নিসাব কী?", "1. What is Nisab?")}>
        <p>
          {t(
            "নিসাব হলো সেই সর্বনিম্ন পরিমাণ সম্পদ, যা একজন মুসলিমের কাছে এক চান্দ্রবছর পূর্ণ থাকলে তার উপর যাকাত ফরজ হয়। ইসলামী শরিয়াহ অনুযায়ী নিসাব নির্ধারিত হয় স্বর্ণ ও রুপার পরিমাণে:",
            "Nisab is the minimum amount of wealth that, if held by a Muslim for one full lunar year, makes Zakat obligatory. According to Islamic Sharia, Nisab is set in terms of gold and silver:"
          )}
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>{t("স্বর্ণ:", "Gold:")}</strong> {t("৮৭.৪৮ গ্রাম (সাড়ে সাত ভরি)", "87.48g (7.5 tola)")}</li>
          <li><strong>{t("রুপা:", "Silver:")}</strong> {t("৬১২.৩৬ গ্রাম (সাড়ে বায়ান্ন ভরি)", "612.36g (52.5 tola)")}</li>
        </ul>
        <p>
          {t(
            "নগদ অর্থ, ব্যাংক জমা ও ব্যবসায়িক সম্পদের ক্ষেত্রে দরিদ্রদের অধিক উপকারের জন্য রুপার নিসাব ব্যবহার করা উত্তম — কারণ এতে নিসাব কম হয় এবং বেশি মানুষ যাকাত আদায়ের যোগ্য হন।",
            "For cash, bank deposits and business assets, using the silver Nisab is preferred — it is lower, meaning more people qualify to pay and more poor people benefit."
          )}
        </p>
      </Section>

      <Section id="kar-upor" title={t("২. কার উপর যাকাত ফরজ?", "2. Who must pay Zakat?")}>
        <p>{t("যাকাত ফরজ হওয়ার পাঁচটি শর্ত:", "Five conditions for Zakat to become obligatory:")}</p>
        <ul className="space-y-2">
          {[
            t("মুসলিম হওয়া", "Being Muslim"),
            t("প্রাপ্তবয়স্ক ও সুস্থমস্তিষ্ক হওয়া", "Being adult and of sound mind"),
            t("স্বাধীন হওয়া", "Being free"),
            t("নিসাব পরিমাণ সম্পদের পূর্ণ মালিকানা থাকা", "Full ownership of Nisab-level wealth"),
            t("নিসাব পরিমাণ সম্পদ এক চান্দ্রবছর (হিজরি বছর) পূর্ণ মেয়াদে থাকা", "Holding Nisab-level wealth for one full lunar (Hijri) year"),
          ].map((tx) => (
            <li key={tx} className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /> <span>{tx}</span></li>
          ))}
        </ul>
      </Section>

      <Section id="sompod" title={t("৩. কোন কোন সম্পদে যাকাত ফরজ?", "3. Which wealth is Zakat-eligible?")}>
        <p>{t("নিচের সম্পদগুলোতে নিসাব পূর্ণ হলে যাকাত ফরজ হয়:", "Zakat is due on the following when Nisab is met:")}</p>
        <ul className="list-disc list-inside space-y-1">
          <li>{t("নগদ অর্থ (টাকা, ডলার, রিয়াল ইত্যাদি)", "Cash (Taka, Dollar, Riyal etc.)")}</li>
          <li>{t("ব্যাংক জমা, এফডিআর, ডিপিএস, সঞ্চয়পত্র", "Bank deposits, FDR, DPS, savings certificates")}</li>
          <li>{t("স্বর্ণ ও রুপা (অলংকার সহ)", "Gold and silver (including jewellery)")}</li>
          <li>{t("ব্যবসায়িক পণ্য (বর্তমান বাজারমূল্যে)", "Business inventory (at current market value)")}</li>
          <li>{t("প্রাপ্য ঋণ (যা ফেরত পাওয়ার আশা আছে)", "Loans receivable (likely to be repaid)")}</li>
          <li>{t("শেয়ার, বন্ড ও বিনিয়োগ", "Shares, bonds and investments")}</li>
          <li>{t("ভাড়াপ্রাপ্ত সম্পত্তির জমাকৃত আয়", "Accumulated rental income from properties")}</li>
        </ul>
        <p className="text-muted-foreground text-sm">
          {t("ব্যক্তিগত বাসস্থান, ব্যবহৃত গাড়ি, পরিধেয় পোশাক ও দৈনন্দিন ব্যবহারের জিনিসপত্রের উপর যাকাত নেই।", "Personal home, used car, clothing and daily-use items are not Zakatable.")}
        </p>
      </Section>

      <Section id="gonona" title={t("৪. যাকাত গণনার পদ্ধতি", "4. How to calculate Zakat")}>
        <ol className="list-decimal list-inside space-y-2">
          <li>{t("আপনার সমস্ত যাকাতযোগ্য সম্পদের মূল্য নির্ধারণ করুন।", "Value all your Zakat-eligible wealth.")}</li>
          <li>{t("পরিশোধযোগ্য ঋণ ও অপরিহার্য ব্যয় বাদ দিন।", "Deduct liabilities and essential expenses.")}</li>
          <li>{t("নিট সম্পদ নিসাবের সমান বা বেশি কিনা যাচাই করুন।", "Check whether net wealth meets or exceeds Nisab.")}</li>
          <li>{t("নিসাব পূর্ণ হলে নিট সম্পদের ২.৫% যাকাত হিসেবে আদায় করুন।", "If Nisab is met, pay 2.5% of net wealth as Zakat.")}</li>
        </ol>
        <div className="rounded-lg bg-muted p-4 font-mono text-sm">
          {t("যাকাত = (মোট যাকাতযোগ্য সম্পদ − ঋণ) × ০.০২৫", "Zakat = (Total Zakat-eligible Wealth − Debts) × 0.025")}
        </div>
      </Section>

      <Section id="gold" title={t("৫. স্বর্ণের উপর যাকাত কীভাবে হিসাব করবেন", "5. How to calculate Zakat on gold")}>
        <p>
          {t(
            "ইসলামে স্বর্ণের উপর যাকাত ফরজ — অলংকার হোক বা বার/কয়েন, ব্যবহারে থাকুক বা সঞ্চয়ে। আপনার কাছে যদি ৮৭.৪৮ গ্রাম (সাড়ে ৭ ভরি) বা তার বেশি স্বর্ণ এক চান্দ্রবছর ধরে থাকে, তাহলে তার মোট বাজারমূল্যের ২.৫% যাকাত দিতে হবে।",
            "In Islam, Zakat is obligatory on all gold — jewellery, bars or coins, whether worn or stored. If you own 87.48g (7.5 tola) of gold or more for one full lunar year, you must pay 2.5% of its current market value as Zakat."
          )}
        </p>

        <h3 className="font-semibold text-lg mt-2">{t("ধাপে ধাপে হিসাব", "Step-by-step")}</h3>
        <ol className="list-decimal list-inside space-y-2">
          <li>{t("আপনার মালিকানাধীন সমস্ত স্বর্ণের ওজন গ্রাম বা ভরিতে বের করুন (১ ভরি = ১১.৬৬৪ গ্রাম)।", "Weigh all the gold you own in grams or tola (1 tola = 11.664g).")}</li>
          <li>{t("বাংলাদেশের বাজারে বর্তমান প্রতি গ্রাম বা প্রতি ভরি স্বর্ণের দাম বের করুন (২২ ক্যারেট সাধারণত ব্যবহৃত হয়)।", "Find the current per-gram or per-tola gold price in Bangladesh (22K is the most common).")}</li>
          <li>{t("মোট ওজন × বর্তমান দাম = আপনার স্বর্ণের মোট বাজারমূল্য।", "Total weight × current price = total market value of your gold.")}</li>
          <li>{t("এই মূল্য × ২.৫% = আপনার স্বর্ণের উপর প্রদেয় যাকাত।", "That value × 2.5% = Zakat payable on your gold.")}</li>
        </ol>

        <div className="rounded-lg bg-muted p-4 font-mono text-sm">
          {t(
            "স্বর্ণের যাকাত = (স্বর্ণের ওজন × বর্তমান বাজারদর) × ০.০২৫",
            "Zakat on gold = (weight of gold × current market price) × 0.025"
          )}
        </div>

        <h3 className="font-semibold text-lg mt-4">{t("বাংলাদেশি দামের উদাহরণ", "Example based on Bangladesh gold prices")}</h3>
        <p>
          {t(
            "ধরা যাক, আপনার কাছে ১০ ভরি ২২ ক্যারেট স্বর্ণ আছে এবং বর্তমান বাজারদর প্রতি ভরি ১,৫০,০০০ টাকা।",
            "Suppose you own 10 tola of 22K gold and the current market price is BDT 150,000 per tola."
          )}
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>{t("মোট মূল্য: ১০ × ১,৫০,০০০ = ১৫,০০,০০০ টাকা", "Total value: 10 × 150,000 = 1,500,000 BDT")}</li>
          <li>{t("যাকাত: ১৫,০০,০০০ × ২.৫% = ৩৭,৫০০ টাকা", "Zakat: 1,500,000 × 2.5% = ")} <strong>{t("৩৭,৫০০ টাকা", "37,500 BDT")}</strong></li>
        </ul>
        <p className="text-sm text-muted-foreground">
          {t(
            "নোট: বাজুস (BAJUS) নির্ধারিত দৈনিক স্বর্ণের দাম ব্যবহার করুন। ২১ বা ১৮ ক্যারেট স্বর্ণ হলে ঐ ক্যারেটের বর্তমান দাম ধরুন।",
            "Note: use the daily BAJUS-published gold rate. For 21K or 18K gold, use the price for that specific karat."
          )}
        </p>

        <h3 className="font-semibold text-lg mt-4">{t("সাধারণ প্রশ্ন", "Common questions")}</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>{t("অলংকার ব্যবহার করলেও যাকাত দিতে হবে — হানাফি মাযহাব অনুযায়ী।", "Zakat is due on gold jewellery even if worn — per the Hanafi school.")}</li>
          <li>{t("স্বর্ণ ও নগদ একসাথে থাকলে দুটোর সম্মিলিত মূল্যের উপর হিসাব হবে।", "If you own gold plus cash, calculate on their combined value.")}</li>
          <li>{t("শুধু স্বর্ণ ৮৭.৪৮ গ্রামের কম হলেও নগদ/রুপা যোগ করলে নিসাব পূর্ণ হলে যাকাত ফরজ।", "Even if gold alone is under 87.48g, Zakat is due when combined with cash/silver crosses Nisab.")}</li>
        </ul>

        <p>
          {t("দ্রুত হিসাবের জন্য আমাদের", "For a quick calculation use our")}{" "}
          <Link to="/zakat-calculator" className="text-primary underline">
            {t("যাকাত ক্যালকুলেটর", "Zakat Calculator")}
          </Link>{" "}
          {t("ব্যবহার করুন।", ".")}
        </p>
      </Section>

      <Section id="udahoron" title={t("৬. উদাহরণসহ হিসাব", "6. Worked example")}>
        <p>
          {t(
            "ধরা যাক, আপনার নগদ ৩,০০,০০০ টাকা, ৫ ভরি স্বর্ণ (প্রতি ভরি ১,২০,০০০ টাকা = ৬,০০,০০০ টাকা), ব্যবসায়িক পণ্য ২,০০,০০০ টাকা এবং পরিশোধযোগ্য ঋণ ১,০০,০০০ টাকা।",
            "Suppose you have BDT 300,000 cash, 5 tola gold (at BDT 120,000/tola = 600,000), business stock of BDT 200,000, and payable debt of BDT 100,000."
          )}
        </p>
        <ul className="list-disc list-inside">
          <li>{t("মোট সম্পদ: ৩,০০,০০০ + ৬,০০,০০০ + ২,০০,০০০ = ১১,০০,০০০ টাকা", "Total wealth: 300,000 + 600,000 + 200,000 = 1,100,000 BDT")}</li>
          <li>{t("ঋণ বাদ: ১১,০০,০০০ − ১,০০,০০০ = ১০,০০,০০০ টাকা", "After debt: 1,100,000 − 100,000 = 1,000,000 BDT")}</li>
          <li>{t("যাকাত: ১০,০০,০০০ × ২.৫% = ২৫,০০০ টাকা", "Zakat: 1,000,000 × 2.5% = ")} <strong>{t("২৫,০০০ টাকা", "25,000 BDT")}</strong></li>
        </ul>
        <p>
          {t("সহজে হিসাব করতে আমাদের", "For easy calculation use our")}{" "}
          <Link to="/zakat-calculator" className="text-primary underline">
            {t("যাকাত ক্যালকুলেটর", "Zakat Calculator")}
          </Link>{" "}
          {t("ব্যবহার করুন।", ".")}
        </p>
      </Section>

      <Section id="khat" title={t("৭. যাকাত বিতরণের আটটি খাত (সূরা তাওবাহ ৯:৬০)", "7. The eight Zakat categories (Surah At-Tawbah 9:60)")}>
        <ol className="list-decimal list-inside space-y-1">
          <li>{t("ফকীর (অভাবগ্রস্ত)", "Fuqara (the poor)")}</li>
          <li>{t("মিসকীন (নিঃস্ব)", "Masakin (the destitute)")}</li>
          <li>{t("যাকাত আদায়ের কাজে নিয়োজিত ব্যক্তি", "Zakat administrators")}</li>
          <li>{t("যাদের অন্তর আকৃষ্ট করা প্রয়োজন (মুআল্লাফাতুল কুলূব)", "Those whose hearts are to be reconciled")}</li>
          <li>{t("ক্রীতদাস মুক্তির জন্য", "Freeing slaves")}</li>
          <li>{t("ঋণগ্রস্ত ব্যক্তি", "Those in debt")}</li>
          <li>{t("আল্লাহর পথে (ফী সাবিলিল্লাহ)", "In the cause of Allah (fi sabilillah)")}</li>
          <li>{t("মুসাফির (পথিক)", "The traveller (ibn al-sabil)")}</li>
        </ol>
      </Section>

      <Section id="vul" title={t("৮. যাকাত আদায়ে সাধারণ ভুল", "8. Common mistakes in paying Zakat")}>
        <ul className="list-disc list-inside space-y-1">
          <li>{t("স্বর্ণ-অলংকারের উপর যাকাত না দেওয়া", "Not paying Zakat on gold jewellery")}</li>
          <li>{t("ব্যাংক জমা ও বিনিয়োগ বাদ দেওয়া", "Excluding bank deposits and investments")}</li>
          <li>{t("নিসাব হিসাবে কেবল স্বর্ণের নিসাব ধরা — রুপার নিসাব অধিক উত্তম", "Using only the gold Nisab — the silver Nisab is preferable")}</li>
          <li>{t("চান্দ্র বছর গণনা না করে সৌর বছর ব্যবহার করা", "Counting solar instead of lunar years")}</li>
          <li>{t("নিকটাত্মীয় (পিতা-মাতা, সন্তান, স্ত্রী) কে যাকাত দেওয়া", "Giving Zakat to close family (parents, children, spouse)")}</li>
        </ul>
      </Section>

      <Section id="faq" title={t("৯. প্রশ্নোত্তর (FAQ)", "9. FAQ")}>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">{t("যাকাত কি রমজানে দিতেই হবে?", "Must Zakat be paid in Ramadan?")}</h3>
            <p>{t("না, যেদিন আপনার সম্পদে এক চান্দ্রবছর পূর্ণ হয়, সেদিনই যাকাত ফরজ। অনেকে রমজানে আদায় করেন বেশি সওয়াবের আশায়।", "No. Zakat is due on the day your wealth completes one lunar year. Many pay in Ramadan to earn extra reward.")}</p>
          </div>
          <div>
            <h3 className="font-semibold">{t("স্ত্রীর স্বর্ণ-অলংকারের উপর যাকাত কে দেবে?", "Who pays Zakat on a wife's gold jewellery?")}</h3>
            <p>{t("মালিক হিসেবে স্ত্রীর উপরই যাকাত ফরজ। তবে স্বামী বা পরিবারের সদস্যরা তার পক্ষ থেকে আদায় করে দিতে পারেন।", "The wife, as the owner, is responsible. The husband or family may pay on her behalf.")}</p>
          </div>
          <div>
            <h3 className="font-semibold">{t("প্রতিষ্ঠানের মাধ্যমে যাকাত দেওয়া যাবে কি?", "Can Zakat be given through an organisation?")}</h3>
            <p>{t("হ্যাঁ, বিশ্বস্ত প্রতিষ্ঠানের মাধ্যমে যাকাত দেওয়া যায় — শর্ত হলো প্রতিষ্ঠান যেন শরিয়াহ অনুযায়ী যথাযথ খাতে বণ্টন করে।", "Yes — through a trusted organisation that distributes according to Sharia categories.")}</p>
          </div>
        </div>
      </Section>

      <div className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-6 md:p-8 text-center">
        <h2 className="text-2xl font-bold">{t("আপনার যাকাত পৌঁছে দিন প্রকৃত হকদারদের কাছে", "Deliver your Zakat to those who truly deserve it")}</h2>
        <p className="mt-2 text-muted-foreground">
          {t("চাঁদগাঁও প্রবাসী ও যুবসমাজ কল্যাণ ফাউন্ডেশন স্বচ্ছতার সাথে যাকাত সংগ্রহ ও বিতরণ করে।", "Chandgaon Pravasi & Youth Welfare Foundation collects and distributes Zakat with full transparency.")}
        </p>
        <div className="mt-5 flex flex-wrap gap-3 justify-center">
          <Link to="/donate" className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90">
            <HandCoins className="w-4 h-4" /> {t("এখনই যাকাত প্রদান করুন", "Give Zakat now")}
          </Link>
          <Link to="/zakat-calculator" className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold border border-border hover:bg-accent">
            <Calculator className="w-4 h-4" /> {t("যাকাত ক্যালকুলেটর", "Zakat Calculator")}
          </Link>
        </div>
      </div>
    </div>
  );
}
