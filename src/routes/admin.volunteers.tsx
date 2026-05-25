import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { HandHeart } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  AddButton, DataTable, Field, FormActions, Modal, PageHeader, SearchBox,
  StatusPill, confirmDelete, inputCls, showError,
} from "@/components/admin/AdminCrud";

export const Route = createFileRoute("/admin/volunteers")({
  head: () => ({ meta: [{ title: "স্বেচ্ছাসেবক | অ্যাডমিন" }] }),
  component: Page,
});

type V = {
  id: string; name: string; phone: string | null; area: string | null;
  skills: string | null; assigned_task: string | null; status: string; joined_at: string | null;
};

const EMPTY: Partial<V> = { name: "", phone: "", area: "", skills: "", assigned_task: "", status: "active", joined_at: new Date().toISOString().slice(0, 10) };

function Page() {
  const [rows, setRows] = useState<V[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [modal, setModal] = useState<{ open: boolean; data: Partial<V> }>({ open: false, data: EMPTY });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("volunteers").select("*").order("created_at", { ascending: false });
    if (error) showError(error);
    setRows((data ?? []) as V[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const filtered = rows.filter((r) => !q || [r.name, r.phone, r.area, r.skills].some((x) => x?.toLowerCase().includes(q.toLowerCase())));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const d = modal.data;
    const payload = {
      name: d.name!, phone: d.phone || null, area: d.area || null,
      skills: d.skills || null, assigned_task: d.assigned_task || null,
      status: d.status || "active", joined_at: d.joined_at || null,
    };
    const op = d.id ? supabase.from("volunteers").update(payload).eq("id", d.id) : supabase.from("volunteers").insert(payload);
    const { error } = await op;
    setSaving(false);
    if (error) return showError(error);
    toast.success(d.id ? "আপডেট সম্পন্ন" : "স্বেচ্ছাসেবক যোগ হয়েছে");
    setModal({ open: false, data: EMPTY });
    load();
  }

  async function remove(row: V) {
    if (!(await confirmDelete(`"${row.name}"-কে মুছবেন?`))) return;
    const { error } = await supabase.from("volunteers").delete().eq("id", row.id);
    if (error) return showError(error);
    toast.success("মুছে ফেলা হয়েছে");
    load();
  }

  return (
    <div className="space-y-6">
      <PageHeader icon={HandHeart} title="স্বেচ্ছাসেবক ব্যবস্থাপনা" subtitle={`মোট ${rows.length} জন`}
        action={<AddButton onClick={() => setModal({ open: true, data: EMPTY })} />} />
      <SearchBox value={q} onChange={setQ} placeholder="নাম, ফোন, এলাকা বা দক্ষতা..." />
      <DataTable<V>
        loading={loading} rows={filtered}
        onEdit={(r) => setModal({ open: true, data: r })} onDelete={remove}
        columns={[
          { key: "name", label: "নাম", render: (r) => <span className="font-medium">{r.name}</span> },
          { key: "phone", label: "ফোন" },
          { key: "area", label: "এলাকা" },
          { key: "skills", label: "দক্ষতা" },
          { key: "assigned_task", label: "দায়িত্ব" },
          { key: "status", label: "স্ট্যাটাস", render: (r) =>
            r.status === "active" ? <StatusPill tone="success" label="সক্রিয়" /> : <StatusPill tone="muted" label="নিষ্ক্রিয়" /> },
        ]}
      />
      <Modal open={modal.open} onClose={() => setModal({ open: false, data: EMPTY })} title={modal.data.id ? "সম্পাদনা" : "নতুন স্বেচ্ছাসেবক"}>
        <form onSubmit={save} className="space-y-3">
          <Field label="নাম" required>
            <input className={inputCls} required value={modal.data.name ?? ""} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, name: e.target.value } }))} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="ফোন"><input className={inputCls} value={modal.data.phone ?? ""} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, phone: e.target.value } }))} /></Field>
            <Field label="এলাকা"><input className={inputCls} value={modal.data.area ?? ""} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, area: e.target.value } }))} /></Field>
          </div>
          <Field label="দক্ষতা"><input className={inputCls} value={modal.data.skills ?? ""} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, skills: e.target.value } }))} /></Field>
          <Field label="দায়িত্ব / দল"><input className={inputCls} value={modal.data.assigned_task ?? ""} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, assigned_task: e.target.value } }))} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="যোগদান তারিখ"><input type="date" className={inputCls} value={modal.data.joined_at?.slice(0, 10) ?? ""} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, joined_at: e.target.value } }))} /></Field>
            <Field label="স্ট্যাটাস">
              <select className={inputCls} value={modal.data.status ?? "active"} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, status: e.target.value } }))}>
                <option value="active">সক্রিয়</option><option value="inactive">নিষ্ক্রিয়</option>
              </select>
            </Field>
          </div>
          <FormActions onCancel={() => setModal({ open: false, data: EMPTY })} submitting={saving} />
        </form>
      </Modal>
    </div>
  );
}
