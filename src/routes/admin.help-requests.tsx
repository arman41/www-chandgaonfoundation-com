import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { STATUS_LABELS, type HelpApplication, type HelpStatus } from "@/lib/help-applications";
import { Trash2, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/admin/help-requests")({
  component: Page,
});

const STATUS_OPTIONS: HelpStatus[] = [
  "pending",
  "under_review",
  "approved",
  "completed",
  "rejected",
];

function Page() {
  const { isAdmin } = useAuth();
  const [rows, setRows] = useState<HelpApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<HelpStatus | "all">("all");

  const load = async () => {
    setLoading(true);
    let q = supabase.from("help_applications").select("*").order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter);
    const { data, error } = await q;
    if (error) toast.error(error.message);
    setRows((data ?? []) as HelpApplication[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const updateStatus = async (id: string, status: HelpStatus) => {
    const { error } = await supabase.from("help_applications").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("স্ট্যাটাস আপডেট হয়েছে");
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));
  };

  const remove = async (id: string) => {
    if (!confirm("এই আবেদন মুছে ফেলবেন?")) return;
    const { error } = await supabase.from("help_applications").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("মুছে ফেলা হয়েছে");
    setRows((r) => r.filter((x) => x.id !== id));
  };

  return (
    <div className="max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">সাহায্যের আবেদন</h1>
          <p className="text-sm text-muted-foreground mt-1">আবেদন যাচাই ও অবস্থা আপডেট করুন।</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as HelpStatus | "all")}
            className="h-9 px-3 rounded-lg border border-input bg-background text-sm"
          >
            <option value="all">সব</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
          <button
            onClick={load}
            className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg border border-input bg-background text-sm hover:bg-muted"
          >
            <RefreshCw className="h-3.5 w-3.5" /> রিফ্রেশ
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-sm text-muted-foreground">লোড হচ্ছে...</div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">কোনো আবেদন নেই।</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">কোড</th>
                  <th className="px-4 py-3">নাম</th>
                  <th className="px-4 py-3">মোবাইল</th>
                  <th className="px-4 py-3">NID</th>
                  <th className="px-4 py-3">ধরন</th>
                  <th className="px-4 py-3">পরিমাণ</th>
                  <th className="px-4 py-3">স্ট্যাটাস</th>
                  <th className="px-4 py-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-border align-top">
                    <td className="px-4 py-3 font-mono text-xs">{r.app_code}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{r.name}</div>
                      {r.address && <div className="text-xs text-muted-foreground mt-0.5">{r.address}</div>}
                      <details className="mt-1">
                        <summary className="text-xs text-primary cursor-pointer">কারণ</summary>
                        <p className="text-xs text-muted-foreground mt-1 max-w-md whitespace-pre-wrap">{r.reason}</p>
                      </details>
                    </td>
                    <td className="px-4 py-3">{r.phone}</td>
                    <td className="px-4 py-3 font-mono text-xs">{r.nid}</td>
                    <td className="px-4 py-3">{r.type}</td>
                    <td className="px-4 py-3">{r.amount ? `৳ ${r.amount}` : "—"}</td>
                    <td className="px-4 py-3">
                      <select
                        value={r.status}
                        disabled={!isAdmin}
                        onChange={(e) => updateStatus(r.id, e.target.value as HelpStatus)}
                        className="h-8 px-2 rounded-md border border-input bg-background text-xs"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isAdmin && (
                        <button
                          onClick={() => remove(r.id)}
                          className="inline-flex items-center gap-1 text-xs text-destructive hover:underline"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> মুছুন
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
