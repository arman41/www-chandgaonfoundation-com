import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollText, Shield, ShieldOff, LogIn, LogOut as LogOutIcon, Activity } from "lucide-react";

export const Route = createFileRoute("/admin/activity-logs")({
  head: () => ({ meta: [{ title: "অ্যাক্টিভিটি লগ | অ্যাডমিন প্যানেল" }] }),
  component: ActivityLogsPage,
});

type LogRow = {
  id: string;
  actor_email: string | null;
  action: string;
  target_type: string | null;
  target_label: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
};

const ACTION_META: Record<string, { label: string; icon: typeof Activity; tone: string }> = {
  "role.granted": { label: "রোল প্রদান", icon: Shield, tone: "text-emerald-600 bg-emerald-500/10" },
  "role.revoked": { label: "রোল প্রত্যাহার", icon: ShieldOff, tone: "text-destructive bg-destructive/10" },
  "auth.login": { label: "অ্যাডমিন লগইন", icon: LogIn, tone: "text-primary bg-primary/10" },
  "auth.logout": { label: "অ্যাডমিন লগআউট", icon: LogOutIcon, tone: "text-muted-foreground bg-muted" },
};

function ActivityLogsPage() {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    let q = supabase.from("admin_activity_logs").select("*").order("created_at", { ascending: false }).limit(200);
    if (filter !== "all") q = q.eq("action", filter);
    q.then(({ data }) => {
      setLogs((data ?? []) as LogRow[]);
      setLoading(false);
    });
  }, [filter]);

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString("bn-BD", { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <span className="h-10 w-10 rounded-xl grid place-items-center bg-primary/10 text-primary">
          <ScrollText className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold">অ্যাক্টিভিটি লগ</h1>
          <p className="text-sm text-muted-foreground">অ্যাডমিন অ্যাক্সেস ও রোল পরিবর্তনের সম্পূর্ণ ইতিহাস</p>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {[
          { v: "all", l: "সব" },
          { v: "role.granted", l: "রোল প্রদান" },
          { v: "role.revoked", l: "রোল প্রত্যাহার" },
          { v: "auth.login", l: "লগইন" },
          { v: "auth.logout", l: "লগআউট" },
        ].map((f) => (
          <button
            key={f.v}
            onClick={() => setFilter(f.v)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
              filter === f.v ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"
            }`}
          >
            {f.l}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">লোড হচ্ছে...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">কোনো রেকর্ড নেই</div>
        ) : (
          <ul className="divide-y divide-border">
            {logs.map((log) => {
              const meta = ACTION_META[log.action] ?? { label: log.action, icon: Activity, tone: "text-muted-foreground bg-muted" };
              const Icon = meta.icon;
              const role = (log.details as { role?: string } | null)?.role;
              return (
                <li key={log.id} className="p-4 flex items-start gap-3 hover:bg-muted/30 transition">
                  <span className={`h-9 w-9 rounded-lg grid place-items-center flex-shrink-0 ${meta.tone}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="font-semibold text-sm">{meta.label}</span>
                      {role && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-accent/40 font-mono">{role}</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 truncate">
                      <span className="font-medium text-foreground">{log.actor_email ?? "সিস্টেম"}</span>
                      {log.target_label && (
                        <> → <span className="font-medium text-foreground">{log.target_label}</span></>
                      )}
                    </p>
                    <p className="text-[11px] text-muted-foreground/80 mt-1">
                      {fmt(log.created_at)}
                      {log.ip_address && <> · IP: {log.ip_address}</>}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
