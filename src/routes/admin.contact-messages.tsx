import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Inbox, Mail, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, SearchBox, StatusPill, confirmDelete, showError } from "@/components/admin/AdminCrud";

export const Route = createFileRoute("/admin/contact-messages")({
  head: () => ({ meta: [{ title: "যোগাযোগ বার্তা | অ্যাডমিন" }] }),
  component: Page,
});

type M = { id: string; name: string; email: string; message: string; status: string | null; created_at: string };

function Page() {
  const [rows, setRows] = useState<M[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    const { data, error } = await (supabase.from("contact_messages" as never) as any)
      .select("*").order("created_at", { ascending: false });
    if (error) showError(error);
    setRows((data ?? []) as M[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const filtered = rows.filter((r) => !q || [r.name, r.email, r.message].some((x) => x?.toLowerCase().includes(q.toLowerCase())));

  async function toggleRead(row: M) {
    const next = row.status === "read" ? "new" : "read";
    const { error } = await (supabase.from("contact_messages" as never) as any).update({ status: next }).eq("id", row.id);
    if (error) return showError(error);
    load();
  }

  async function remove(row: M) {
    if (!(await confirmDelete(`"${row.name}" এর বার্তা মুছবেন?`))) return;
    const { error } = await (supabase.from("contact_messages" as never) as any).delete().eq("id", row.id);
    if (error) return showError(error);
    toast.success("মুছে ফেলা হয়েছে");
    load();
  }

  const unread = rows.filter((r) => r.status !== "read").length;

  return (
    <div className="space-y-6">
      <PageHeader icon={Inbox} title="যোগাযোগ বার্তা" subtitle={`মোট ${rows.length}টি · অপঠিত ${unread}টি`} />
      <SearchBox value={q} onChange={setQ} placeholder="নাম, ইমেইল বা বার্তা খুঁজুন..." />

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">লোড হচ্ছে...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border border-border rounded-xl">কোনো বার্তা নেই</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className={`p-4 rounded-xl border ${r.status === "read" ? "border-border bg-card" : "border-primary/40 bg-primary/5"}`}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{r.name}</span>
                    <a href={`mailto:${r.email}`} className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />{r.email}
                    </a>
                    {r.status === "read"
                      ? <StatusPill tone="muted" label="পঠিত" />
                      : <StatusPill tone="success" label="নতুন" />}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(r.created_at).toLocaleString("bn-BD")}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleRead(r)} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-accent">
                    {r.status === "read" ? "অপঠিত করুন" : "পঠিত করুন"}
                  </button>
                  <button onClick={() => remove(r)} className="text-xs px-3 py-1.5 rounded-lg border border-destructive/40 text-destructive hover:bg-destructive/10 inline-flex items-center gap-1">
                    <Trash2 className="w-3.5 h-3.5" /> মুছুন
                  </button>
                </div>
              </div>
              <p className="mt-3 text-sm whitespace-pre-wrap text-foreground/90">{r.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
