import { createFileRoute, Link } from "@tanstack/react-router";
import { Calculator, HandCoins, BookOpen, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/zakat-guide")({
  head: () => ({
    meta: [
      { title: "যাকাত দেয়ার নিয়ম ও যাকাত ক্যালকুলেটর গাইড — চাঁদগাঁও ফাউন্ডেশন" },
      {
        name: "description",
        content:
          "যাকাত দেয়ার নিয়ম, নিসাব কী, কার উপর যাকাত ফরজ, যাকাত গণনার পদ্ধতি এবং যাকাত ক্যালকুলেটর ব্যবহারের সম্পূর্ণ বাংলা গাইড।",
      },
      { property: "og:title", content: "যাকাত দেয়ার নিয়ম ও যাকাত ক্যালকুলেটর গাইড" },
      {
        property: "og:description",
        content:
          "নিসাব, যাকাতযোগ্য সম্পদ, গণনার পদ্ধতি ও বিতরণের খাত — সম্পূর্ণ বাংলা যাকাত গাইড।",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://www.chandgaonfundition.xyz/zakat-guide" },
    ],
    links: [{ rel: "canonical", href: "https://www.chandgaonfundition.xyz/zakat-guide" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "নিসাব কী?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "নিসাব হলো সেই সর্বনিম্ন পরিমাণ সম্পদ যা একজন মুসলিমের কাছে এক চান্দ্রবছর পূর্ণ সময় থাকলে তার উপর যাকাত ফরজ হয়। স্বর্ণের ক্ষেত্রে ৮৭.৪৮ গ্রাম (সাড়ে সাত ভরি) এবং রুপার ক্ষেত্রে ৬১২.৩৬ গ্রাম (সাড়ে বায়ান্ন ভরি)। নগদ অর্থ ও বাণিজ্যিক সম্পদের জন্য সাধারণত রুপার নিসাব ধরা হয়, যাতে বেশি দরিদ্র মানুষ উপকৃত হন।",
              },
            },
            {
              "@type": "Question",
              name: "কার উপর যাকাত ফরজ?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "প্রাপ্তবয়স্ক, সুস্থমস্তিষ্ক, স্বাধীন মুসলিম — যার মালিকানায় ঋণমুক্তভাবে নিসাব পরিমাণ সম্পদ এক চান্দ্রবছর পূর্ণ থাকে, তার উপর যাকাত ফরজ।",
              },
            },
            {
              "@type": "Question",
              name: "যাকাত গণনার পদ্ধতি কী?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "মোট যাকাতযোগ্য সম্পদ (নগদ + ব্যাংক জমা + স্বর্ণ-রুপার বর্তমান বাজারমূল্য + ব্যবসায়িক পণ্যের মূল্য + প্রাপ্য ঋণ) থেকে পরিশোধযোগ্য ঋণ বাদ দিয়ে নিট সম্পদ বের করুন। এই নিট সম্পদ নিসাবের সমান বা বেশি হলে তার ২.৫% যাকাত হিসেবে দিতে হবে।",
              },
            },
            {
              "@type": "Question",
              name: "যাকাতের হার কত?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "নগদ অর্থ, স্বর্ণ, রুপা ও বাণিজ্যিক সম্পদের উপর যাকাতের হার ২.৫% (চল্লিশ ভাগের এক ভাগ)।",
              },
            },
          ],
        }),
      },
    ],
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
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
      <nav className="text-sm text-muted-foreground mb-4">
        <Link to="/" className="hover:text-foreground">হোম</Link>
        <span className="mx-2">/</span>
        <span>যাকাত গাইড</span>
      </nav>

      <header>
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
          <BookOpen className="w-3.5 h-3.5" /> ইসলামিক গাইড
        </span>
        <h1 className="mt-4 text-3xl md:text-5xl font-bold leading-tight">
          যাকাত দেয়ার নিয়ম ও যাকাত ক্যালকুলেটর — সম্পূর্ণ বাংলা গাইড
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          নিসাব, যাকাতযোগ্য সম্পদ, গণনার পদ্ধতি, বিতরণের আটটি খাত — যাকাত সম্পর্কে সবকিছু একসাথে।
          সঠিকভাবে যাকাত হিসাব করে আপনার দায়িত্ব আদায় করুন এবং অসহায় মানুষের পাশে দাঁড়ান।
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/zakat-calculator"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90"
          >
            <Calculator className="w-4 h-4" /> যাকাত ক্যালকুলেটর খুলুন
          </Link>
          <Link
            to="/donate"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold border border-border hover:bg-accent"
          >
            <HandCoins className="w-4 h-4" /> যাকাত প্রদান করুন
          </Link>
        </div>
      </header>

      <aside className="mt-8 rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">এই গাইডে যা যা আছে</h2>
        <ul className="grid sm:grid-cols-2 gap-2 text-sm">
          <li><a href="#nisab" className="hover:underline">১. নিসাব কী?</a></li>
          <li><a href="#kar-upor" className="hover:underline">২. কার উপর যাকাত ফরজ?</a></li>
          <li><a href="#sompod" className="hover:underline">৩. কোন কোন সম্পদে যাকাত</a></li>
          <li><a href="#gonona" className="hover:underline">৪. যাকাত গণনার পদ্ধতি</a></li>
          <li><a href="#udahoron" className="hover:underline">৫. উদাহরণসহ হিসাব</a></li>
          <li><a href="#khat" className="hover:underline">৬. যাকাত বিতরণের আটটি খাত</a></li>
          <li><a href="#vul" className="hover:underline">৭. সাধারণ ভুল</a></li>
          <li><a href="#faq" className="hover:underline">৮. প্রশ্নোত্তর (FAQ)</a></li>
        </ul>
      </aside>

      <Section id="nisab" title="১. নিসাব কী?">
        <p>
          <strong>নিসাব</strong> হলো সেই সর্বনিম্ন পরিমাণ সম্পদ, যা একজন মুসলিমের কাছে এক চান্দ্রবছর পূর্ণ
          থাকলে তার উপর যাকাত ফরজ হয়। ইসলামী শরিয়াহ অনুযায়ী নিসাব নির্ধারিত হয় স্বর্ণ ও রুপার পরিমাণে:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>স্বর্ণ:</strong> ৮৭.৪৮ গ্রাম (সাড়ে সাত ভরি)</li>
          <li><strong>রুপা:</strong> ৬১২.৩৬ গ্রাম (সাড়ে বায়ান্ন ভরি)</li>
        </ul>
        <p>
          নগদ অর্থ, ব্যাংক জমা ও ব্যবসায়িক সম্পদের ক্ষেত্রে দরিদ্রদের অধিক উপকারের জন্য <strong>রুপার নিসাব</strong>
          ব্যবহার করা উত্তম — কারণ এতে নিসাব কম হয় এবং বেশি মানুষ যাকাত আদায়ের যোগ্য হন।
        </p>
      </Section>

      <Section id="kar-upor" title="২. কার উপর যাকাত ফরজ?">
        <p>যাকাত ফরজ হওয়ার পাঁচটি শর্ত:</p>
        <ul className="space-y-2">
          {[
            "মুসলিম হওয়া",
            "প্রাপ্তবয়স্ক ও সুস্থমস্তিষ্ক হওয়া",
            "স্বাধীন হওয়া",
            "নিসাব পরিমাণ সম্পদের পূর্ণ মালিকানা থাকা",
            "নিসাব পরিমাণ সম্পদ এক চান্দ্রবছর (হিজরি বছর) পূর্ণ মেয়াদে থাকা",
          ].map((t) => (
            <li key={t} className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /> <span>{t}</span></li>
          ))}
        </ul>
      </Section>

      <Section id="sompod" title="৩. কোন কোন সম্পদে যাকাত ফরজ?">
        <p>নিচের সম্পদগুলোতে নিসাব পূর্ণ হলে যাকাত ফরজ হয়:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>নগদ অর্থ (টাকা, ডলার, রিয়াল ইত্যাদি)</li>
          <li>ব্যাংক জমা, এফডিআর, ডিপিএস, সঞ্চয়পত্র</li>
          <li>স্বর্ণ ও রুপা (অলংকার সহ)</li>
          <li>ব্যবসায়িক পণ্য (বর্তমান বাজারমূল্যে)</li>
          <li>প্রাপ্য ঋণ (যা ফেরত পাওয়ার আশা আছে)</li>
          <li>শেয়ার, বন্ড ও বিনিয়োগ</li>
          <li>ভাড়াপ্রাপ্ত সম্পত্তির জমাকৃত আয়</li>
        </ul>
        <p className="text-muted-foreground text-sm">
          ব্যক্তিগত বাসস্থান, ব্যবহৃত গাড়ি, পরিধেয় পোশাক ও দৈনন্দিন ব্যবহারের জিনিসপত্রের উপর যাকাত নেই।
        </p>
      </Section>

      <Section id="gonona" title="৪. যাকাত গণনার পদ্ধতি">
        <ol className="list-decimal list-inside space-y-2">
          <li>আপনার সমস্ত যাকাতযোগ্য সম্পদের মূল্য নির্ধারণ করুন।</li>
          <li>পরিশোধযোগ্য ঋণ ও অপরিহার্য ব্যয় বাদ দিন।</li>
          <li>নিট সম্পদ নিসাবের সমান বা বেশি কিনা যাচাই করুন।</li>
          <li>নিসাব পূর্ণ হলে নিট সম্পদের <strong>২.৫%</strong> যাকাত হিসেবে আদায় করুন।</li>
        </ol>
        <div className="rounded-lg bg-muted p-4 font-mono text-sm">
          যাকাত = (মোট যাকাতযোগ্য সম্পদ − ঋণ) × ০.০২৫
        </div>
      </Section>

      <Section id="udahoron" title="৫. উদাহরণসহ হিসাব">
        <p>
          ধরা যাক, আপনার নগদ ৩,০০,০০০ টাকা, ৫ ভরি স্বর্ণ (প্রতি ভরি ১,২০,০০০ টাকা = ৬,০০,০০০ টাকা),
          ব্যবসায়িক পণ্য ২,০০,০০০ টাকা এবং পরিশোধযোগ্য ঋণ ১,০০,০০০ টাকা।
        </p>
        <ul className="list-disc list-inside">
          <li>মোট সম্পদ: ৩,০০,০০০ + ৬,০০,০০০ + ২,০০,০০০ = ১১,০০,০০০ টাকা</li>
          <li>ঋণ বাদ: ১১,০০,০০০ − ১,০০,০০০ = ১০,০০,০০০ টাকা</li>
          <li>যাকাত: ১০,০০,০০০ × ২.৫% = <strong>২৫,০০০ টাকা</strong></li>
        </ul>
        <p>
          সহজে হিসাব করতে আমাদের{" "}
          <Link to="/zakat-calculator" className="text-primary underline">
            যাকাত ক্যালকুলেটর
          </Link>{" "}
          ব্যবহার করুন।
        </p>
      </Section>

      <Section id="khat" title="৬. যাকাত বিতরণের আটটি খাত (সূরা তাওবাহ ৯:৬০)">
        <ol className="list-decimal list-inside space-y-1">
          <li>ফকীর (অভাবগ্রস্ত)</li>
          <li>মিসকীন (নিঃস্ব)</li>
          <li>যাকাত আদায়ের কাজে নিয়োজিত ব্যক্তি</li>
          <li>যাদের অন্তর আকৃষ্ট করা প্রয়োজন (মুআল্লাফাতুল কুলূব)</li>
          <li>ক্রীতদাস মুক্তির জন্য</li>
          <li>ঋণগ্রস্ত ব্যক্তি</li>
          <li>আল্লাহর পথে (ফী সাবিলিল্লাহ)</li>
          <li>মুসাফির (পথিক)</li>
        </ol>
      </Section>

      <Section id="vul" title="৭. যাকাত আদায়ে সাধারণ ভুল">
        <ul className="list-disc list-inside space-y-1">
          <li>স্বর্ণ-অলংকারের উপর যাকাত না দেওয়া</li>
          <li>ব্যাংক জমা ও বিনিয়োগ বাদ দেওয়া</li>
          <li>নিসাব হিসাবে কেবল স্বর্ণের নিসাব ধরা — রুপার নিসাব অধিক উত্তম</li>
          <li>চান্দ্র বছর গণনা না করে সৌর বছর ব্যবহার করা</li>
          <li>নিকটাত্মীয় (পিতা-মাতা, সন্তান, স্ত্রী) কে যাকাত দেওয়া</li>
        </ul>
      </Section>

      <Section id="faq" title="৮. প্রশ্নোত্তর (FAQ)">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">যাকাত কি রমজানে দিতেই হবে?</h3>
            <p>না, যেদিন আপনার সম্পদে এক চান্দ্রবছর পূর্ণ হয়, সেদিনই যাকাত ফরজ। অনেকে রমজানে আদায় করেন বেশি সওয়াবের আশায়।</p>
          </div>
          <div>
            <h3 className="font-semibold">স্ত্রীর স্বর্ণ-অলংকারের উপর যাকাত কে দেবে?</h3>
            <p>মালিক হিসেবে স্ত্রীর উপরই যাকাত ফরজ। তবে স্বামী বা পরিবারের সদস্যরা তার পক্ষ থেকে আদায় করে দিতে পারেন।</p>
          </div>
          <div>
            <h3 className="font-semibold">প্রতিষ্ঠানের মাধ্যমে যাকাত দেওয়া যাবে কি?</h3>
            <p>হ্যাঁ, বিশ্বস্ত প্রতিষ্ঠানের মাধ্যমে যাকাত দেওয়া যায় — শর্ত হলো প্রতিষ্ঠান যেন শরিয়াহ অনুযায়ী যথাযথ খাতে বণ্টন করে।</p>
          </div>
        </div>
      </Section>

      <div className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-6 md:p-8 text-center">
        <h2 className="text-2xl font-bold">আপনার যাকাত পৌঁছে দিন প্রকৃত হকদারদের কাছে</h2>
        <p className="mt-2 text-muted-foreground">
          চাঁদগাঁও প্রবাসী ও যুবসমাজ কল্যাণ ফাউন্ডেশন স্বচ্ছতার সাথে যাকাত সংগ্রহ ও বিতরণ করে।
        </p>
        <div className="mt-5 flex flex-wrap gap-3 justify-center">
          <Link to="/donate" className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90">
            <HandCoins className="w-4 h-4" /> এখনই যাকাত প্রদান করুন
          </Link>
          <Link to="/zakat-calculator" className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold border border-border hover:bg-accent">
            <Calculator className="w-4 h-4" /> যাকাত ক্যালকুলেটর
          </Link>
        </div>
      </div>
    </div>
  );
}
