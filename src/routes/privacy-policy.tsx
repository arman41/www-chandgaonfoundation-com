import { createFileRoute } from "@tanstack/react-router";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "প্রাইভেসি পলিসি — চাঁদগাও ফাউন্ডেশন" },
      {
        name: "description",
        content:
          "Privacy Policy of Chandgaon Foundation — how we collect, use, and protect your personal information and identity documents.",
      },
      { property: "og:title", content: "প্রাইভেসি পলিসি — চাঁদগাও ফাউন্ডেশন" },
      {
        property: "og:description",
        content:
          "How Chandgaon Foundation collects, uses, and protects your personal information and identity documents.",
      },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://chandgaonfoundation.com/privacy-policy" }],
  }),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  const { t, lang } = useLanguage();
  const brand = lang === "en" ? "Chandgaon Foundation" : "চাঁদগাও ফাউন্ডেশন";
  const fullBrand =
    lang === "en"
      ? "Chandgaon Pravasi & Youth Welfare Foundation"
      : "চাঁদগাও প্রবাসী ও যুবসমাজ কল্যান ফাউন্ডেশন";
  const updated = "৫ সেপ্টেম্বর ২০২৬";

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">
        {t("আইনি", "Legal")}
      </p>
      <h1 className="mt-2 text-3xl md:text-4xl font-bold">
        {t("প্রাইভেসি পলিসি", "Privacy Policy")}
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {t("সর্বশেষ হালনাগাদ:", "Last updated:")} {updated}
      </p>

      <div className="mt-10 space-y-7 text-foreground/85 leading-relaxed text-sm md:text-base">
        <Section title={t("১. ভূমিকা", "1. Introduction")}>
          {t(
            `${fullBrand} (এতপর “আমরা”, “ফাউন্ডেশন” বা ${brand}) আপনার ব্যক্তিগত তথ্যের গোপনীয়তা ও নিরাপত্তা সম্পর্কে গুরুত্বপূর্ণ বিষয় মনে করে। এই প্রাইভেসি পলিসি ব্যাখ্যা করে আমরা কী তথ্য সংগ্রহ করি, কীভাবে তা ব্যবহার করি এবং কীভাবে সুরক্ষিত রাখি।`,
            `${fullBrand} ("we", "the Foundation", or ${brand}) takes the privacy and security of your personal information seriously. This Privacy Policy explains what information we collect, how we use it, and how we protect it.`,
          )}
        </Section>

        <Section title={t("২. আমরা যেসব তথ্য সংগ্রহ করি", "2. Information We Collect")}>
          {t(
            "আবেদন ও সেবা গ্রহণের সময় আমরা নিম্নলিখিত তথ্য সংগ্রহ করতে পারি: নাম, জন্ম তারিখ, লিঙ্গ, ঠিকানা, ফোন নম্বর, ইমেইল, জাতীয় পরিচয়পত্র (NID) নম্বর ও ছবি, পেশা, আয় ও আর্থিক অবস্থা, ছবি বা পরিচয় সংক্রান্ত নথিপত্র, দান ও লেনদেনের তথ্য (টিএক্স আইডি, পরিমাণ, পেমেন্ট মাধ্যম) এবং আবেদন বা সাহায্যের বিবরণ।",
            "When you apply for or use our services, we may collect: name, date of birth, gender, address, phone number, email, National ID (NID) number and image, occupation, income and financial condition, identity photographs or documents, donation and transaction details (TX ID, amount, payment method), and a description of your application or request.",
          )}
        </Section>

        <Section title={t("৩. তথ্যের ব্যবহার", "3. How We Use Your Information")}>
          <ul className="list-disc ps-5 space-y-1.5">
            <li>{t("সদস্যপদ, স্বেচ্ছাসেবক ও সাহায্যের আবেদন যাচাই ও অনুমোদনের জন্য।", "To verify and approve membership, volunteer, and assistance applications.")}</li>
            <li>{t("দান যাচাই, রসিদ প্রদান এবং আর্থিক স্বচ্ছতা নিশ্চিত করতে।", "To verify donations, issue receipts, and ensure financial transparency.")}</li>
            <li>{t("আপনার সাথে আবেদনের অবস্থা ও গুরুত্বপূর্ণ বিষয়ে যোগাযোগ করতে।", "To communicate with you about your application status and important matters.")}</li>
            <li>{t("আইনি ও নিয়ন্ত্রক দায়িত্ব পালন এবং প্রতারণা বা অপব্যবহার প্রতিরোধে।", "To meet legal and regulatory obligations and to prevent fraud or misuse.")}</li>
          </ul>
        </Section>

        <Section title={t("৪. সংবেদনশীল তথ্য ও পরিচয় নথিপত্রের সংরক্ষণ", "4. Storage of Sensitive Information and Identity Documents")}>
          {t(
            "জাতীয় পরিচয়পত্রের ছবি ও অন্যান্য সংবেদনশীল নথিপত্র কেবলমাত্র নিরাপত্তাকৃত ব্যক্তিগত (private) স্টোরেজে সংরক্ষিত হয়। শুধুমাত্র অনুমোদিত কর্মকর্তা স্বল্পমেয়াদী সাইনড লিংকের মাধ্যমে সেগুলো দেখতে পারেন। ফাউন্ডেশনের অনুমোদনকৃত কর্মকর্তা ছাড়া অন্য কেউ আপনার পরিচয় নথিপত্র দেখতে পারে না।",
            "Images of your National ID and other sensitive documents are stored only in secured private storage. Only authorized staff can view them through short-lived signed links. No one other than approved Foundation staff can access your identity documents.",
          )}
        </Section>

        <Section title={t("৫. তৃতীয় পক্ষের সাথে তথ্য শেয়ার", "5. Sharing with Third Parties")}>
          {t(
            "আমরা আপনার ব্যক্তিগত তথ্য তৃতীয় কোনো পক্ষের কাছে বিক্রি করি না। তবে আইনি বাধ্যবাধকতা, আদালতের নির্দেশ, বা প্রতারণা তদন্তের প্রয়োজনে সীমিত তথ্য প্রযোজ্য কর্তৃপক্ষের কাছে প্রদান করা হতে পারে। পেমেন্ট গেটওয়ে ও স্টোরেজ সেবাদাতা শুধুমাত্র লেনদেন সম্পন্ন করার জন্য প্রয়োজনীয় প্রযুক্তিগত তথ্য গ্রহণ করে।",
            "We never sell your personal information to third parties. Limited data may be shared with competent authorities under legal obligation, court order, or fraud investigation. Payment-gateway and storage providers receive only the technical data necessary to complete transactions.",
          )}
        </Section>

        <Section title={t("৬. ডেটা সংরক্ষণকাল", "6. Data Retention")}>
          {t(
            "আবেদন ও সংশ্লিষ্ট নথিপত্র ফাউন্ডেশনের রেকর্ড ও জবাবদিহিতার প্রয়োজনে সংরক্ষিত থাকে। অনুমোদন না হলেও আবেদন তথ্য পরবর্তী যাচাই বা যোগাযোগের জন্য সীমিত সময় রাখা হয়। আইনি প্রয়োজনে কিছু আর্থিক রেকর্ড দীর্ঘ সময় সংরক্ষিত থাকতে পারে।",
            "Application records and related documents are retained for the Foundation's accountability and audit. Even unapproved applications are kept for a limited period for follow-up. Some financial records may be retained longer to meet legal requirements.",
          )}
        </Section>

        <Section title={t("৭. আপনার অধিকার", "7. Your Rights")}>
          {t(
            "আপনার নিজের সম্পর্কিত তথ্য দেখতে, সংশোধন করতে বা মুছে ফেলার অনুরোধ করতে ফাউন্ডেশনের সাথে যোগাযোগ করতে পারেন। আইনি বাধ্যবাধকতা ও রেকর্ড সংরক্ষণের প্রয়োজনে কিছু তথ্য সংরক্ষিত রাখা হতে পারে।",
            "You may contact the Foundation to request access to, correction of, or deletion of your personal information. Some data may be retained to meet legal and record-keeping obligations.",
          )}
        </Section>

        <Section title={t("৮. নিরাপত্তা", "8. Security")}>
          {t(
            "আমরা প্রযুক্তিগত ও প্রাতিষ্ঠানিক ব্যবস্থা গ্রহণ করি — যেমন রোল-ভিত্তিক অনুমতি (RLS), প্রাইভেট স্টোরেজ ও সাইনড লিংক — যাতে আপনার তথ্য অননুমোদিত প্রবেশ থেকে সুরক্ষিত থাকে।",
            "We apply technical and organizational measures — such as role-based access control (RLS), private storage, and signed links — to protect your information from unauthorized access.",
          )}
        </Section>

        <Section title={t("৯. যোগাযোগ", "9. Contact")}>
          {t(
            "এই পলিসি সম্পর্কে কোনো প্রশ্ন থাকলে ফাউন্ডেশনের সাথে যোগাযোগ পৃষ্ঠার মাধ্যমে যোগাযোগ করুন।",
            "If you have questions about this policy, please reach the Foundation through the Contact page.",
          )}
        </Section>

        <p className="pt-4 border-t border-border text-xs text-muted-foreground">
          © {new Date().getFullYear()} {fullBrand}. {t("সর্বস্বত্ব সংরক্ষিত।", "All rights reserved.")}
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground mb-2">{title}</h2>
      <div className="text-foreground/85 space-y-2">{children}</div>
    </section>
  );
}
