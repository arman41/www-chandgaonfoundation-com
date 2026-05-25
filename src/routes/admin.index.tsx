import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Users,
  HeartHandshake,
  HandHeart,
  CalendarDays,
  LifeBuoy,
  TrendingUp,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/admin/")({
  component: DashboardHome,
});

type Stats = {
  members: number;
  pendingMembers: number;
  donations: number;
  donationsAmount: number;
  volunteers: number;
  events: number;
  upcomingEvents: number;
  pendingHelp: number;
};

function DashboardHome() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [monthly, setMonthly] = useState<{ month: string; total: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [m, mp, d, v, e, eu] = await Promise.all([
          supabase.from("members").select("*", { count: "exact", head: true }),
          supabase.from("members").select("*", { count: "exact", head: true }).eq("status", "pending"),
          supabase.from("donations").select("amount,donated_at,status"),
          supabase.from("volunteers").select("*", { count: "exact", head: true }),
          supabase.from("events").select("*", { count: "exact", head: true }),
          supabase.from("events").select("*", { count: "exact", head: true }).eq("status", "upcoming"),
        ]);
        if (!mounted) return;
        const donations = d.data ?? [];
        const approved = donations.filter((x) => x.status === "approved");
        const total = approved.reduce((s, x) => s + Number(x.amount || 0), 0);

        // Build last 6 months totals
        const now = new Date();
        const buckets: Record<string, number> = {};
        for (let i = 5; i >= 0; i--) {
          const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
          buckets[key] = 0;
        }
        approved.forEach((x) => {
          const dt = new Date(x.donated_at as string);
          const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
          if (key in buckets) buckets[key] += Number(x.amount || 0);
        });
        const months = ["জানু", "ফেব", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগ", "সেপ্ট", "অক্টো", "নভে", "ডিসে"];
        setMonthly(
          Object.entries(buckets).map(([k, v]) => {
            const [, mm] = k.split("-");
            return { month: months[parseInt(mm, 10) - 1], total: v };
          }),
        );

        setStats({
          members: m.count ?? 0,
          pendingMembers: mp.count ?? 0,
          donations: donations.length,
          donationsAmount: total,
          volunteers: v.count ?? 0,
          events: e.count ?? 0,
          upcomingEvents: eu.count ?? 0,
          pendingHelp: 0,
        });
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const cards = [
    { label: "মোট সদস্য", value: stats?.members ?? 0, sub: `${stats?.pendingMembers ?? 0} জন অনুমোদনের অপেক্ষায়`, icon: Users, tone: "from-emerald-500 to-emerald-700" },
    { label: "মোট দান", value: `৳ ${(stats?.donationsAmount ?? 0).toLocaleString("bn-BD")}`, sub: `${stats?.donations ?? 0}টি লেনদেন`, icon: HeartHandshake, tone: "from-rose-500 to-rose-700" },
    { label: "স্বেচ্ছাসেবক", value: stats?.volunteers ?? 0, sub: "সক্রিয়", icon: HandHeart, tone: "from-amber-500 to-amber-700" },
    { label: "ইভেন্ট", value: stats?.events ?? 0, sub: `${stats?.upcomingEvents ?? 0}টি আসন্ন`, icon: CalendarDays, tone: "from-sky-500 to-sky-700" },
    { label: "জরুরি আবেদন", value: stats?.pendingHelp ?? 0, sub: "অপেক্ষমান", icon: LifeBuoy, tone: "from-fuchsia-500 to-fuchsia-700" },
    { label: "মাসিক বৃদ্ধি", value: `${monthly[monthly.length - 1]?.total ? "↗" : "—"}`, sub: "চলতি মাস", icon: TrendingUp, tone: "from-indigo-500 to-indigo-700" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">স্বাগতম 👋</h1>
        <p className="text-sm text-muted-foreground mt-1">ফাউন্ডেশনের সামগ্রিক অবস্থা এক নজরে</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-card border border-border rounded-2xl p-4 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl grid place-items-center bg-gradient-to-br ${c.tone} text-white mb-3`}>
              <c.icon className="h-5 w-5" />
            </div>
            <p className="text-xs text-muted-foreground">{c.label}</p>
            <p className="text-xl md:text-2xl font-bold mt-1 truncate">{loading ? "..." : c.value}</p>
            <p className="text-[11px] text-muted-foreground mt-1 truncate">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5">
          <div className="flex items-end justify-between mb-4">
            <div>
              <h3 className="font-semibold">মাসিক দান বিশ্লেষণ</h3>
              <p className="text-xs text-muted-foreground">গত ৬ মাসের অনুমোদিত দান</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.5 0.13 162)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.5 0.13 162)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="total" stroke="oklch(0.32 0.09 162)" strokeWidth={2} fill="url(#g1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-semibold mb-3">দ্রুত পদক্ষেপ</h3>
          <div className="space-y-2">
            <QuickAction label="নতুন সদস্য যোগ করুন" />
            <QuickAction label="দান রেকর্ড করুন" />
            <QuickAction label="নতুন ইভেন্ট তৈরি করুন" />
            <QuickAction label="নোটিশ প্রকাশ করুন" />
          </div>
          <div className="mt-5 rounded-xl p-4 text-sm" style={{ background: "color-mix(in oklab, var(--accent) 30%, transparent)" }}>
            <p className="font-semibold">💡 টিপ</p>
            <p className="text-xs text-muted-foreground mt-1">
              পাশের মেনু থেকে প্রতিটি বিভাগ ব্যবস্থাপনা করতে পারবেন।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ label }: { label: string }) {
  return (
    <div className="text-sm px-3 py-2.5 rounded-lg border border-border bg-background hover:border-primary/40 hover:bg-accent/30 cursor-pointer transition-colors">
      {label}
    </div>
  );
}