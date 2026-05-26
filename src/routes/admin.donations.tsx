import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { HeartHandshake } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  AddButton, DataTable, Field, FormActions, Modal, PageHeader, SearchBox,
  StatusPill, confirmDelete, inputCls, showError,
} from "@/components/admin/AdminCrud";

export const Route = createFileRoute("/admin/donations")({
  head: () => ({ meta: [{ title: "দান ব্যবস্থাপনা | অ্যাডমিন" }] }),
  component: Page,
});

type Donation = {
  id: string;
  donor_name: string;
  donor_phone: string | null;
  amount: number;
  method: string;
  purpose: string | null;
  transaction_id: string | null;
  status: string;
  donated_at: string;
};

const EMPTY: Partial<Donation> = { donor_name: "", amount: 0, method: "Cash", status: "pending", donated_at: new Date().toISOString().slice(0, 10) };

function Page() {
  const [rows, setRows] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [modal, setModal] = useState<{ open: boolean; data: Partial<Donation> }>({ open: false, data: EMPTY });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("donations").select("*").order("donated_at", { ascending: false });
    if (error) showError(error);
    setRows((data ?? []) as Donation[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const filtered = rows.filter((r) => {
    if (filter !== "all" && r.status !== filter) return false;
    if (q && ![r.donor_name, r.donor_phone, r.transaction_id, r.purpose].some((x) => x?.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });

  const total = filtered.filter((r) => r.status === "approved").reduce((s, r) => s + Number(r.amount), 0);
  const pendingCount = rows.filter((r) => r.status === "pending").length;
  const approvedCount = rows.filter((r) => r.status === "approved").length;
  const rejectedCount = rows.filter((r) => r.status === "rejected").length;
  const totalAll = rows.filter((r) => r.status === "approved").reduce((s, r) => s + Number(r.amount), 0);
  const byMethod = rows.filter((r) => r.status === "approved").reduce<Record<string, number>>((acc, r) => {
    acc[r.method] = (acc[r.method] || 0) + Number(r.amount);
    return acc;
  }, {});

  function exportCsv() {
    const headers = ["Date", "Donor", "Phone", "Amount", "Method", "Purpose", "TX ID", "Status"];
    const lines = [headers.join(",")].concat(
      filtered.map((r) =>
        [r.donated_at, r.donor_name, r.donor_phone ?? "", r.amount, r.method, r.purpose ?? "", r.transaction_id ?? "", r.status]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
      )
    );
    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `donations-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const d = modal.data;
    const payload = {
      donor_name: d.donor_name!, donor_phone: d.donor_phone || null,
      amount: Number(d.amount) || 0, method: d.method || "Cash",
      purpose: d.purpose || null, transaction_id: d.transaction_id || null,
      status: d.status || "pending", donated_at: d.donated_at!,
    };
    const op = d.id ? supabase.from("donations").update(payload).eq("id", d.id) : supabase.from("donations").insert(payload);
    const { error } = await op;
    setSaving(false);
    if (error) return showError(error);
    toast.success(d.id ? "আপডেট সম্পন্ন" : "দান যোগ হয়েছে");
    setModal({ open: false, data: EMPTY });
    load();
  }

  async function setStatus(row: Donation, status: string) {
    const { error } = await supabase.from("donations").update({ status }).eq("id", row.id);
    if (error) return showError(error);
    toast.success("স্ট্যাটাস আপডেট হয়েছে");
    load();
  }

  async function remove(row: Donation) {
    if (!(await confirmDelete(`${row.donor_name}-এর দান মুছবেন?`))) return;
    const { error } = await supabase.from("donations").delete().eq("id", row.id);
    if (error) return showError(error);
    toast.success("মুছে ফেলা হয়েছে");
    load();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={HeartHandshake} title="দান ব্যবস্থাপনা"
        subtitle={`মোট অনুমোদিত: ৳ ${total.toLocaleString("bn-BD")} · ${filtered.length} রেকর্ড`}
        action={
          <div className="flex gap-2">
            <button onClick={exportCsv} className="px-3 py-2 rounded-full text-xs font-semibold border border-border hover:bg-muted">⬇ CSV</button>
            <AddButton onClick={() => setModal({ open: true, data: EMPTY })} />
          </div>
        }
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="মোট অনুমোদিত" value={`৳ ${totalAll.toLocaleString("bn-BD")}`} tone="emerald" />
        <StatCard label="অপেক্ষমান" value={String(pendingCount)} tone="amber" />
        <StatCard label="অনুমোদিত" value={String(approvedCount)} tone="emerald" />
        <StatCard label="প্রত্যাখ্যাত" value={String(rejectedCount)} tone="rose" />
      </div>
      {Object.keys(byMethod).length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">পদ্ধতি অনুযায়ী মোট</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(byMethod).map(([m, v]) => (
              <span key={m} className="px-3 py-1.5 rounded-full bg-muted text-sm">
                <strong>{m}</strong> · ৳{v.toLocaleString("bn-BD")}
              </span>
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-2 items-center">
        <SearchBox value={q} onChange={setQ} placeholder="দাতা / ফোন / ট্রানজেকশন..." />
        <div className="flex gap-1.5">
          {(["all", "pending", "approved", "rejected"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border ${filter === f ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}>
              {{ all: "সব", pending: "অপেক্ষমান", approved: "অনুমোদিত", rejected: "প্রত্যাখ্যাত" }[f]}
            </button>
          ))}
        </div>
      </div>
      <DataTable<Donation>
        loading={loading}
        rows={filtered}
        onEdit={(r) => setModal({ open: true, data: r })}
        onDelete={remove}
        columns={[
          { key: "donor_name", label: "দাতা", render: (r) => <div><div className="font-medium">{r.donor_name}</div><div className="text-xs text-muted-foreground">{r.donor_phone}</div></div> },
          { key: "amount", label: "পরিমাণ", render: (r) => <span className="font-semibold">৳ {Number(r.amount).toLocaleString("bn-BD")}</span> },
          { key: "method", label: "মাধ্যম" },
          { key: "purpose", label: "উদ্দেশ্য" },
          { key: "donated_at", label: "তারিখ", render: (r) => new Date(r.donated_at).toLocaleDateString("bn-BD") },
          { key: "status", label: "স্ট্যাটাস", render: (r) =>
            r.status === "approved" ? <StatusPill tone="success" label="অনুমোদিত" />
            : r.status === "rejected" ? <StatusPill tone="danger" label="প্রত্যাখ্যাত" />
            : (
              <div className="flex gap-1">
                <button onClick={(e) => { e.stopPropagation(); setStatus(r, "approved"); }} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">অনুমোদন</button>
                <button onClick={(e) => { e.stopPropagation(); setStatus(r, "rejected"); }} className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20">বাতিল</button>
              </div>
            )
          },
        ]}
      />
      <Modal open={modal.open} onClose={() => setModal({ open: false, data: EMPTY })} title={modal.data.id ? "দান সম্পাদনা" : "নতুন দান"}>
        <form onSubmit={save} className="space-y-3">
          <Field label="দাতার নাম" required>
            <input className={inputCls} required value={modal.data.donor_name ?? ""} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, donor_name: e.target.value } }))} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="ফোন">
              <input className={inputCls} value={modal.data.donor_phone ?? ""} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, donor_phone: e.target.value } }))} />
            </Field>
            <Field label="পরিমাণ (৳)" required>
              <input type="number" min="0" step="1" className={inputCls} required value={modal.data.amount ?? 0} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, amount: Number(e.target.value) } }))} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="মাধ্যম">
              <select className={inputCls} value={modal.data.method ?? "Cash"} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, method: e.target.value } }))}>
                <option>Cash</option><option>bKash</option><option>Nagad</option><option>Rocket</option><option>Bank</option>
              </select>
            </Field>
            <Field label="তারিখ" required>
              <input type="date" className={inputCls} required value={modal.data.donated_at?.slice(0, 10) ?? ""} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, donated_at: e.target.value } }))} />
            </Field>
          </div>
          <Field label="ট্রানজেকশন ID">
            <input className={inputCls} value={modal.data.transaction_id ?? ""} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, transaction_id: e.target.value } }))} />
          </Field>
          <Field label="উদ্দেশ্য">
            <input className={inputCls} value={modal.data.purpose ?? ""} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, purpose: e.target.value } }))} />
          </Field>
          <Field label="স্ট্যাটাস">
            <select className={inputCls} value={modal.data.status ?? "pending"} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, status: e.target.value } }))}>
              <option value="pending">অপেক্ষমান</option><option value="approved">অনুমোদিত</option><option value="rejected">প্রত্যাখ্যাত</option>
            </select>
          </Field>
          <FormActions onCancel={() => setModal({ open: false, data: EMPTY })} submitting={saving} />
        </form>
      </Modal>
    </div>
  );
}
