import { createFileRoute } from "@tanstack/react-router";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/terms-of-service")({
  head: () => ({
    meta: [
      { title: "শর্তাবলী — চাঁদগাও ফাউন্ডেশন" },
      {
        name: "description",
        content:
          "Terms of Service of Chandgaon Foundation — the rules for using this website, applying for membership, donations, and assistance.",
      },
      { property: "og:title", content: "শর্তাবলী — চাঁদগাও ফাউন্ডেশন" },
      {
        property: "og:description",
        content:
          "The rules for using the Chandgaon Foundation website, applying for membership, donations, and assistance.",
      },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://chandgaonfoundation.com/terms-of-service" }],
  }),
  component: TermsOfServicePage,
});

function TermsOfServicePage() {
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
        {t("শর্তাবলী", "Terms of Service")}
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {t("সর্বশেষ হালনাগাদ:", "Last updated:")} {updated}
      </p>

      <div className="mt-10 space-y-7 text-foreground/85 leading-relaxed text-sm md:text-base">
        <Section title={t("১. গ্রহণ", "1. Acceptance")}>
          {t(
            `এই ওয়েবসাইট ব্যবহার করে বা সদস্যপদ/সাহায্যের আবেদন জমা দিয়ে আপনি নিচের শর্তাবলীতে সম্মত হচ্ছেন। আপনি সম্মত না হলে সেবা ব্যবহার করবেন না। ${fullBrand} (এতপর “আমরা” বা ${brand}) এই শর্তাবলী যেকোনো সময় পরিবর্তন করতে পারে।`,
            `By using this website or submitting an application for membership or assistance, you agree to the terms below. If you do not agree, please do not use the services. ${fullBrand} ("we" or ${brand}) may update these terms at any time.`,
          )}
        </Section>

        <Section title={t("২. যোগ্যতা", "2. Eligibility")}>
          {t(
            "সদস্যপদ বা স্বেচ্ছাসেবক আবেদনের জন্য আপনার বয়স ন্যূনতম ১৮ বছর এবং বাংলাদেশের বৈধ নাগরিক হতে হবে। সাহায্যের আবেদন যে কেউ করতে পারেন, তবে দেওয়া তথ্য সত্য হতে হবে।",
            "To apply for membership or as a volunteer, you must be at least 18 years old and a lawful citizen of Bangladesh. Anyone may request assistance, but all information provided must be truthful.",
          )}
        </Section>

        <Section title={t("৩. সত্য ও নির্ভুল তথ্য", "3. Accurate Information")}>
          {t(
            "আবেদন, দান বা যোগাযোগে দেওয়া সকল তথ্য (নাম, ঠিকানা, NID, আর্থিক অবস্থা ইত্যাদি) সত্য ও নির্ভুল হতে হবে। মিথ্যা তথ্য প্রমাণিত হলে আবেদন বাতিল, সদস্যপদ বাতিল বা আইনি ব্যবস্থা নেওয়া হতে পারে।",
            "All information you provide in applications, donations, or contact (name, address, NID, financial condition, etc.) must be true and accurate. False information may lead to application rejection, membership cancellation, or legal action.",
          )}
        </Section>

        <Section title={t("৪. আবেদন অনুমোদন", "4. Application Approval")}>
          {t(
            "সকল আবেদন যাচাই-বাছাইয়ের পর কার্যনির্বাহী পরিষদ বা অনুমোদন কমিটি কর্তৃক অনুমোদিত হবে। অনুমোদন কোনো অধিকার নয়; এটি সম্পূর্ণ ফাউন্ডেশনের এখতিয়ার।",
            "All applications are reviewed and approved by the executive committee or approval panel. Approval is not a right; it is at the sole discretion of the Foundation.",
          )}
        </Section>

        <Section title={t("৫. দান ও চাঁদা", "5. Donations and Contributions")}>
          {t(
            "দান ও চাঁদা একবার প্রদান করলে ফেরতযোগ্য নয়। প্রতিটি দানের বিপরীতে টিএক্স আইডি ও ডিজিটাল রসিদ প্রদান করা হয়। অর্থ শুধুমাত্র ফাউন্ডেশনের সেবামূলক ও প্রশাসনিক কাজে ব্যবহৃত হবে।",
            "Donations and contributions are non-refundable once made. Each donation is issued a TX ID and digital receipt. Funds are used solely for the Foundation's charitable and administrative purposes.",
          )}
        </Section>

        <Section title={t("৬. সদস্যপদ ও পরিচয় কার্ড", "6. Membership and Identity Cards")}>
          {t(
            "সদস্যপদ ব্যক্তিগত ও অহস্তান্তরযোগ্য। পরিচয়পত্র বা QR কার্ড অন্য কাউকে ব্যবহারে দেওয়া যাবে না। শৃঙ্খলাভঙ্গ, দুর্নীতি বা সুনামহানিকর কাজ প্রমাণিত হলে কার্যনির্বাহী পরিষদ সদস্যপদ বাতিল করতে পারবে।",
            "Membership is personal and non-transferable. Identity or QR cards must not be shared with others. The executive committee may cancel membership for misconduct, corruption, or acts that harm the Foundation's reputation.",
          )}
        </Section>

        <Section title={t("৭. ব্যবহারকারীর আচরণ", "7. User Conduct")}>
          <ul className="list-disc ps-5 space-y-1.5">
            <li>{t("রাজনৈতিক, সাম্প্রদায়িক বা অবৈধ কার্যকলাপে ফাউন্ডেশনের নাম ব্যবহার করবেন না।", "Do not use the Foundation's name for political, communal, or unlawful activities.")}</li>
            <li>{t("ওয়েবসাইট বা সেবা প্রতারণা, স্প্যাম বা অপব্যবহারের জন্য ব্যবহার করবেন না।", "Do not use the website or services for fraud, spam, or misuse.")}</li>
            <li>{t("অন্য ব্যবহারকারী বা সুবিধাভোগীদের তথ্য অনুমতি ছাড়া প্রকাশ করবেন না।", "Do not publish other users' or beneficiaries' information without consent.")}</li>
          </ul>
        </Section>

        <Section title={t("৮. বুদ্ধিসম্পদ ও কনটেন্ট", "8. Intellectual Property and Content")}>
          {t(
            "এই ওয়েবসাইটের লোগো, টেক্সট, ছবি ও নকশা ফাউন্ডেশনের সম্পদ। আপনি আবেদনে যে ছবি বা তথ্য দেন, সেগুলো যাচাই ও পরিসেবা প্রদানের জন্য ফাউন্ডেশনকে ব্যবহারের অনুমতি দেন।",
            "The logo, text, images, and design of this website belong to the Foundation. By submitting photos or information in an application, you grant the Foundation permission to use them for verification and service delivery.",
          )}
        </Section>

        <Section title={t("৯. দায়মুক্তি", "9. Disclaimer")}>
          {t(
            "সেবা ও সহায়তা ‘যথাসাধ্য’ ভিত্তিতে প্রদান করা হয়। ফাউন্ডেশন কোনো নির্দিষ্ট ফলাফলের গ্যারান্টি দেয় না। জরুরি চিকিৎসা বা দুর্যোগ পরিস্থিতিতে সরাসরি সংশ্লিষ্ট কর্তৃপক্ষের সাথে যোগাযোগ করুন।",
            "Services and assistance are provided on a 'best-effort' basis. The Foundation does not guarantee any specific outcome. In medical emergencies or disasters, contact the relevant authorities directly.",
          )}
        </Section>

        <Section title={t("১০. শর্তাবলী পরিবর্তন", "10. Changes to Terms")}>
          {t(
            "আমরা যেকোনো সময় এই শর্তাবলী পরিবর্তন করতে পারি। পরিবর্তিত শর্তাবলী ওয়েবসাইটে প্রকাশিত হওয়ার পর তা কার্যকর হবে।",
            "We may change these terms at any time. Updated terms take effect once published on the website.",
          )}
        </Section>

        <Section title={t("১১. যোগাযোগ", "11. Contact")}>
          {t(
            "শর্তাবলী সম্পর্কে প্রশ্ন থাকলে যোগাযোগ পৃষ্ঠা থেকে ফাউন্ডেশনের সাথে যোগাযোগ করুন।",
            "For questions about these terms, contact the Foundation through the Contact page.",
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
