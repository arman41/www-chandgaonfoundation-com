import { createFileRoute } from "@tanstack/react-router";
import { useFoundationSettings } from "@/hooks/use-foundation-settings";
import { useServerFn } from "@tanstack/react-start";
import { submitContactMessage } from "@/lib/contact.functions";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "যোগাযোগ — চাঁদগাঁও ফাউন্ডেশন" },
      { name: "description", content: "চাঁদগাঁও ফাউন্ডেশনের সাথে যোগাযোগ করুন—ফোন, ইমেইল বা বার্তায় দান, স্বেচ্ছাসেবা ও সহায়তা সংক্রান্ত যেকোনো জিজ্ঞাসায় আমরা পাশে আছি।" },
      { property: "og:title", content: "যোগাযোগ — চাঁদগাঁও ফাউন্ডেশন" },
      { property: "og:description", content: "চাঁদগাঁও ফাউন্ডেশনের সাথে যোগাযোগ করুন—সাধারণ জিজ্ঞাসা, স্বেচ্ছাসেবা, দান, অথবা সহায়তা সংক্রান্ত যেকোনো বিষয়ে আমরা পাশে আছি।" },
      { property: "og:url", content: "https://www.chandgaonfundition.xyz/contact" },
    ],
    links: [{ rel: "canonical", href: "https://www.chandgaonfundition.xyz/contact" }],
  }),
  component: Contact,
});

function Contact() {
  const { settings } = useFoundationSettings();
  const submit = useServerFn(submitContactMessage);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    try {
      await submit({ data: form });
      toast.success("আপনার বার্তা পাঠানো হয়েছে। ধন্যবাদ!");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "বার্তা পাঠানো যায়নি");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">যোগাযোগ</p>
      <h1 className="mt-3 text-4xl md:text-5xl font-bold">আমাদের সাথে কথা বলুন</h1>
      <p className="mt-4 text-muted-foreground">যেকোনো প্রশ্ন, পরামর্শ বা স্বেচ্ছাসেবী হিসেবে যোগ দিতে যোগাযোগ করুন।</p>

      <div className="mt-12 grid md:grid-cols-3 gap-4">
        {[
          { l: "ঠিকানা", v: settings?.address || "চাঁদগাঁও, লাকসাম, কুমিল্লা, বাংলাদেশ", i: "📍" },
          { l: "ইমেইল", v: settings?.email || "—", i: "✉️" },
          { l: "ফোন", v: settings?.phone || "—", i: "📞" },
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
          <input required aria-label="আপনার নাম" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="আপনার নাম" className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm" />
          <input required aria-label="ইমেইল ঠিকানা" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="ইমেইল" className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm" />
        </div>
        <textarea required aria-label="আপনার বার্তা" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="আপনার বার্তা" className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm resize-none" />
        <button type="submit" disabled={sending} className="inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-semibold text-primary-foreground bg-primary hover:opacity-90 transition-opacity disabled:opacity-60">
          {sending ? "পাঠানো হচ্ছে..." : "পাঠিয়ে দিন"}
        </button>
      </form>
    </div>
  );
}
