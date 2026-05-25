import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Users,
  HeartHandshake,
  HandHeart,
  CalendarDays,
  LifeBuoy,
  TrendingUp,
  ArrowUpRight,
  Plus,
  Megaphone,
  Images,
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
  PieChart,
  Pie,
  Cell,
  Legend,
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
};

type DonationRow = {
  id: string;
  donor_name: string;
  amount: number;
  method: string;
  status: string;
  donated_at: string;
};

type EventRow = {
  id: string;
  title: string;
  event_date: string;
  location: string | null;
  status: string;
};

const bn = (n: number) => n.toLocaleString("bn-BD");
const bnDate = (d: string) =>
  new Date(d).toLocaleDateString("bn-BD", { day: "numeric", month: "short", year: "numeric" });

function DashboardHome() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [monthly, setMonthly] = useState<{ month: string; total: number }[]>([]);
  const [byMethod, setByMethod] = useState<{ name: string; value: number }[]>([]);
  const [recentDonations, setRecentDonations] = useState<DonationRow[]>([]);
  const [upcoming, setUpcoming] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [m, mp, d, v, e, eu, recent, upcomingEvts] = await Promise.all([
          supabase.from("members").select("*", { count: "exact", head: true }),
          supabase.from("members").select("*", { count: "exact", head: true }).eq("status", "pending"),
          supabase.from("donations").select("amount,donated_at,status,method"),
          supabase.from("volunteers").select("*", { count: "exact", head: true }),
          supabase.from("events").select("*", { count: "exact", head: true }),
          supabase.from("events").select("*", { count: "exact", head: true }).eq("status", "upcoming"),
          supabase.from("donations").select("id,donor_name,amount,method,status,donated_at").order("donated_at", { ascending: false }).limit(6),
          supabase.from("events").select("id,title,event_date,location,status").gte("event_date", new Date().toISOString()).order("event_date", { ascending: true }).limit(5),
        ]);
        if (!mounted) return;

        const donations = d.data ?? [];
        const approved = donations.filter((x) => x.status === "approved");
        const total = approved.reduce((s, x) => s + Number(x.amount || 0), 0);

        // Last 6 months
        const now = new Date();
        const buckets: Record<string, number> = {};
        for (let i = 5; i >= 0; i--) {
          const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
          buckets[`${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`] = 0;
        }
        approved.forEach((x) => {
          const dt = new Date(x.donated_at as string);
          const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
          if (key in buckets) buckets[key] += Number(x.amount || 0);
        });
        const months = ["জানু", "ফেব", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগ", "সেপ্ট", "অক্টো", "নভে", "ডিসে"];
        setMonthly(Object.entries(buckets).map(([k, val]) => {
          const [, mm] = k.split("-");
          return { month: months[parseInt(mm, 10) - 1], total: val };
        }));

        // By method
        const methodMap: Record<string, number> = {};
        approved.forEach((x) => {
          const key = x.method || "অন্যান্য";
          methodMap[key] = (methodMap[key] || 0) + Number(x.amount || 0);
        });
        setByMethod(Object.entries(methodMap).map(([name, value]) => ({ name, value })));

        setStats({
          members: m.count ?? 0,
          pendingMembers: mp.count ?? 0,
          donations: donations.length,
          donationsAmount: total,
          volunteers: v.count ?? 0,
          events: e.count ?? 0,
          upcomingEvents: eu.count ?? 0,
        });
        setRecentDonations((recent.data ?? []) as DonationRow[]);
        setUpcoming((upcomingEvts.data ?? []) as EventRow[]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const lastMonth = monthly[monthly.length - 1]?.total ?? 0;
  const prevMonth = monthly[monthly.length - 2]?.total ?? 0;
  const growth = prevMonth > 0 ? Math.round(((lastMonth - prevMonth) / prevMonth) * 100) : lastMonth > 0 ? 100 : 0;

  const cards = [
    { label: "মোট সদস্য", value: bn(stats?.members ?? 0), sub: `${bn(stats?.pendingMembers ?? 0)} জন অপেক্ষায়`, icon: Users, tone: "from-emerald-500 to-emerald-700", to: "/admin/members" },
    { label: "মোট দান", value: `৳ ${bn(stats?.donationsAmount ?? 0)}`, sub: `${bn(stats?.donations ?? 0)}টি লেনদেন`, icon: HeartHandshake, tone: "from-rose-500 to-rose-700", to: "/admin/donations" },
    { label: "স্বেচ্ছাসেবক", value: bn(stats?.volunteers ?? 0), sub: "সক্রিয় টিম", icon: HandHeart, tone: "from-amber-500 to-amber-700", to: "/admin/volunteers" },
    { label: "ইভেন্ট", value: bn(stats?.events ?? 0), sub: `${bn(stats?.upcomingEvents ?? 0)}টি আসন্ন`, icon: CalendarDays, tone: "from-sky-500 to-sky-700", to: "/admin/events" },
    { label: "জরুরি আবেদন", value: "—", sub: "ব্যবস্থাপনা করুন", icon: LifeBuoy, tone: "from-fuchsia-500 to-fuchsia-700", to: "/admin/help-requests" },
    { label: "মাসিক বৃদ্ধি", value: `${growth >= 0 ? "+" : ""}${bn(Math.abs(growth))}%`, sub: "গত মাসের তুলনায়", icon: TrendingUp, tone: growth >= 0 ? "from-indigo-500 to-indigo-700" : "from-red-500 to-red-700", to: "/admin/reports" },
  ];

  const pieColors = [
    "oklch(0.55 0.18 162)",
    "oklch(0.65 0.15 60)",
    "oklch(0.6 0.18 25)",
    "oklch(0.6 0.15 240)",
    "oklch(0.6 0.18 310)",
  ];

  return (
    <div className="space-y-6">
      {/* Premium hero */}
      <div
        className="relative overflow-hidden rounded-3xl border border-border p-6 md:p-8"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.22 0.05 162) 0%, oklch(0.28 0.08 162) 50%, oklch(0.18 0.04 162) 100%)",
        }}
      >
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full opacity-20" style={{ background: "var(--gradient-gold, gold)" }} />
        <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full opacity-10 bg-white" />
        <div className="relative">
          <p className="text-xs uppercase tracking-widest text-white/60">অ্যাডমিন ড্যাশবোর্ড</p>
          <h1 className="mt-2 text-2xl md:text-4xl font-bold text-white">স্বাগতম 👋</h1>
          <p className="mt-2 text-sm md:text-base text-white/70 max-w-xl">
            ফাউন্ডেশনের সামগ্রিক অবস্থা, রিয়েল-টাইম পরিসংখ্যান ও সাম্প্রতিক কার্যক্রম এক নজরে।
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link to="/admin/donations" className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs md:text-sm font-semibold" style={{ background: "var(--gradient-gold)", color: "oklch(0.22 0.05 160)" }}>
              <Plus className="h-3.5 w-3.5" /> দান রেকর্ড করুন
            </Link>
            <Link to="/admin/events" className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs md:text-sm font-medium bg-white/10 text-white hover:bg-white/20 transition">
              <CalendarDays className="h-3.5 w-3.5" /> নতুন ইভেন্ট
            </Link>
            <Link to="/admin/notices" className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs md:text-sm font-medium bg-white/10 text-white hover:bg-white/20 transition">
              <Megaphone className="h-3.5 w-3.5" /> নোটিশ প্রকাশ
            </Link>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.to}
            className="group bg-card border border-border rounded-2xl p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div className={`w-10 h-10 rounded-xl grid place-items-center bg-gradient-to-br ${c.tone} text-white shadow-md`}>
                <c.icon className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
            </div>
            <p className="text-xs text-muted-foreground mt-3">{c.label}</p>
            <p className="text-lg md:text-2xl font-bold mt-1 truncate">{loading ? "..." : c.value}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{c.sub}</p>
          </Link>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5">
          <div className="flex items-end justify-between mb-4">
            <div>
              <h3 className="font-semibold">মাসিক দান বিশ্লেষণ</h3>
              <p className="text-xs text-muted-foreground">গত ৬ মাসের অনুমোদিত দান</p>
            </div>
            <Link to="/admin/reports" className="text-xs text-primary hover:underline">বিস্তারিত →</Link>
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
          <h3 className="font-semibold">পেমেন্ট মাধ্যম</h3>
          <p className="text-xs text-muted-foreground mb-2">অনুমোদিত দানের বণ্টন</p>
          <div className="h-64">
            {byMethod.length === 0 ? (
              <div className="h-full grid place-items-center text-sm text-muted-foreground">কোনো ডেটা নেই</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byMethod} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                    {byMethod.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Recent activity row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">সাম্প্রতিক দান</h3>
              <p className="text-xs text-muted-foreground">সর্বশেষ {recentDonations.length}টি লেনদেন</p>
            </div>
            <Link to="/admin/donations" className="text-xs text-primary hover:underline">সব দেখুন →</Link>
          </div>
          {recentDonations.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">এখনো কোনো দান নেই।</p>
          ) : (
            <div className="divide-y divide-border">
              {recentDonations.map((r) => (
                <div key={r.id} className="py-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full grid place-items-center text-xs font-bold flex-shrink-0" style={{ background: "color-mix(in oklab, var(--primary) 15%, transparent)", color: "var(--primary)" }}>
                    {r.donor_name?.[0] ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{r.donor_name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{r.method} · {bnDate(r.donated_at)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold">৳ {bn(Number(r.amount))}</p>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      r.status === "approved" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                      : r.status === "pending" ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                      : "bg-red-500/15 text-red-700 dark:text-red-400"
                    }`}>
                      {r.status === "approved" ? "অনুমোদিত" : r.status === "pending" ? "অপেক্ষমাণ" : "বাতিল"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">আসন্ন ইভেন্ট</h3>
            <Link to="/admin/events" className="text-xs text-primary hover:underline">সব →</Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">কোনো আসন্ন ইভেন্ট নেই।</p>
          ) : (
            <div className="space-y-3">
              {upcoming.map((e) => {
                const dt = new Date(e.event_date);
                return (
                  <div key={e.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition">
                    <div className="w-12 h-12 rounded-xl border border-border grid place-items-center flex-shrink-0" style={{ background: "color-mix(in oklab, var(--accent) 30%, transparent)" }}>
                      <span className="text-[10px] uppercase text-muted-foreground leading-none">
                        {dt.toLocaleDateString("bn-BD", { month: "short" })}
                      </span>
                      <span className="text-base font-bold leading-tight">{dt.toLocaleDateString("bn-BD", { day: "numeric" })}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{e.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{e.location ?? "স্থান নির্ধারিত নয়"}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs font-semibold mb-2">দ্রুত পদক্ষেপ</p>
            <div className="grid grid-cols-2 gap-2">
              <Link to="/admin/members" className="text-[11px] px-2.5 py-2 rounded-lg border border-border hover:border-primary/40 hover:bg-accent/30 transition text-center">সদস্য</Link>
              <Link to="/admin/gallery" className="text-[11px] px-2.5 py-2 rounded-lg border border-border hover:border-primary/40 hover:bg-accent/30 transition text-center inline-flex items-center justify-center gap-1">
                <Images className="h-3 w-3" /> গ্যালারি
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
