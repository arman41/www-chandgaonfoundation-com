import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  AddButton, DataTable, Field, FormActions, Modal, PageHeader, SearchBox,
  StatusPill, confirmDelete, inputCls, showError,
} from "@/components/admin/AdminCrud";

export const Route = createFileRoute("/admin/members")({
  head: () => ({ meta: [{ title: "সদস্য ব্যবস্থাপনা | অ্যাডমিন" }] }),
  component: Page,
});

type Member = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  area: string | null;
  role: string | null;
  status: string;
  notes: string | null;
  join_date: string | null;
};

const EMPTY: Partial<Member> = { name: "", phone: "", email: "", area: "", role: "সদস্য", status: "pending", notes: "" };

function Page() {
  const [rows, setRows] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [modal, setModal] = useState<{ open: boolean; data: Partial<Member> }>({ open: false, data: EMPTY });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("members").select("*").order("created_at", { ascending: false });
    if (error) showError(error);
    setRows((data ?? []) as Member[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const filtered = rows.filter((r) =>
    !q || [r.name, r.phone, r.email, r.area].some((x) => x?.toLowerCase().includes(q.toLowerCase())),
  );

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const d = modal.data;
    const payload = {
      name: d.name!, phone: d.phone || null, email: d.email || null,
      area: d.area || null, role: d.role || "সদস্য", status: d.status || "pending", notes: d.notes || null,
    };
    const op = d.id
      ? supabase.from("members").update(payload).eq("id", d.id)
      : supabase.from("members").insert(payload);
    const { error } = await op;
    setSaving(false);
    if (error) return showError(error);
    toast.success(d.id ? "আপডেট সম্পন্ন" : "সদস্য যোগ হয়েছে");
    setModal({ open: false, data: EMPTY });
    load();
  }

  async function remove(row: Member) {
    if (!(await confirmDelete(`"${row.name}" সদস্যকে মুছবেন?`))) return;
    const { error } = await supabase.from("members").delete().eq("id", row.id);
    if (error) return showError(error);
    toast.success("মুছে ফেলা হয়েছে");
    load();
  }

  async function approve(row: Member) {
    const { error } = await supabase.from("members").update({ status: "approved" }).eq("id", row.id);
    if (error) return showError(error);
    toast.success("অনুমোদিত হয়েছে");
    load();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Users} title="সদস্য ব্যবস্থাপনা" subtitle={`মোট ${rows.length} জন সদস্য`}
        action={<AddButton onClick={() => setModal({ open: true, data: EMPTY })} />}
      />
      <SearchBox value={q} onChange={setQ} placeholder="নাম, ফোন, ইমেইল বা এলাকা..." />
      <DataTable<Member>
        loading={loading}
        rows={filtered}
        onEdit={(r) => setModal({ open: true, data: r })}
        onDelete={remove}
        columns={[
          { key: "name", label: "নাম", render: (r) => <span className="font-medium">{r.name}</span> },
          { key: "phone", label: "ফোন" },
          { key: "area", label: "এলাকা" },
          { key: "role", label: "ভূমিকা" },
          { key: "status", label: "স্ট্যাটাস", render: (r) =>
            r.status === "approved" ? <StatusPill tone="success" label="অনুমোদিত" />
            : r.status === "rejected" ? <StatusPill tone="danger" label="প্রত্যাখ্যাত" />
            : <button onClick={(e) => { e.stopPropagation(); approve(r); }} className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">অপেক্ষমান · অনুমোদন</button>
          },
        ]}
      />
      <Modal open={modal.open} onClose={() => setModal({ open: false, data: EMPTY })} title={modal.data.id ? "সদস্য সম্পাদনা" : "নতুন সদস্য"}>
        <form onSubmit={save} className="space-y-3">
          <Field label="নাম" required>
            <input className={inputCls} required value={modal.data.name ?? ""} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, name: e.target.value } }))} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="ফোন">
              <input className={inputCls} value={modal.data.phone ?? ""} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, phone: e.target.value } }))} />
            </Field>
            <Field label="ইমেইল">
              <input type="email" className={inputCls} value={modal.data.email ?? ""} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, email: e.target.value } }))} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="এলাকা">
              <input className={inputCls} value={modal.data.area ?? ""} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, area: e.target.value } }))} />
            </Field>
            <Field label="ভূমিকা">
              <input className={inputCls} value={modal.data.role ?? ""} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, role: e.target.value } }))} />
            </Field>
          </div>
          <Field label="স্ট্যাটাস">
            <select className={inputCls} value={modal.data.status ?? "pending"} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, status: e.target.value } }))}>
              <option value="pending">অপেক্ষমান</option>
              <option value="approved">অনুমোদিত</option>
              <option value="rejected">প্রত্যাখ্যাত</option>
            </select>
          </Field>
          <Field label="নোট">
            <textarea rows={2} className={inputCls} value={modal.data.notes ?? ""} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, notes: e.target.value } }))} />
          </Field>
          <FormActions onCancel={() => setModal({ open: false, data: EMPTY })} submitting={saving} />
        </form>
      </Modal>
    </div>
  );
}
