import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  AddButton, DataTable, Field, FormActions, Modal, PageHeader, SearchBox,
  StatusPill, confirmDelete, inputCls, showError,
} from "@/components/admin/AdminCrud";

export const Route = createFileRoute("/admin/notices")({
  head: () => ({ meta: [{ title: "নোটিশ | অ্যাডমিন" }] }),
  component: Page,
});

type N = { id: string; title: string; content: string; image_url: string | null; is_published: boolean; published_at: string };

const EMPTY: Partial<N> = { title: "", content: "", image_url: "", is_published: true };

function Page() {
  const [rows, setRows] = useState<N[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [modal, setModal] = useState<{ open: boolean; data: Partial<N> }>({ open: false, data: EMPTY });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("notices").select("*").order("published_at", { ascending: false });
    if (error) showError(error);
    setRows((data ?? []) as N[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const filtered = rows.filter((r) => !q || [r.title, r.content].some((x) => x?.toLowerCase().includes(q.toLowerCase())));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const d = modal.data;
    const payload = {
      title: d.title!, content: d.content!, image_url: d.image_url || null,
      is_published: d.is_published ?? true,
    };
    const op = d.id ? supabase.from("notices").update(payload).eq("id", d.id) : supabase.from("notices").insert(payload);
    const { error } = await op;
    setSaving(false);
    if (error) return showError(error);
    toast.success(d.id ? "আপডেট সম্পন্ন" : "নোটিশ প্রকাশ হয়েছে");
    setModal({ open: false, data: EMPTY });
    load();
  }

  async function toggle(row: N) {
    const { error } = await supabase.from("notices").update({ is_published: !row.is_published }).eq("id", row.id);
    if (error) return showError(error);
    toast.success(row.is_published ? "অপ্রকাশিত" : "প্রকাশিত");
    load();
  }

  async function remove(row: N) {
    if (!(await confirmDelete(`"${row.title}" নোটিশ মুছবেন?`))) return;
    const { error } = await supabase.from("notices").delete().eq("id", row.id);
    if (error) return showError(error);
    toast.success("মুছে ফেলা হয়েছে");
    load();
  }

  return (
    <div className="space-y-6">
      <PageHeader icon={Megaphone} title="নোটিশ ব্যবস্থাপনা" subtitle={`মোট ${rows.length}টি নোটিশ`}
        action={<AddButton onClick={() => setModal({ open: true, data: EMPTY })} label="নতুন নোটিশ" />} />
      <SearchBox value={q} onChange={setQ} placeholder="শিরোনাম বা বিষয়বস্তু..." />
      <DataTable<N>
        loading={loading} rows={filtered}
        onEdit={(r) => setModal({ open: true, data: r })} onDelete={remove}
        columns={[
          { key: "title", label: "শিরোনাম", render: (r) => <div><div className="font-medium">{r.title}</div><div className="text-xs text-muted-foreground line-clamp-1">{r.content}</div></div> },
          { key: "published_at", label: "প্রকাশ", render: (r) => new Date(r.published_at).toLocaleDateString("bn-BD") },
          { key: "is_published", label: "অবস্থা", render: (r) => (
            <button onClick={(e) => { e.stopPropagation(); toggle(r); }}>
              {r.is_published ? <StatusPill tone="success" label="প্রকাশিত" /> : <StatusPill tone="muted" label="অপ্রকাশিত" />}
            </button>
          ) },
        ]}
      />
      <Modal open={modal.open} onClose={() => setModal({ open: false, data: EMPTY })} title={modal.data.id ? "নোটিশ সম্পাদনা" : "নতুন নোটিশ"}>
        <form onSubmit={save} className="space-y-3">
          <Field label="শিরোনাম" required>
            <input className={inputCls} required value={modal.data.title ?? ""} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, title: e.target.value } }))} />
          </Field>
          <Field label="বিষয়বস্তু" required>
            <textarea rows={5} className={inputCls} required value={modal.data.content ?? ""} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, content: e.target.value } }))} />
          </Field>
          <Field label="ছবি URL">
            <input className={inputCls} value={modal.data.image_url ?? ""} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, image_url: e.target.value } }))} />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={modal.data.is_published ?? true} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, is_published: e.target.checked } }))} />
            <span>সাইটে প্রকাশ করুন</span>
          </label>
          <FormActions onCancel={() => setModal({ open: false, data: EMPTY })} submitting={saving} />
        </form>
      </Modal>
    </div>
  );
}
