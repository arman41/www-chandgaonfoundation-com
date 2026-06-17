import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "পাসওয়ার্ড রিসেট | চাঁদগাঁও ফাউন্ডেশন" },
      { name: "description", content: "চাঁদগাঁও ফাউন্ডেশন অ্যাকাউন্টের পাসওয়ার্ড ভুলে গেছেন? ইমেইল দিন—আমরা নিরাপদ রিসেট লিংক পাঠিয়ে আপনার অ্যাকাউন্ট পুনরুদ্ধারে সাহায্য করব।" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setInfo(null); setSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setInfo("আপনার ইমেইলে পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে। ইনবক্স দেখুন।");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ত্রুটি হয়েছে");
    } finally {
      setSubmitting(false);
    }
  };

  const field = "w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:outline-none focus:border-primary text-sm";

  return (
    <section className="max-w-md mx-auto px-6 py-16">
      <Link to="/login" className="text-sm text-primary hover:underline">← লগইন এ ফিরুন</Link>
      <h1 className="mt-4 text-3xl font-bold">পাসওয়ার্ড ভুলে গেছেন?</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        ইমেইল দিন, আমরা আপনাকে পাসওয়ার্ড রিসেট করার লিংক পাঠাবো।
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4 bg-card border border-border rounded-2xl p-6">
        <div>
          <label className="block text-sm font-medium mb-1.5">ইমেইল</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-50"
          style={{ background: "var(--gradient-gold)", color: "oklch(0.22 0.05 160)", boxShadow: "var(--shadow-gold)" }}
        >
          {submitting ? "পাঠানো হচ্ছে..." : "রিসেট লিংক পাঠান"}
        </button>
        {error && <p className="text-sm text-destructive text-center">{error}</p>}
        {info && <p className="text-sm text-primary text-center">{info}</p>}
      </form>
    </section>
  );
}
