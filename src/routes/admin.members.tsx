import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { sendSms } from "@/lib/sms.functions";
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
  member_code: string | null;
  photo_url: string | null;
  created_at: string;
};

const EMPTY: Partial<Member> = { name: "", phone: "", email: "", area: "", role: "সদস্য", status: "pending", notes: "" };
type Tab = "pending" | "approved" | "rejected" | "all";

function Page() {
  const [rows, setRows] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<Tab>("pending");
  const [modal, setModal] = useState<{ open: boolean; data: Partial<Member> }>({ open: false, data: EMPTY });
  const [saving, setSaving] = useState(false);
  const sendSmsFn = useServerFn(sendSms);
  const [smsModal, setSmsModal] = useState<{ open: boolean; phone: string; name: string; message: string }>({
    open: false, phone: "", name: "", message: "",
  });
  const [smsSending, setSmsSending] = useState(false);

  function buildApprovalSms(m: { name: string; member_code: string | null }) {
    return `প্রিয় ${m.name}, চাঁদগাঁও ফাউন্ডেশনে আপনার সদস্যপদ অনুমোদিত হয়েছে।${m.member_code ? ` সদস্য কোড: ${m.member_code}।` : ""} ধন্যবাদ।`;
  }

  function openSmsFor(row: Member, presetMessage?: string) {
    if (!row.phone) {
      toast.error("এই সদস্যের ফোন নম্বর নেই");
      return;
    }
    setSmsModal({
      open: true,
      phone: row.phone,
      name: row.name,
      message: presetMessage ?? buildApprovalSms(row),
    });
  }

  async function sendSmsNow(e: React.FormEvent) {
    e.preventDefault();
    setSmsSending(true);
    try {
      const result = await sendSmsFn({ data: { to: smsModal.phone.trim(), msg: smsModal.message.trim() } });
      toast.success(result.msg || "SMS পাঠানো হয়েছে");
      setSmsModal((s) => ({ ...s, open: false }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "SMS পাঠানো ব্যর্থ হয়েছে");
    } finally {
      setSmsSending(false);
    }
  }

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("members").select("*").order("created_at", { ascending: false });
    if (error) showError(error);
    setRows((data ?? []) as Member[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const counts = {
    pending: rows.filter((r) => r.status === "pending").length,
    approved: rows.filter((r) => r.status === "approved").length,
    rejected: rows.filter((r) => r.status === "rejected").length,
    all: rows.length,
  };

  const filtered = rows
    .filter((r) => tab === "all" || r.status === tab)
    .filter((r) => !q || [r.name, r.phone, r.email, r.area, r.member_code].some((x) => x?.toLowerCase().includes(q.toLowerCase())));

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

  async function setStatus(row: Member, status: "approved" | "rejected" | "pending") {
    const { error } = await supabase.from("members").update({ status }).eq("id", row.id);
    if (error) return showError(error);
    if (status === "approved") {
      toast.success(`${row.name} অনুমোদিত · ডিজিটাল কার্ড তৈরি হয়েছে`);
    } else if (status === "rejected") {
      toast.success("প্রত্যাখ্যাত হয়েছে");
    } else {
      toast.success("পেন্ডিং-এ ফেরত");
    }
    load();
  }

  const tabs: { id: Tab; label: string; count: number; tone: string }[] = [
    { id: "pending", label: "অপেক্ষমান", count: counts.pending, tone: "amber" },
    { id: "approved", label: "অনুমোদিত", count: counts.approved, tone: "emerald" },
    { id: "rejected", label: "প্রত্যাখ্যাত", count: counts.rejected, tone: "rose" },
    { id: "all", label: "সকল", count: counts.all, tone: "slate" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Users} title="সদস্য ব্যবস্থাপনা" subtitle={`মোট ${counts.all} জন · ${counts.pending} অপেক্ষমান`}
        action={<AddButton onClick={() => setModal({ open: true, data: EMPTY })} />}
      />

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${tab === t.id ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-muted"}`}
          >
            {t.label}
            <span className={`ml-2 inline-flex items-center justify-center min-w-[22px] px-1.5 h-5 rounded-full text-[11px] font-bold ${tab === t.id ? "bg-primary-foreground/20" : "bg-muted"}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      <SearchBox value={q} onChange={setQ} placeholder="নাম, ফোন, ইমেইল, কোড বা এলাকা..." />
      <DataTable<Member>
        loading={loading}
        rows={filtered}
        onEdit={(r) => setModal({ open: true, data: r })}
        onDelete={remove}
        columns={[
          { key: "name", label: "সদস্য", render: (r) => (
            <div className="flex items-center gap-2">
              {r.photo_url
                ? <img src={r.photo_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                : <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">{r.name?.[0] ?? "?"}</div>}
              <div className="min-w-0">
                <div className="font-medium truncate">{r.name}</div>
                {r.member_code && <div className="text-[10px] font-mono text-muted-foreground">{r.member_code}</div>}
              </div>
            </div>
          ) },
          { key: "phone", label: "ফোন" },
          { key: "area", label: "এলাকা" },
          { key: "role", label: "ভূমিকা" },
          { key: "status", label: "স্ট্যাটাস", render: (r) => (
            <div className="flex items-center gap-1.5">
              {r.status === "approved" && <StatusPill tone="success" label="অনুমোদিত" />}
              {r.status === "rejected" && <StatusPill tone="danger" label="প্রত্যাখ্যাত" />}
              {r.status === "pending" && <StatusPill tone="warn" label="অপেক্ষমান" />}
              {r.status === "pending" && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); setStatus(r, "approved"); }} className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 font-semibold">✓ অনুমোদন</button>
                  <button onClick={(e) => { e.stopPropagation(); setStatus(r, "rejected"); }} className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-700 hover:bg-rose-500/20 font-semibold">✗ প্রত্যাখ্যান</button>
                </>
              )}
              {r.status === "rejected" && (
                <button onClick={(e) => { e.stopPropagation(); setStatus(r, "pending"); }} className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 font-semibold">↺ পুনঃবিবেচনা</button>
              )}
            </div>
          ) },
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
          {modal.data.id && modal.data.member_code && (
            <p className="text-xs text-muted-foreground">সদস্য কোড: <span className="font-mono font-bold">{modal.data.member_code}</span></p>
          )}
          <Field label="নোট">
            <textarea rows={2} className={inputCls} value={modal.data.notes ?? ""} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, notes: e.target.value } }))} />
          </Field>
          <FormActions onCancel={() => setModal({ open: false, data: EMPTY })} submitting={saving} />
        </form>
      </Modal>
    </div>
  );
}

