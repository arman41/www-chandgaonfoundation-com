import { createFileRoute } from "@tanstack/react-router";
import { useFoundationSettings } from "@/hooks/use-foundation-settings";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "যোগাযোগ — চাঁদগাঁও ফাউন্ডেশন" },
      { name: "description", content: "চাঁদগাঁও প্রবাসী ও যুবসমাজ কল্যান ফাউন্ডেশনের সাথে যোগাযোগ করুন।" },
      { property: "og:title", content: "যোগাযোগ — চাঁদগাঁও ফাউন্ডেশন" },
      { property: "og:description", content: "আমাদের সাথে যোগাযোগ করুন।" },
    ],
  }),
  component: Contact,
});


function Contact() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">যোগাযোগ</p>
      <h1 className="mt-3 text-4xl md:text-5xl font-bold">আমাদের সাথে কথা বলুন</h1>
      <p className="mt-4 text-muted-foreground">যেকোনো প্রশ্ন, পরামর্শ বা স্বেচ্ছাসেবী হিসেবে যোগ দিতে যোগাযোগ করুন।</p>

      <div className="mt-12 grid md:grid-cols-3 gap-4">
        {[
          { l: "ঠিকানা", v: "চাঁদগাঁও, লাকসাম, কুমিল্লা, বাংলাদেশ", i: "📍" },
          { l: "ইমেইল", v: "info@chandgaonfoundation.org", i: "✉️" },
          { l: "ফোন", v: "+৮৮০ ১৭০০-০০০০০০", i: "📞" },
        ].map((c) => (
          <div key={c.l} className="p-6 rounded-2xl bg-card border border-border">
            <div className="text-2xl">{c.i}</div>
            <div className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">{c.l}</div>
            <div className="mt-1 text-sm font-medium text-foreground">{c.v}</div>
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          alert("আপনার বার্তা পাঠানো হয়েছে। ধন্যবাদ!");
        }}
        className="mt-12 p-8 rounded-2xl bg-card border border-border space-y-4"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <input required placeholder="আপনার নাম" className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm" />
          <input required type="email" placeholder="ইমেইল" className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm" />
        </div>
        <textarea required rows={5} placeholder="আপনার বার্তা" className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm resize-none" />
        <button type="submit" className="inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-semibold text-primary-foreground bg-primary hover:opacity-90 transition-opacity">
          পাঠিয়ে দিন
        </button>
      </form>
    </div>
  );
}
