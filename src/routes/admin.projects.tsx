import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FolderKanban } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  AddButton, DataTable, Field, FormActions, Modal, PageHeader, SearchBox,
  confirmDelete, inputCls, showError,
} from "@/components/admin/AdminCrud";
import { PROJECT_CATEGORIES, PROJECT_STATUS_LABELS, type AidProject } from "@/lib/aid-projects";

export const Route = createFileRoute("/admin/projects")({
  head: () => ({ meta: [{ title: "সাহায্য প্রকল্প | অ্যাডমিন" }] }),
  component: Page,
});

const EMPTY: Partial<AidProject> = {
  name: "", category: PROJECT_CATEGORIES[0], description: "",
  budget: null, goal_amount: null, raised_amount: 0,
  start_date: null, end_date: null, status: "active",
};

function Page() {
  const [rows, setRows] = useState<AidProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [modal, setModal] = useState<{ open: boolean; data: Partial<AidProject> }>({ open: false, data: EMPTY });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("aid_projects" as never)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) showError(error);
    setRows(((data as unknown as AidProject[]) ?? []));
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const filtered = rows.filter((r) =>
    !q || [r.name, r.category].some((x) => x?.toLowerCase().includes(q.toLowerCase()))
  );

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const d = modal.data;
      const payload = {
        name: d.name!,
        category: d.category || PROJECT_CATEGORIES[0],
        description: d.description || null,
        budget: d.budget ?? null,
        goal_amount: d.goal_amount ?? null,
        raised_amount: d.raised_amount ?? 0,
        start_date: d.start_date || null,
        end_date: d.end_date || null,
        status: d.status || "active",
      };
      const op = d.id
        ? supabase.from("aid_projects" as never).update(payload as never).eq("id", d.id)
        : supabase.from("aid_projects" as never).insert(payload as never);
      const { error } = await op;
      if (error) throw error;
      toast.success(d.id ? "আপডেট সম্পন্ন" : "প্রকল্প তৈরি হয়েছে");
      setModal({ open: false, data: EMPTY });
      load();
    } catch (err) {
      showError(err);
    } finally {
      setSaving(false);
    }
  }

  async function remove(row: AidProject) {
    if (!(await confirmDelete(`"${row.name}" প্রকল্প মুছবেন?`))) return;
    const { error } = await supabase.from("aid_projects" as never).delete().eq("id", row.id);
    if (error) return showError(error);
    toast.success("মুছে ফেলা হয়েছে");
    load();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={FolderKanban}
        title="সাহায্য প্রকল্প"
        subtitle={`মোট ${rows.length}টি প্রকল্প`}
        action={<AddButton onClick={() => setModal({ open: true, data: EMPTY })} label="+ নতুন প্রকল্প" />}
      />
      <SearchBox value={q} onChange={setQ} placeholder="প্রকল্পের নাম বা ক্যাটাগরি..." />
      <DataTable<AidProject>
        loading={loading}
        rows={filtered}
        onEdit={(r) => setModal({ open: true, data: r })}
        onDelete={remove}
        columns={[
          { key: "name", label: "নাম", render: (r) => <span className="font-medium">{r.name}</span> },
          { key: "category", label: "ক্যাটাগরি" },
          { key: "budget", label: "বাজেট", render: (r) => r.budget ? `৳ ${Number(r.budget).toLocaleString("bn-BD")}` : "—" },
          { key: "status", label: "অবস্থা", render: (r) => (
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              r.status === "active" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" :
              r.status === "completed" ? "bg-blue-500/10 text-blue-700 dark:text-blue-400" :
              "bg-muted text-muted-foreground"
            }`}>{PROJECT_STATUS_LABELS[r.status]}</span>
          )},
        ]}
      />
      <Modal open={modal.open} onClose={() => setModal({ open: false, data: EMPTY })} title={modal.data.id ? "প্রকল্প সম্পাদনা" : "নতুন প্রকল্প"}>
        <form onSubmit={save} className="space-y-3">
          <Field label="প্রকল্পের নাম" required>
            <input className={inputCls} required value={modal.data.name ?? ""} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, name: e.target.value } }))} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="ক্যাটাগরি" required>
              <select className={inputCls} required value={modal.data.category ?? PROJECT_CATEGORIES[0]} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, category: e.target.value } }))}>
                {PROJECT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="অবস্থা" required>
              <select className={inputCls} value={modal.data.status ?? "active"} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, status: e.target.value as AidProject["status"] } }))}>
                <option value="active">চলমান</option>
                <option value="completed">সম্পন্ন</option>
                <option value="closed">বন্ধ</option>
              </select>
            </Field>
          </div>
          <Field label="বিবরণ">
            <textarea rows={3} className={inputCls} value={modal.data.description ?? ""} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, description: e.target.value } }))} />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="বাজেট (টাকা)">
              <input type="number" className={inputCls} value={modal.data.budget ?? ""} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, budget: e.target.value ? Number(e.target.value) : null } }))} />
            </Field>
            <Field label="শুরু তারিখ">
              <input type="date" className={inputCls} value={modal.data.start_date ?? ""} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, start_date: e.target.value || null } }))} />
            </Field>
            <Field label="শেষ তারিখ">
              <input type="date" className={inputCls} value={modal.data.end_date ?? ""} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, end_date: e.target.value || null } }))} />
            </Field>
          </div>
          <FormActions onCancel={() => setModal({ open: false, data: EMPTY })} submitting={saving} />
        </form>
      </Modal>
    </div>
  );
}
