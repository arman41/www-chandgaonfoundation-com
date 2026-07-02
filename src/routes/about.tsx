import { createFileRoute } from "@tanstack/react-router";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Chandgaon Foundation" },
      { name: "description", content: "Learn about the mission, vision and activities of Chandgaon Pravasi & Youth Welfare Foundation." },
      { property: "og:title", content: "About Us — Chandgaon Foundation" },
      { property: "og:description", content: "A non-profit founded by Chandgaon's expatriates and youth — serving the poor and helpless with food, education, healthcare and shelter." },
      { property: "og:url", content: "https://www.chandgaonfundition.xyz/about" },
      { name: "twitter:title", content: "About Us — Chandgaon Foundation" },
      { name: "twitter:description", content: "A non-profit founded by Chandgaon's expatriates and youth — serving the poor and helpless with food, education, healthcare and shelter." },
      { property: "og:image", content: "https://www.chandgaonfundition.xyz/og-image.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "About Us — Chandgaon Foundation" },
      { name: "twitter:image", content: "https://www.chandgaonfundition.xyz/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://www.chandgaonfundition.xyz/about" }],
  }),
  component: About,
});

function About() {
  const { t } = useLanguage();
  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">{t("আমাদের সম্পর্কে", "About Us")}</p>
      <h1 className="mt-3 text-4xl md:text-5xl font-bold">
        {t("মানবতার সেবায়", "Serving humanity for")} <span className="text-primary">{t("এক যুগের পথচলা", "over a decade")}</span>
      </h1>
      <div className="mt-10 prose prose-lg max-w-none text-foreground/85 space-y-6 leading-relaxed">
        <p>
          <strong>{t("চাঁদগাঁও প্রবাসী ও যুবসমাজ কল্যান ফাউন্ডেশন", "Chandgaon Pravasi & Youth Welfare Foundation")}</strong>{" "}
          {t(
            "কুমিল্লার লাকসাম উপজেলার চাঁদগাঁও এলাকার প্রবাসী ভাই-বোন ও স্থানীয় যুবসমাজের যৌথ উদ্যোগে প্রতিষ্ঠিত একটি অলাভজনক, দাতব্য প্রতিষ্ঠান। দরিদ্র, অসহায় ও দুঃস্থ মানুষের পাশে দাঁড়ানোই আমাদের মূল লক্ষ্য।",
            "is a non-profit charitable organization based in Chandgaon, Laksam, Cumilla — founded jointly by the area's expatriates and local youth community. Standing beside the poor, helpless and distressed is our primary mission."
          )}
        </p>
        <p>
          {t(
            "আমরা বিশ্বাস করি — একটি সমাজ ততটাই উন্নত, যতটা তার সবচেয়ে দুর্বল মানুষটিও পেট ভরে খেতে পারে, সন্তানকে স্কুলে পাঠাতে পারে, অসুখে চিকিৎসা পেতে পারে। সেই বিশ্বাস থেকেই আমাদের পথচলা।",
            "We believe a society is only as advanced as the weakest among us — one who can eat to the full, send their children to school, and get treatment when sick. That belief is the foundation of our journey."
          )}
        </p>
      </div>

      <div className="mt-16 grid md:grid-cols-2 gap-6">
        <div className="p-8 rounded-2xl bg-card border border-border">
          <h2 className="text-xl font-semibold text-primary">{t("আমাদের লক্ষ্য", "Our Mission")}</h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            {t(
              "চাঁদগাঁও, লাকসাম ও বৃহত্তর কুমিল্লার প্রতিটি দরিদ্র পরিবারের কাছে খাদ্য, শিক্ষা, চিকিৎসা ও আশ্রয়ের সুযোগ পৌঁছে দেওয়া।",
              "To bring food, education, healthcare and shelter to every poor family across Chandgaon, Laksam and greater Cumilla."
            )}
          </p>
        </div>
        <div className="p-8 rounded-2xl bg-card border border-border">
          <h2 className="text-xl font-semibold text-primary">{t("আমাদের উদ্দেশ্য", "Our Vision")}</h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            {t(
              "স্বচ্ছতা, জবাবদিহিতা ও সহানুভূতির মাধ্যমে এমন একটি সমাজ গড়ে তোলা যেখানে কেউ অসহায় থাকবে না।",
              "Through transparency, accountability and compassion, to build a society where no one is left helpless."
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
