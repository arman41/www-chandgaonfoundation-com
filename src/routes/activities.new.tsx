import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { publishActivity, CATEGORIES } from "@/lib/activities";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/activities/new")({
  head: () => ({
    meta: [
      { title: "নতুন কার্যক্রম প্রকাশ করুন | চাঁদগাঁও ফাউন্ডেশন" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: NewActivityPage,
});

function NewActivityPage() {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const [imagePreview, setImagePreview] = useState<string | undefined>();
  const fileRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login" });
    }
  }, [loading, user, navigate]);

  const onImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("ছবি সর্বোচ্চ 5MB হতে পারে");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      let imageUrl: string | undefined;
      const file = fileRef.current?.files?.[0];
      if (file) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `activities/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("foundation-media")
          .upload(path, file, { cacheControl: "3600", upsert: false });
        if (upErr) throw upErr;
        const { data } = supabase.storage.from("foundation-media").getPublicUrl(path);
        imageUrl = data.publicUrl;
      }
      await publishActivity({
        title: String(fd.get("title") || ""),
        category: String(fd.get("category") || CATEGORIES[0]),
        date: String(fd.get("date") || ""),
        location: String(fd.get("location") || ""),
        description: String(fd.get("description") || ""),
        imageUrl,
      });
      navigate({ to: "/activities" });
    } catch (err) {
      console.error("publishActivity failed", err);
      setError(err instanceof Error ? err.message : "প্রকাশ করতে ব্যর্থ");
      setSubmitting(false);
    }
  };

  const field = "w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:outline-none focus:border-primary text-sm";
  const label = "block text-sm font-medium mb-1.5";

  if (loading) {
    return <section className="max-w-2xl mx-auto px-6 py-16 text-center text-muted-foreground">লোড হচ্ছে...</section>;
  }

  if (!user) {
    return null;
  }

  if (!isAdmin) {
    return (
      <section className="max-w-2xl mx-auto px-6 py-16">
        <Link to="/activities" className="text-sm text-primary hover:underline">← কার্যক্রমে ফিরুন</Link>
        <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <h1 className="text-2xl font-bold text-destructive">অনুমতি নেই</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            শুধু অ্যাডমিনরাই কার্যক্রম প্রকাশ করতে পারেন। আপনার অ্যাকাউন্টে অ্যাডমিন ভূমিকা যুক্ত করতে ফাউন্ডেশনের সাথে যোগাযোগ করুন।
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-2xl mx-auto px-6 py-16">
      <Link to="/activities" className="text-sm text-primary hover:underline">← কার্যক্রমে ফিরুন</Link>
      <h1 className="mt-4 text-3xl font-bold">নতুন কার্যক্রম প্রকাশ করুন</h1>
      <p className="mt-2 text-sm text-muted-foreground">প্রকাশিত কার্যক্রম সবার কাছে দৃশ্যমান হবে।</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5 bg-card border border-border rounded-2xl p-6">
        <div>
          <label className={label}>শিরোনাম *</label>
          <input name="title" required className={field} placeholder="যেমন: শীতবস্ত্র বিতরণ কর্মসূচি" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>বিভাগ *</label>
            <select name="category" required className={field} defaultValue={CATEGORIES[0]}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={label}>তারিখ *</label>
            <input name="date" required className={field} placeholder="যেমন: ১৫ জানুয়ারি ২০২৬" />
          </div>
        </div>
        <div>
          <label className={label}>স্থান *</label>
          <input name="location" required className={field} placeholder="যেমন: চাঁদগাঁও, চট্টগ্রাম" />
        </div>
        <div>
          <label className={label}>বিবরণ *</label>
          <textarea name="description" required rows={5} className={field} placeholder="কার্যক্রমের বিস্তারিত লিখুন..." />
        </div>
        <div>
          <label className={label}>ছবি (ঐচ্ছিক, সর্বোচ্চ 2MB)</label>
          <input ref={fileRef} type="file" accept="image/*" onChange={onImage} className="text-sm" />
          {imagePreview && (
            <img src={imagePreview} alt="preview" className="mt-3 w-full h-44 object-cover rounded-lg border border-border" />
          )}
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-50"
          style={{ background: "var(--gradient-gold)", color: "oklch(0.22 0.05 160)", boxShadow: "var(--shadow-gold)" }}
        >
          {submitting ? "প্রকাশ হচ্ছে..." : "প্রকাশ করুন"}
        </button>
        {error && <p className="text-sm text-destructive text-center">{error}</p>}
      </form>
    </section>
  );
}