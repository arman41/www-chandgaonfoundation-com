import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { STATUS_LABELS, type HelpApplication, type HelpStatus } from "@/lib/help-applications";
import { Trash2, RefreshCw, Pencil, CheckCircle2, XCircle, LifeBuoy } from "lucide-react";
import {
  PageHeader,
  Modal,
  Field,
  FormActions,
  inputCls,
  confirmDelete,
  showError,
} from "@/components/admin/AdminCrud";

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
  const [modal, setModal] = useState<{ open: boolean; data: HelpApplication | null }>({ open: false, data: null });
  const [saving, setSaving] = useState(false);

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

  const remove = async (row: HelpApplication) => {
    if (!(await confirmDelete(`"${row.name}"-এর আবেদন মুছবেন?`))) return;
    const { error } = await supabase.from("help_applications").delete().eq("id", row.id);
    if (error) return toast.error(error.message);
    toast.success("মুছে ফেলা হয়েছে");
    setRows((r) => r.filter((x) => x.id !== row.id));
  };

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!modal.data) return;
    setSaving(true);
    const d = modal.data;
    const payload = {
      name: d.name,
      phone: d.phone,
      nid: d.nid,
      address: d.address || null,
      type: d.type,
      amount: d.amount || null,
      reason: d.reason,
      status: d.status,
      admin_notes: d.admin_notes || null,
    };
    const { error } = await supabase.from("help_applications").update(payload).eq("id", d.id);
    setSaving(false);
    if (error) return showError(error);
    toast.success("সংরক্ষণ হয়েছে");
    setModal({ open: false, data: null });
    load();
  };

  return (
    <div className="max-w-6xl space-y-6">
      <PageHeader
        icon={LifeBuoy}
        title="সাহায্যের আবেদন"
        subtitle="আবেদন যাচাই, সম্পাদনা ও অবস্থা আপডেট করুন।"
        action={
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
        }
      />

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
                        <div className="inline-flex items-center gap-1">
                          {r.status !== "approved" && (
                            <button
                              onClick={() => updateStatus(r.id, "approved")}
                              title="অনুমোদন"
                              className="h-8 w-8 grid place-items-center rounded-lg hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-600"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {r.status !== "rejected" && (
                            <button
                              onClick={() => updateStatus(r.id, "rejected")}
                              title="প্রত্যাখ্যান"
                              className="h-8 w-8 grid place-items-center rounded-lg hover:bg-amber-500/10 text-muted-foreground hover:text-amber-600"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => setModal({ open: true, data: { ...r } })}
                            title="এডিট"
                            className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted text-muted-foreground hover:text-primary"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => remove(r)}
                            title="মুছুন"
                            className="h-8 w-8 grid place-items-center rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modal.open} onClose={() => setModal({ open: false, data: null })} title="আবেদন সম্পাদনা">
        {modal.data && (
          <form onSubmit={save} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="নাম" required>
                <input className={inputCls} value={modal.data.name} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data!, name: e.target.value } }))} required />
              </Field>
              <Field label="মোবাইল" required>
                <input className={inputCls} value={modal.data.phone} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data!, phone: e.target.value } }))} required />
              </Field>
              <Field label="NID" required>
                <input className={inputCls} value={modal.data.nid} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data!, nid: e.target.value } }))} required />
              </Field>
              <Field label="ধরন" required>
                <input className={inputCls} value={modal.data.type} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data!, type: e.target.value } }))} required />
              </Field>
              <Field label="পরিমাণ">
                <input className={inputCls} value={modal.data.amount ?? ""} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data!, amount: e.target.value } }))} />
              </Field>
              <Field label="স্ট্যাটাস">
                <select className={inputCls} value={modal.data.status} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data!, status: e.target.value as HelpStatus } }))}>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="ঠিকানা">
              <input className={inputCls} value={modal.data.address ?? ""} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data!, address: e.target.value } }))} />
            </Field>
            <Field label="কারণ" required>
              <textarea rows={3} className={inputCls} value={modal.data.reason} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data!, reason: e.target.value } }))} required />
            </Field>
            <Field label="অ্যাডমিন নোট">
              <textarea rows={2} className={inputCls} value={modal.data.admin_notes ?? ""} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data!, admin_notes: e.target.value } }))} />
            </Field>
            <FormActions onCancel={() => setModal({ open: false, data: null })} submitting={saving} />
          </form>
        )}
      </Modal>
    </div>
  );
}
