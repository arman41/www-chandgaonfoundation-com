import { createFileRoute } from "@tanstack/react-router";
import { useFoundationSettings } from "@/hooks/use-foundation-settings";
import { useServerFn } from "@tanstack/react-start";
import { submitContactMessage } from "@/lib/contact.functions";
import { useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Chandgaon Foundation" },
      { name: "description", content: "Reach Chandgaon Foundation by phone, email or message — for donations, volunteering or any support enquiry, we're here." },
      { property: "og:title", content: "Contact — Chandgaon Foundation" },
      { property: "og:description", content: "Reach Chandgaon Foundation for general queries, volunteering, donations or support." },
      { property: "og:url", content: "https://chandgaonfoundation.com/contact" },
      { name: "twitter:title", content: "Contact — Chandgaon Foundation" },
      { name: "twitter:description", content: "Reach Chandgaon Foundation for general queries, volunteering, donations or support." },
      { property: "og:image", content: "https://chandgaonfoundation.com/og-image.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Contact — Chandgaon Foundation" },
      { name: "twitter:image", content: "https://chandgaonfoundation.com/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://chandgaonfoundation.com/contact" }],
  }),
  component: Contact,
});

function Contact() {
  const { settings } = useFoundationSettings();
  const { t } = useLanguage();
  const submit = useServerFn(submitContactMessage);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    try {
      await submit({ data: form });
      toast.success(t("আপনার বার্তা পাঠানো হয়েছে। ধন্যবাদ!", "Your message has been sent. Thank you!"));
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("বার্তা পাঠানো যায়নি", "Could not send message"));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">{t("যোগাযোগ", "Contact")}</p>
      <h1 className="mt-3 text-4xl md:text-5xl font-bold">{t("আমাদের সাথে কথা বলুন", "Talk to us")}</h1>
      <p className="mt-4 text-muted-foreground">{t("যেকোনো প্রশ্ন, পরামর্শ বা স্বেচ্ছাসেবী হিসেবে যোগ দিতে যোগাযোগ করুন।", "Reach out for any question, suggestion, or to join as a volunteer.")}</p>

      <div className="mt-12 grid md:grid-cols-3 gap-4">
        {[
          { l: t("ঠিকানা", "Address"), v: settings?.address || t("চাঁদগাও, লাকসাম, কুমিল্লা, বাংলাদেশ", "Chandgaon, Laksam, Cumilla, Bangladesh"), i: "📍" },
          { l: t("ইমেইল", "Email"), v: settings?.email || "—", i: "✉️" },
          { l: t("ফোন", "Phone"), v: settings?.phone || "—", i: "📞" },
        ].map((c) => (
          <div key={c.l} className="p-6 rounded-2xl bg-card border border-border">
            <div className="text-2xl">{c.i}</div>
            <div className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">{c.l}</div>
            <div className="mt-1 text-sm font-medium text-foreground">{c.v}</div>
          </div>
        ))}
      </div>

      <form onSubmit={onSubmit} className="mt-12 p-8 rounded-2xl bg-card border border-border space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <input required aria-label={t("আপনার নাম", "Your name")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t("আপনার নাম", "Your name")} className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm" />
          <input required aria-label={t("ইমেইল ঠিকানা", "Email address")} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder={t("ইমেইল", "Email")} className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm" />
        </div>
        <textarea required aria-label={t("আপনার বার্তা", "Your message")} rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder={t("আপনার বার্তা", "Your message")} className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm resize-none" />
        <button type="submit" disabled={sending} className="inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-semibold text-primary-foreground bg-primary hover:opacity-90 transition-opacity disabled:opacity-60">
          {sending ? t("পাঠানো হচ্ছে...", "Sending...") : t("পাঠিয়ে দিন", "Send")}
        </button>
      </form>
    </div>
  );
}
