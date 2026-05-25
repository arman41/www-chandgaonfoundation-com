import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "অ্যাডমিন লগইন | চাঁদগাঁও ফাউন্ডেশন" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/login` },
        });
        if (error) throw error;
        if (data.user && !data.session) {
          setInfo("অ্যাকাউন্ট তৈরি হয়েছে! আপনার ইমেইলে পাঠানো ভেরিফিকেশন লিংকে ক্লিক করুন।");
        } else {
          navigate({ to: "/activities" });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/activities" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "ত্রুটি হয়েছে");
    } finally {
      setSubmitting(false);
    }
  };

  const field = "w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:outline-none focus:border-primary text-sm";

  return (
    <section className="max-w-md mx-auto px-6 py-16">
      <Link to="/" className="text-sm text-primary hover:underline">← হোমে ফিরুন</Link>
      <h1 className="mt-4 text-3xl font-bold">{mode === "signup" ? "অ্যাকাউন্ট তৈরি করুন" : "অ্যাডমিন লগইন"}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {mode === "signup"
          ? "সাইন আপ করার পর আপনার ইমেইল ভেরিফাই করুন।"
          : "শুধু অনুমোদিত অ্যাডমিনরাই কার্যক্রম প্রকাশ করতে পারবেন।"}
      </p>

      <div className="mt-6 flex gap-2 p-1 bg-muted rounded-full text-sm">
        <button
          type="button"
          onClick={() => { setMode("login"); setError(null); setInfo(null); }}
          className={`flex-1 py-2 rounded-full font-medium transition ${mode === "login" ? "bg-background shadow" : "text-muted-foreground"}`}
        >
          লগইন
        </button>
        <button
          type="button"
          onClick={() => { setMode("signup"); setError(null); setInfo(null); }}
          className={`flex-1 py-2 rounded-full font-medium transition ${mode === "signup" ? "bg-background shadow" : "text-muted-foreground"}`}
        >
          সাইন আপ
        </button>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-4 bg-card border border-border rounded-2xl p-6">
        <div>
          <label className="block text-sm font-medium mb-1.5">ইমেইল</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">পাসওয়ার্ড</label>
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className={field} />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-50"
          style={{ background: "var(--gradient-gold)", color: "oklch(0.22 0.05 160)", boxShadow: "var(--shadow-gold)" }}
        >
          {submitting ? "অপেক্ষা করুন..." : mode === "signup" ? "সাইন আপ করুন" : "লগইন করুন"}
        </button>
        {error && <p className="text-sm text-destructive text-center">{error}</p>}
        {info && <p className="text-sm text-primary text-center">{info}</p>}
        <p className="text-xs text-muted-foreground text-center pt-2">
          {mode === "signup"
            ? "সাইন আপের পরে অ্যাডমিন রোল দায়িত্বপ্রাপ্ত ব্যক্তি কর্তৃক প্রদান করা হবে।"
            : "নতুন অ্যাডমিন অ্যাকাউন্ট তৈরি করতে দায়িত্বপ্রাপ্ত ব্যক্তির সাথে যোগাযোগ করুন।"}
        </p>
      </form>
    </section>
  );
}
