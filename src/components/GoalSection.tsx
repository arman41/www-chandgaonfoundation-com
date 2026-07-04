import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/use-language";
import { Target, Heart } from "lucide-react";
import { Link } from "@tanstack/react-router";

function toBnDigits(s: string) {
  const map: Record<string, string> = { "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪", "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯" };
  return s.replace(/\d/g, (d) => map[d] ?? d);
}

function fmt(n: number, lang: "bn" | "en") {
  const s = Math.round(n).toLocaleString(lang === "bn" ? "en-IN" : "en-US");
  return lang === "bn" ? toBnDigits(s) : s;
}

type Overall = { overall_goal_amount: number | null; overall_raised_amount: number | null; overall_goal_label: string | null };
type Project = { id: string; name: string; category: string; goal_amount: number | null; raised_amount: number | null };

export function GoalSection() {
  const { t, lang } = useLanguage();
  const [overall, setOverall] = useState<Overall | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    supabase
      .from("foundation_settings" as any)
      .select("overall_goal_amount, overall_raised_amount, overall_goal_label")
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setOverall((data as any) ?? null));
    supabase
      .from("aid_projects" as any)
      .select("id, name, category, goal_amount, raised_amount")
      .eq("status", "active")
      .not("goal_amount", "is", null)
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data }) => setProjects(((data as any) ?? []) as Project[]));
  }, []);

  const goal = Number(overall?.overall_goal_amount ?? 0);
  const raised = Number(overall?.overall_raised_amount ?? 0);
  const pct = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;

  const hasOverall = goal > 0;
  const hasProjects = projects.length > 0;
  if (!hasOverall && !hasProjects) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 py-16 md:py-20">
      <div className="text-center mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary inline-flex items-center gap-2">
          <Target className="w-3.5 h-3.5" /> {t("আমাদের লক্ষ্য", "Our Goal")}
        </p>
        <h2 className="mt-3 text-3xl md:text-4xl font-bold">
          {t("প্রতিটি অবদান লক্ষ্যের দিকে এক ধাপ", "Every contribution moves us closer")}
        </h2>
      </div>

      {hasOverall && (
        <div className="rounded-3xl border border-border p-6 md:p-10 mb-8" style={{ background: "var(--gradient-hero)", color: "oklch(0.98 0 0)", boxShadow: "var(--shadow-elegant)" }}>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--gold)" }}>
            {overall?.overall_goal_label || t("সামগ্রিক তহবিল লক্ষ্য", "Overall Fundraising Goal")}
          </p>
          <div className="mt-3 flex items-end justify-between gap-4 flex-wrap">
            <div>
              <div className="text-3xl md:text-5xl font-bold">
                ৳ {fmt(raised, lang)} <span className="text-base md:text-lg font-medium opacity-70">/ ৳ {fmt(goal, lang)}</span>
              </div>
              <p className="mt-1 text-sm opacity-80">
                {t("সংগৃহীত", "Raised")} · {lang === "bn" ? `${toBnDigits(String(pct))}%` : `${pct}%`} {t("পূর্ণ", "complete")}
              </p>
            </div>
            <Link to="/donate" className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold" style={{ background: "var(--gradient-gold)", color: "oklch(0.22 0.05 160)", boxShadow: "var(--shadow-gold)" }}>
              <Heart className="w-4 h-4" /> {t("অবদান রাখুন", "Contribute")}
            </Link>
          </div>
          <div className="mt-5 h-3 rounded-full overflow-hidden" style={{ background: "oklch(1 0 0 / 0.15)" }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: "var(--gradient-gold)" }} />
          </div>
        </div>
      )}

      {hasProjects && (
        <div className="grid md:grid-cols-3 gap-4">
          {projects.map((p) => {
            const pg = Number(p.goal_amount ?? 0);
            const pr = Number(p.raised_amount ?? 0);
            const pp = pg > 0 ? Math.min(100, Math.round((pr / pg) * 100)) : 0;
            return (
              <div key={p.id} className="rounded-2xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-elegant)" }}>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">{p.category}</p>
                <h3 className="mt-2 font-bold leading-snug line-clamp-2">{p.name}</h3>
                <div className="mt-4 flex items-baseline justify-between text-sm">
                  <span className="font-bold text-primary">৳ {fmt(pr, lang)}</span>
                  <span className="text-xs text-muted-foreground">/ ৳ {fmt(pg, lang)}</span>
                </div>
                <div className="mt-2 h-2 rounded-full overflow-hidden bg-secondary">
                  <div className="h-full rounded-full" style={{ width: `${pp}%`, background: "var(--gradient-gold)" }} />
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {lang === "bn" ? `${toBnDigits(String(pp))}%` : `${pp}%`} {t("সংগৃহীত", "raised")}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
