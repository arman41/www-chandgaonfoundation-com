import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Users, MessageSquare, Download, Upload, IdCard, Printer, FileText } from "lucide-react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { sendSms } from "@/lib/sms.functions";
import { uploadMemberPhoto } from "@/lib/uploads.functions";
import { MemberSmartCard } from "@/components/MemberSmartCard";
import { useFoundationSettings } from "@/hooks/use-foundation-settings";
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
  const { settings } = useFoundationSettings();
  const orgName = settings?.name || "চাঁদগাঁও ফাউন্ডেশন";
  const [rows, setRows] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<Tab>("pending");
  const [modal, setModal] = useState<{ open: boolean; data: Partial<Member> }>({ open: false, data: EMPTY });
  const [saving, setSaving] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const uploadPhoto = useServerFn(uploadMemberPhoto);
  const sendSmsFn = useServerFn(sendSms);
  const [cardModal, setCardModal] = useState<Member | null>(null);
  const [listExporting, setListExporting] = useState<null | 7 | 21>(null);
  const [smsModal, setSmsModal] = useState<{ open: boolean; phone: string; name: string; message: string }>({
    open: false, phone: "", name: "", message: "",
  });
  const [smsSending, setSmsSending] = useState(false);

  async function downloadPhoto() {
    const url = modal.data.photo_url;
    if (!url) return toast.error("কোনো ছবি নেই");
    try {
      const res = await fetch(url, { mode: "cors" });
      const blob = await res.blob();
      const ext = (blob.type.split("/")[1] || "jpg").replace("jpeg", "jpg");
      const a = document.createElement("a");
      const obj = URL.createObjectURL(blob);
      a.href = obj;
      a.download = `${(modal.data.member_code || modal.data.name || "member").replace(/\s+/g, "_")}.${ext}`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(obj);
    } catch {
      window.open(url, "_blank");
    }
  }

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => {
        const s = r.result as string;
        const i = s.indexOf(",");
        resolve(i >= 0 ? s.slice(i + 1) : s);
      };
      r.onerror = () => reject(new Error("read failed"));
      r.readAsDataURL(file);
    });
  }

  async function onPhotoPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("ছবি ফাইল নির্বাচন করুন");
    if (file.size > 3 * 1024 * 1024) return toast.error("ছবির আকার ৩MB-এর কম হতে হবে");
    setPhotoBusy(true);
    try {
      const dataBase64 = await fileToBase64(file);
      const r = await uploadPhoto({ data: { filename: file.name, contentType: file.type, dataBase64 } });
      const newUrl = r.url;
      setModal((m) => ({ ...m, data: { ...m.data, photo_url: newUrl } }));
      if (modal.data.id) {
        const { error } = await supabase.from("members").update({ photo_url: newUrl }).eq("id", modal.data.id);
        if (error) throw error;
        toast.success("ছবি আপডেট হয়েছে");
        load();
      } else {
        toast.success("ছবি আপলোড হয়েছে — সদস্য সেভ করুন");
      }
    } catch (err: any) {
      toast.error(err?.message || "ছবি আপলোড ব্যর্থ");
    } finally {
      setPhotoBusy(false);
    }
  }


  function buildApprovalSms(m: { name: string; member_code: string | null; volunteer_code?: string | null }) {
    const parts = [`প্রিয় ${m.name}, চাঁদগাঁও ফাউন্ডেশনে আপনার সদস্যপদ অনুমোদিত হয়েছে।`];
    if (m.member_code) parts.push(`সদস্য কোড: ${m.member_code}।`);
    if (m.volunteer_code) parts.push(`স্বেচ্ছাসেবক কোড: ${m.volunteer_code}।`);
    parts.push("ধন্যবাদ।");
    return parts.join(" ");
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

  async function exportListPdf(perPage: 7 | 21) {
    if (filtered.length === 0) { toast.error("কোনো সদস্য নেই"); return; }
    setListExporting(perPage);
    try {
      const pages: Member[][] = [];
      for (let i = 0; i < filtered.length; i += perPage) pages.push(filtered.slice(i, i + perPage));
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const container = document.createElement("div");
      container.style.cssText = "position:fixed;left:-99999px;top:0;background:#fff;";
      document.body.appendChild(container);

      for (let p = 0; p < pages.length; p++) {
        const sheet = document.createElement("div");
        sheet.style.cssText = "width:794px;min-height:1123px;padding:32px;box-sizing:border-box;background:#fff;color:#0f172a;font-family:'Hind Siliguri',sans-serif;";
        sheet.innerHTML = renderSheetHtml(pages[p], p + 1, pages.length, perPage, orgName);
        container.appendChild(sheet);
        // wait for images
        const imgs = Array.from(sheet.querySelectorAll("img"));
        await Promise.all(imgs.map((img) => new Promise<void>((res) => {
          if ((img as HTMLImageElement).complete) return res();
          img.addEventListener("load", () => res(), { once: true });
          img.addEventListener("error", () => res(), { once: true });
          setTimeout(() => res(), 4000);
        })));
        const dataUrl = await toPng(sheet, { pixelRatio: 2, cacheBust: true, backgroundColor: "#ffffff" });
        if (p > 0) pdf.addPage("a4", "portrait");
        pdf.addImage(dataUrl, "PNG", 0, 0, 210, 297);
        container.removeChild(sheet);
      }
      document.body.removeChild(container);
      pdf.save(`members-list-${perPage}per-page-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success("PDF ডাউনলোড সম্পন্ন");
    } catch (e) {
      showError(e);
    } finally {
      setListExporting(null);
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
      photo_url: d.photo_url || null,
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
      // Re-fetch to get member_code assigned by trigger
      const { data: fresh } = await supabase.from("members").select("*").eq("id", row.id).maybeSingle();
      const target = (fresh as Member | null) ?? row;
      let volunteerCode: string | null = null;

      // If role is volunteer (স্বেচ্ছাসেবক), auto-create active volunteer entry
      const isVolunteerRole = (target.role || "").includes("স্বেচ্ছাসেবক") || (target.role || "").toLowerCase().includes("volunteer");
      if (isVolunteerRole && target.phone) {
        const { data: existingVol } = await supabase.from("volunteers").select("id, volunteer_code").eq("phone", target.phone).maybeSingle();
        if (existingVol?.volunteer_code) {
          volunteerCode = existingVol.volunteer_code as string;
        } else if (!existingVol) {
          const { data: newVol, error: volErr } = await supabase.from("volunteers").insert({
            name: target.name,
            phone: target.phone,
            area: target.area,
            role: "স্বেচ্ছাসেবক",
            photo_url: target.photo_url,
            status: "active", // trigger assigns volunteer_code + expires_at
          }).select("volunteer_code").single();
          if (volErr) {
            toast.error("স্বেচ্ছাসেবক রেকর্ড তৈরি হয়নি: " + volErr.message);
          } else {
            volunteerCode = (newVol?.volunteer_code as string) ?? null;
            toast.success("স্বেচ্ছাসেবক ক্যাটাগরিতে যোগ হয়েছে");
          }
        }
      }

      if (target.phone) {
        setSmsModal({
          open: true,
          phone: target.phone,
          name: target.name,
          message: buildApprovalSms({ ...target, volunteer_code: volunteerCode }),
        });
      }
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

      <div className="flex flex-wrap items-center gap-2 -mt-2">
        <span className="text-xs text-muted-foreground mr-1">তালিকা PDF ({filtered.length} জন):</span>
        <button onClick={() => exportListPdf(7)} disabled={!!listExporting}
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border font-semibold hover:bg-muted disabled:opacity-50">
          <FileText className="w-3.5 h-3.5" /> {listExporting === 7 ? "তৈরি হচ্ছে..." : "৭ জন/পৃষ্ঠা (A4)"}
        </button>
        <button onClick={() => exportListPdf(21)} disabled={!!listExporting}
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border font-semibold hover:bg-muted disabled:opacity-50">
          <FileText className="w-3.5 h-3.5" /> {listExporting === 21 ? "তৈরি হচ্ছে..." : "২১ জন/পৃষ্ঠা (A4)"}
        </button>
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
              {r.status === "approved" && r.phone && (
                <button onClick={(e) => { e.stopPropagation(); openSmsFor(r); }} className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-700 hover:bg-sky-500/20 font-semibold">
                  <MessageSquare className="w-3 h-3" /> SMS
                </button>
              )}
              {r.status === "approved" && r.member_code && (
                <button onClick={(e) => { e.stopPropagation(); setCardModal(r); }} className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 font-semibold">
                  <IdCard className="w-3 h-3" /> কার্ড
                </button>
              )}
            </div>
          ) },
        ]}
      />
      <Modal open={modal.open} onClose={() => setModal({ open: false, data: EMPTY })} title={modal.data.id ? "সদস্য সম্পাদনা" : "নতুন সদস্য"}>
        <form onSubmit={save} className="space-y-3">
          <Field label="সদস্যের ছবি">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted border border-border flex items-center justify-center shrink-0">
                {modal.data.photo_url
                  ? <img src={modal.data.photo_url} alt="" className="w-full h-full object-cover" />
                  : <span className="text-xs text-muted-foreground">নেই</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                <input ref={photoInputRef} type="file" accept="image/*" hidden onChange={onPhotoPick} />
                <button type="button" onClick={() => photoInputRef.current?.click()} disabled={photoBusy}
                  className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-60">
                  <Upload className="w-3.5 h-3.5" /> {photoBusy ? "আপলোড..." : (modal.data.photo_url ? "পরিবর্তন" : "আপলোড")}
                </button>
                {modal.data.photo_url && (
                  <button type="button" onClick={downloadPhoto}
                    className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-border font-semibold hover:bg-muted">
                    <Download className="w-3.5 h-3.5" /> ডাউনলোড
                  </button>
                )}
                {modal.data.photo_url && (
                  <button type="button" onClick={() => setModal((m) => ({ ...m, data: { ...m.data, photo_url: null } }))}
                    className="text-xs px-3 py-1.5 rounded-lg border border-border font-semibold text-rose-600 hover:bg-rose-50">
                    মুছুন
                  </button>
                )}
              </div>
            </div>
          </Field>
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

      <Modal open={smsModal.open} onClose={() => setSmsModal((s) => ({ ...s, open: false }))} title={`SMS পাঠান — ${smsModal.name}`}>
        <form onSubmit={sendSmsNow} className="space-y-3">
          <Field label="মোবাইল নম্বর" required>
            <input className={inputCls} required value={smsModal.phone} onChange={(e) => setSmsModal((s) => ({ ...s, phone: e.target.value }))} />
          </Field>
          <Field label="মেসেজ" required>
            <textarea rows={5} maxLength={1000} className={inputCls} required value={smsModal.message} onChange={(e) => setSmsModal((s) => ({ ...s, message: e.target.value }))} />
            <p className="mt-1 text-xs text-muted-foreground text-right">{smsModal.message.length}/1000</p>
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setSmsModal((s) => ({ ...s, open: false }))} className="px-4 py-2 rounded-lg border border-border text-sm font-semibold hover:bg-muted">বাতিল</button>
            <button type="submit" disabled={smsSending} className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50 inline-flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> {smsSending ? "পাঠানো হচ্ছে..." : "SMS পাঠান"}
            </button>
          </div>
        </form>
      </Modal>

      <MemberCardPreview row={cardModal} org={orgName} onClose={() => setCardModal(null)} />
    </div>
  );
}

function MemberCardPreview({ row, org, onClose }: { row: Member | null; org: string; onClose: () => void }) {
  const [downloading, setDownloading] = useState(false);
  const verifyUrl = useMemo(() => {
    if (!row?.member_code || typeof window === "undefined") return "";
    return `${window.location.origin}/m/${row.member_code}`;
  }, [row]);
  if (!row) return null;

  const downloadPdf = async () => {
    setDownloading(true);
    try {
      const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-mcard]"));
      if (nodes.length < 2) throw new Error("কার্ড পাওয়া যায়নি");
      const imgs = nodes.flatMap((n) => Array.from(n.querySelectorAll("img")));
      await Promise.all(imgs.map((img) => new Promise<void>((res) => {
        if ((img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0) return res();
        img.addEventListener("load", () => res(), { once: true });
        img.addEventListener("error", () => res(), { once: true });
        setTimeout(() => res(), 5000);
      })));
      await new Promise((r) => requestAnimationFrame(() => r(null)));

      const pdf = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });
      const pw = pdf.internal.pageSize.getWidth();
      const margin = 36;
      let y = margin;
      for (const node of nodes) {
        const dataUrl = await toPng(node, { pixelRatio: 3, cacheBust: true, backgroundColor: "#ffffff", skipFonts: false });
        const dims = await new Promise<{ w: number; h: number }>((res) => {
          const im = new Image();
          im.onload = () => res({ w: im.naturalWidth, h: im.naturalHeight });
          im.onerror = () => res({ w: 1000, h: 630 });
          im.src = dataUrl;
        });
        const w = pw - margin * 2;
        const h = (dims.h / dims.w) * w;
        pdf.addImage(dataUrl, "PNG", margin, y, w, h);
        y += h + 20;
      }
      pdf.save(`member-card-${row.member_code || row.id}.pdf`);
      toast.success("PDF ডাউনলোড সম্পন্ন");
    } catch (e) {
      showError(e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal open={!!row} onClose={onClose} title={`স্মার্ট সদস্য কার্ড — ${row.name}`}>
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div data-mcard><MemberSmartCard data={row} verifyUrl={verifyUrl} org={org} side="front" /></div>
          <div data-mcard><MemberSmartCard data={row} verifyUrl={verifyUrl} org={org} side="back" /></div>
        </div>
        <p className="text-xs text-muted-foreground text-center break-all">
          যাচাই লিংক: <span className="font-mono">{verifyUrl}</span>
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm font-semibold hover:bg-muted">বন্ধ</button>
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 px-5 py-2 rounded-lg border border-border text-sm font-semibold hover:bg-muted">
            <Printer className="w-4 h-4" /> প্রিন্ট
          </button>
          <button onClick={downloadPdf} disabled={downloading} className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50">
            <Download className="w-4 h-4" /> {downloading ? "তৈরি হচ্ছে..." : "PDF ডাউনলোড (কালার)"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function escapeHtml(s: string | null | undefined): string {
  if (!s) return "";
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function renderSheetHtml(items: Member[], pageNum: number, totalPages: number, perPage: 7 | 21, org: string): string {
  const dateStr = new Date().toLocaleDateString("bn-BD");
  const header = `
    <div style="border-bottom:3px double #0f5132;padding-bottom:10px;margin-bottom:14px;text-align:center;">
      <h1 style="margin:0;font-size:22px;font-weight:800;color:#0f5132;">${escapeHtml(org)}</h1>
      <p style="margin:4px 0 0;font-size:13px;color:#334155;">সদস্য তালিকা</p>
      <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:10px;color:#64748b;">
        <span>মোট: ${items.length} জন</span>
        <span>তারিখ: ${dateStr}</span>
        <span>পৃষ্ঠা ${pageNum} / ${totalPages}</span>
      </div>
    </div>`;

  if (perPage === 7) {
    const rows = items.map((m, i) => `
      <div style="display:flex;gap:12px;align-items:center;padding:10px;border:1px solid #e2e8f0;border-radius:10px;margin-bottom:8px;background:#f8fafc;">
        <div style="font-weight:800;color:#0f5132;width:28px;text-align:center;font-size:14px;">${(pageNum - 1) * 7 + i + 1}</div>
        ${m.photo_url
          ? `<img src="${escapeHtml(m.photo_url)}" crossorigin="anonymous" style="width:56px;height:56px;border-radius:8px;object-fit:cover;border:2px solid #0f5132;flex-shrink:0;" />`
          : `<div style="width:56px;height:56px;border-radius:8px;background:#e2e8f0;display:flex;align-items:center;justify-content:center;font-weight:800;color:#475569;flex-shrink:0;">${escapeHtml((m.name || "?").charAt(0))}</div>`}
        <div style="flex:1;min-width:0;">
          <div style="font-weight:700;font-size:15px;color:#0f172a;">${escapeHtml(m.name)}</div>
          <div style="font-size:11px;color:#475569;margin-top:2px;">
            ${m.member_code ? `<span style="font-family:monospace;background:#0f5132;color:#fff;padding:1px 6px;border-radius:4px;margin-right:6px;">${escapeHtml(m.member_code)}</span>` : ""}
            ${m.role ? `<span>${escapeHtml(m.role)}</span>` : ""}
          </div>
          <div style="font-size:11px;color:#64748b;margin-top:3px;">
            ${m.phone ? `📞 ${escapeHtml(m.phone)}` : ""}
            ${m.area ? `&nbsp;&nbsp;📍 ${escapeHtml(m.area)}` : ""}
          </div>
        </div>
      </div>`).join("");
    return header + rows;
  }

  // 21 per page: compact table
  const tableRows = items.map((m, i) => `
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:6px 4px;font-weight:700;color:#0f5132;text-align:center;width:32px;">${(pageNum - 1) * 21 + i + 1}</td>
      <td style="padding:6px 4px;font-family:monospace;font-size:10px;color:#0f5132;font-weight:700;">${escapeHtml(m.member_code || "—")}</td>
      <td style="padding:6px 4px;font-weight:600;color:#0f172a;">${escapeHtml(m.name)}</td>
      <td style="padding:6px 4px;color:#475569;font-size:11px;">${escapeHtml(m.phone || "—")}</td>
      <td style="padding:6px 4px;color:#475569;font-size:11px;">${escapeHtml(m.area || "—")}</td>
      <td style="padding:6px 4px;color:#475569;font-size:11px;">${escapeHtml(m.role || "—")}</td>
    </tr>`).join("");
  const table = `
    <table style="width:100%;border-collapse:collapse;font-size:12px;">
      <thead>
        <tr style="background:#0f5132;color:#fff;">
          <th style="padding:8px 4px;text-align:center;">#</th>
          <th style="padding:8px 4px;text-align:left;">সদস্য কোড</th>
          <th style="padding:8px 4px;text-align:left;">নাম</th>
          <th style="padding:8px 4px;text-align:left;">ফোন</th>
          <th style="padding:8px 4px;text-align:left;">এলাকা</th>
          <th style="padding:8px 4px;text-align:left;">ভূমিকা</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>`;
  return header + table;
}


