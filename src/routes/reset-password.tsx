import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "নতুন পাসওয়ার্ড সেট করুন | চাঁদগাঁও ফাউন্ডেশন" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase fires PASSWORD_RECOVERY when the recovery link is opened.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setInfo(null);
    if (password !== confirm) {
      setError("দুটি পাসওয়ার্ড একই হতে হবে");
      return;
    }
    if (password.length < 6) {
      setError("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setInfo("পাসওয়ার্ড সফলভাবে আপডেট হয়েছে। ৩ সেকেন্ডে লগইন এ পাঠানো হচ্ছে...");
      setTimeout(() => navigate({ to: "/login" }), 3000);
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
      <h1 className="mt-4 text-3xl font-bold">নতুন পাসওয়ার্ড সেট করুন</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {ready
          ? "নতুন পাসওয়ার্ড লিখুন এবং নিশ্চিত করুন।"
          : "রিসেট লিংক যাচাই হচ্ছে... যদি আপনি ইমেইলের লিংক থেকে না এসে থাকেন, আগে পাসওয়ার্ড রিসেট অনুরোধ করুন।"}
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4 bg-card border border-border rounded-2xl p-6">
        <div>
          <label className="block text-sm font-medium mb-1.5">নতুন পাসওয়ার্ড</label>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              required minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${field} pr-20`}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-xs font-semibold text-primary hover:underline"
            >
              {show ? "লুকান" : "দেখান"}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">পাসওয়ার্ড নিশ্চিত করুন</label>
          <input
            type={show ? "text" : "password"}
            required minLength={6}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={field}
          />
        </div>
        <button
          type="submit"
          disabled={submitting || !ready}
          className="w-full inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-50"
          style={{ background: "var(--gradient-gold)", color: "oklch(0.22 0.05 160)", boxShadow: "var(--shadow-gold)" }}
        >
          {submitting ? "আপডেট হচ্ছে..." : "পাসওয়ার্ড আপডেট করুন"}
        </button>
        {error && <p className="text-sm text-destructive text-center">{error}</p>}
        {info && <p className="text-sm text-primary text-center">{info}</p>}
      </form>
    </section>
  );
}
