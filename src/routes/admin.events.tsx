import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  AddButton, DataTable, Field, FormActions, Modal, PageHeader, SearchBox,
  StatusPill, confirmDelete, inputCls, showError,
} from "@/components/admin/AdminCrud";

export const Route = createFileRoute("/admin/events")({
  head: () => ({ meta: [{ title: "ইভেন্ট | অ্যাডমিন" }] }),
  component: Page,
});

type E = { id: string; title: string; description: string | null; location: string | null; banner_url: string | null; event_date: string; status: string };

const EMPTY: Partial<E> = { title: "", description: "", location: "", banner_url: "", event_date: new Date().toISOString().slice(0, 16), status: "upcoming" };

function Page() {
  const [rows, setRows] = useState<E[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [modal, setModal] = useState<{ open: boolean; data: Partial<E> }>({ open: false, data: EMPTY });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("events").select("*").order("event_date", { ascending: false });
    if (error) showError(error);
    setRows((data ?? []) as E[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const filtered = rows.filter((r) => !q || [r.title, r.location].some((x) => x?.toLowerCase().includes(q.toLowerCase())));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const d = modal.data;
    const payload = {
      title: d.title!, description: d.description || null, location: d.location || null,
      banner_url: d.banner_url || null, event_date: new Date(d.event_date!).toISOString(), status: d.status || "upcoming",
    };
    const op = d.id ? supabase.from("events").update(payload).eq("id", d.id) : supabase.from("events").insert(payload);
    const { error } = await op;
    setSaving(false);
    if (error) return showError(error);
    toast.success(d.id ? "আপডেট সম্পন্ন" : "ইভেন্ট যোগ হয়েছে");
    setModal({ open: false, data: EMPTY });
    load();
  }

  async function remove(row: E) {
    if (!(await confirmDelete(`"${row.title}" ইভেন্ট মুছবেন?`))) return;
    const { error } = await supabase.from("events").delete().eq("id", row.id);
    if (error) return showError(error);
    toast.success("মুছে ফেলা হয়েছে");
    load();
  }

  const statusPill = (s: string) =>
    s === "upcoming" ? <StatusPill tone="info" label="আসন্ন" />
    : s === "ongoing" ? <StatusPill tone="warn" label="চলমান" />
    : <StatusPill tone="muted" label="সমাপ্ত" />;

  return (
    <div className="space-y-6">
      <PageHeader icon={CalendarDays} title="ইভেন্ট ব্যবস্থাপনা" subtitle={`মোট ${rows.length}টি ইভেন্ট`}
        action={<AddButton onClick={() => setModal({ open: true, data: EMPTY })} />} />
      <SearchBox value={q} onChange={setQ} placeholder="শিরোনাম বা স্থান..." />
      <DataTable<E>
        loading={loading} rows={filtered}
        onEdit={(r) => setModal({ open: true, data: { ...r, event_date: r.event_date.slice(0, 16) } })}
        onDelete={remove}
        columns={[
          { key: "title", label: "শিরোনাম", render: (r) => <div className="flex items-center gap-2">
            {r.banner_url && <img src={r.banner_url} alt="" className="h-9 w-9 rounded-lg object-cover" />}
            <span className="font-medium">{r.title}</span>
          </div> },
          { key: "event_date", label: "তারিখ", render: (r) => new Date(r.event_date).toLocaleString("bn-BD", { dateStyle: "medium", timeStyle: "short" }) },
          { key: "location", label: "স্থান" },
          { key: "status", label: "স্ট্যাটাস", render: (r) => statusPill(r.status) },
        ]}
      />
      <Modal open={modal.open} onClose={() => setModal({ open: false, data: EMPTY })} title={modal.data.id ? "ইভেন্ট সম্পাদনা" : "নতুন ইভেন্ট"}>
        <form onSubmit={save} className="space-y-3">
          <Field label="শিরোনাম" required>
            <input className={inputCls} required value={modal.data.title ?? ""} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, title: e.target.value } }))} />
          </Field>
          <Field label="বিবরণ">
            <textarea rows={3} className={inputCls} value={modal.data.description ?? ""} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, description: e.target.value } }))} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="তারিখ ও সময়" required>
              <input type="datetime-local" className={inputCls} required value={modal.data.event_date ?? ""} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, event_date: e.target.value } }))} />
            </Field>
            <Field label="স্থান">
              <input className={inputCls} value={modal.data.location ?? ""} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, location: e.target.value } }))} />
            </Field>
          </div>
          <Field label="ব্যানার URL">
            <input className={inputCls} value={modal.data.banner_url ?? ""} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, banner_url: e.target.value } }))} />
          </Field>
          <Field label="স্ট্যাটাস">
            <select className={inputCls} value={modal.data.status ?? "upcoming"} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, status: e.target.value } }))}>
              <option value="upcoming">আসন্ন</option><option value="ongoing">চলমান</option><option value="completed">সমাপ্ত</option>
            </select>
          </Field>
          <FormActions onCancel={() => setModal({ open: false, data: EMPTY })} submitting={saving} />
        </form>
      </Modal>
    </div>
  );
}
