import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { HandHeart, IdCard, Printer, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { sendSms } from "@/lib/sms.functions";
import {
  AddButton, DataTable, Field, FormActions, Modal, PageHeader, SearchBox,
  StatusPill, confirmDelete, inputCls, showError,
} from "@/components/admin/AdminCrud";
import { VolunteerSmartCard } from "@/components/VolunteerSmartCard";

export const Route = createFileRoute("/admin/volunteers")({
  head: () => ({ meta: [{ title: "স্বেচ্ছাসেবক | অ্যাডমিন" }] }),
  component: Page,
});


type V = {
  id: string; name: string; phone: string | null; area: string | null;
  skills: string | null; assigned_task: string | null; status: string;
  joined_at: string | null; expires_at: string | null;
  volunteer_code: string | null; photo_url: string | null;
  role: string | null; blood_group: string | null;
};

const EMPTY: Partial<V> = {
  name: "", phone: "", area: "", skills: "", assigned_task: "",
  status: "active", role: "স্বেচ্ছাসেবক", blood_group: "", photo_url: "",
  joined_at: new Date().toISOString().slice(0, 10),
};

function Page() {
  const [rows, setRows] = useState<V[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [modal, setModal] = useState<{ open: boolean; data: Partial<V> }>({ open: false, data: EMPTY });
  const [saving, setSaving] = useState(false);
  const [cardModal, setCardModal] = useState<V | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("volunteers").select("*").order("created_at", { ascending: false });
    if (error) showError(error);
    setRows((data ?? []) as V[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const filtered = rows.filter((r) => !q || [r.name, r.phone, r.area, r.skills, r.volunteer_code].some((x) => x?.toLowerCase().includes(q.toLowerCase())));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const d = modal.data;
    const payload = {
      name: d.name!, phone: d.phone || null, area: d.area || null,
      skills: d.skills || null, assigned_task: d.assigned_task || null,
      status: d.status || "active", joined_at: d.joined_at || null,
      role: d.role || null, blood_group: d.blood_group || null,
      photo_url: d.photo_url || null,
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
      <SearchBox value={q} onChange={setQ} placeholder="নাম, ফোন, কোড, এলাকা বা দক্ষতা..." />
      <DataTable<V>
        loading={loading} rows={filtered}
        onEdit={(r) => setModal({ open: true, data: r })} onDelete={remove}
        columns={[
          { key: "name", label: "নাম", render: (r) => (
            <div className="flex items-center gap-2">
              {r.photo_url
                ? <img src={r.photo_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                : <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">{r.name?.[0] ?? "?"}</div>}
              <div className="min-w-0">
                <div className="font-medium truncate">{r.name}</div>
                {r.volunteer_code && <div className="text-[10px] font-mono text-muted-foreground">{r.volunteer_code}</div>}
              </div>
            </div>
          ) },
          { key: "phone", label: "ফোন" },
          { key: "area", label: "এলাকা" },
          { key: "assigned_task", label: "দায়িত্ব" },
          { key: "status", label: "স্ট্যাটাস", render: (r) => (
            <div className="flex items-center gap-1.5">
              {r.status === "active" ? <StatusPill tone="success" label="সক্রিয়" /> : <StatusPill tone="muted" label="নিষ্ক্রিয়" />}
              {r.volunteer_code && (
                <button
                  onClick={(e) => { e.stopPropagation(); setCardModal(r); }}
                  className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 font-semibold"
                >
                  <IdCard className="w-3 h-3" /> কার্ড
                </button>
              )}
            </div>
          ) },
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
          <div className="grid grid-cols-2 gap-3">
            <Field label="ভূমিকা"><input className={inputCls} value={modal.data.role ?? ""} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, role: e.target.value } }))} /></Field>
            <Field label="রক্তের গ্রুপ">
              <select className={inputCls} value={modal.data.blood_group ?? ""} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, blood_group: e.target.value } }))}>
                <option value="">—</option>
                {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </Field>
          </div>
          <Field label="ছবির URL"><input className={inputCls} placeholder="https://..." value={modal.data.photo_url ?? ""} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, photo_url: e.target.value } }))} /></Field>
          <Field label="দক্ষতা"><input className={inputCls} value={modal.data.skills ?? ""} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, skills: e.target.value } }))} /></Field>
          <Field label="দায়িত্ব / দল"><input className={inputCls} value={modal.data.assigned_task ?? ""} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, assigned_task: e.target.value } }))} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="যোগদান তারিখ"><input type="date" className={inputCls} value={modal.data.joined_at?.slice(0, 10) ?? ""} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, joined_at: e.target.value } }))} /></Field>
            <Field label="স্ট্যাটাস">
              <select className={inputCls} value={modal.data.status ?? "active"} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, status: e.target.value } }))}>
                <option value="active">সক্রিয়</option><option value="inactive">নিষ্ক্রিয়</option><option value="pending">অপেক্ষমান</option>
              </select>
            </Field>
          </div>
          {modal.data.id && modal.data.volunteer_code && (
            <p className="text-xs text-muted-foreground">কোড: <span className="font-mono font-bold">{modal.data.volunteer_code}</span></p>
          )}
          <FormActions onCancel={() => setModal({ open: false, data: EMPTY })} submitting={saving} />
        </form>
      </Modal>

      <CardPreview row={cardModal} onClose={() => setCardModal(null)} />
    </div>
  );
}

function CardPreview({ row, onClose }: { row: V | null; onClose: () => void }) {
  const verifyUrl = useMemo(() => {
    if (!row?.volunteer_code || typeof window === "undefined") return "";
    return `${window.location.origin}/v/${row.volunteer_code}`;
  }, [row]);
  if (!row) return null;
  return (
    <Modal open={!!row} onClose={onClose} title={`স্মার্ট আইডি কার্ড — ${row.name}`}>
      <div className="space-y-4 print:space-y-2">
        <div className="grid sm:grid-cols-2 gap-4">
          <VolunteerSmartCard data={row} verifyUrl={verifyUrl} side="front" />
          <VolunteerSmartCard data={row} verifyUrl={verifyUrl} side="back" />
        </div>
        <p className="text-xs text-muted-foreground text-center break-all">
          যাচাই লিংক: <span className="font-mono">{verifyUrl}</span>
        </p>
        <div className="flex justify-end gap-2 print:hidden">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm font-semibold hover:bg-muted">বন্ধ</button>
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold">
            <Printer className="w-4 h-4" /> প্রিন্ট
          </button>
        </div>
      </div>
    </Modal>
  );
}
