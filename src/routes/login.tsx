import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { getUserRoleFlags } from "@/lib/auth-role";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "লগইন | চাঁদগাঁও ফাউন্ডেশন" }],
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
  const [showPassword, setShowPassword] = useState(false);

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
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
          const { isAdmin, isModerator } = await getUserRoleFlags(data.user.id);
          if (isAdmin || isModerator) {
            await supabase.from("admin_activity_logs").insert({
              actor_id: data.user.id,
              actor_email: data.user.email,
              action: "auth.login",
              user_agent: navigator.userAgent,
            });
          }
        }
        navigate({ to: "/activities" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "ত্রুটি হয়েছে");
    } finally {
      setSubmitting(false);
    }
  };

  const onGoogle = async () => {
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/activities`,
      });
      if (result.error) throw result.error instanceof Error ? result.error : new Error(String(result.error));
      if (result.redirected) return;
      navigate({ to: "/activities" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google সাইন-ইন ব্যর্থ হয়েছে");
      setSubmitting(false);
    }
  };

  const field = "w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:outline-none focus:border-primary text-sm";

  return (
    <section className="max-w-md mx-auto px-6 py-16">
      <Link to="/" className="text-sm text-primary hover:underline">← হোমে ফিরুন</Link>
      <h1 className="mt-4 text-3xl font-bold">{mode === "signup" ? "অ্যাকাউন্ট তৈরি করুন" : "লগইন"}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {mode === "signup"
          ? "সাইন আপ করার পর আপনার ইমেইল ভেরিফাই করুন।"
          : "আপনার অ্যাকাউন্টে লগইন করুন।"}
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

      <div className="mt-6 bg-card border border-border rounded-2xl p-6 space-y-4">
        <button
          type="button"
          onClick={onGoogle}
          disabled={submitting}
          className="w-full inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold border border-border bg-background hover:bg-muted transition disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c3 0 5.7 1.1 7.7 2.9l5.7-5.7C33.9 6.5 29.2 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 12.5 24 12.5c3 0 5.7 1.1 7.7 2.9l5.7-5.7C33.9 6.5 29.2 4.5 24 4.5 16.3 4.5 9.7 9 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 43.5c5.1 0 9.7-1.9 13.2-5.1l-6.1-5c-2 1.5-4.4 2.4-7.1 2.4-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.5 39 16.2 43.5 24 43.5z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.4l6.1 5c-.4.4 6.7-4.9 6.7-14.4 0-1.2-.1-2.3-.4-3.5z"/>
          </svg>
          Google দিয়ে চালিয়ে যান
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center"><span className="bg-card px-2 text-xs text-muted-foreground">অথবা</span></div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">ইমেইল</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium">পাসওয়ার্ড</label>
              {mode === "login" && (
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">পাসওয়ার্ড ভুলে গেছেন?</Link>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${field} pr-20`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখান"}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-xs font-semibold text-primary hover:underline"
              >
                {showPassword ? "লুকান" : "দেখান"}
              </button>
            </div>
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
        </form>
      </div>
    </section>
  );
}
