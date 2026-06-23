import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { HandHeart, IdCard, Printer, MessageSquare, Download, Upload } from "lucide-react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { sendSms } from "@/lib/sms.functions";
import { uploadMemberPhoto } from "@/lib/uploads.functions";
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
  education: string | null; previous_experience: string | null;
};

const EMPTY: Partial<V> = {
  name: "", phone: "", area: "", skills: "", assigned_task: "",
  status: "active", role: "স্বেচ্ছাসেবক", blood_group: "", photo_url: "",
  education: "", previous_experience: "",
  joined_at: new Date().toISOString().slice(0, 10),
};


function Page() {
  const [rows, setRows] = useState<V[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [modal, setModal] = useState<{ open: boolean; data: Partial<V> }>({ open: false, data: EMPTY });
  const [saving, setSaving] = useState(false);
  const [cardModal, setCardModal] = useState<V | null>(null);
  const sendSmsFn = useServerFn(sendSms);
  const uploadPhoto = useServerFn(uploadMemberPhoto);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [smsModal, setSmsModal] = useState<{ open: boolean; phone: string; name: string; message: string }>({
    open: false, phone: "", name: "", message: "",
  });
  const [smsSending, setSmsSending] = useState(false);

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
      a.download = `${(modal.data.volunteer_code || modal.data.name || "volunteer").replace(/\s+/g, "_")}.${ext}`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(obj);
    } catch {
      window.open(url, "_blank");
    }
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
      const r = await uploadPhoto({ data: { filename: file.name, contentType: file.type, dataBase64, folder: "volunteers" } });
      const newUrl = r.url;
      setModal((m) => ({ ...m, data: { ...m.data, photo_url: newUrl } }));
      if (modal.data.id) {
        const { error } = await supabase.from("volunteers").update({ photo_url: newUrl }).eq("id", modal.data.id);
        if (error) throw error;
        toast.success("ছবি আপডেট হয়েছে");
        load();
      } else {
        toast.success("ছবি আপলোড হয়েছে — সেভ করুন");
      }
    } catch (err: any) {
      toast.error(err?.message || "ছবি আপলোড ব্যর্থ");
    } finally {
      setPhotoBusy(false);
    }
  }


  function buildVolunteerSms(v: V) {
    return `প্রিয় ${v.name}, চাঁদগাঁও ফাউন্ডেশনে আপনি স্বেচ্ছাসেবক হিসেবে অনুমোদিত হয়েছেন।${v.volunteer_code ? ` আপনার সদস্য নম্বর: ${v.volunteer_code}।` : ""} ধন্যবাদ।`;
  }

  function openSmsFor(row: V) {
    if (!row.phone) { toast.error("এই স্বেচ্ছাসেবকের ফোন নম্বর নেই"); return; }
    setSmsModal({ open: true, phone: row.phone, name: row.name, message: buildVolunteerSms(row) });
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
      education: d.education || null,
      previous_experience: d.previous_experience || null,
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
            <div className="flex items-center gap-1.5 flex-wrap">
              {r.status === "active" ? <StatusPill tone="success" label="সক্রিয়" /> : <StatusPill tone="muted" label="নিষ্ক্রিয়" />}
              {r.volunteer_code && (
                <button
                  onClick={(e) => { e.stopPropagation(); setCardModal(r); }}
                  className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 font-semibold"
                >
                  <IdCard className="w-3 h-3" /> কার্ড
                </button>
              )}
              {r.status === "active" && r.phone && (
                <button
                  onClick={(e) => { e.stopPropagation(); openSmsFor(r); }}
                  className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-700 hover:bg-sky-500/20 font-semibold"
                >
                  <MessageSquare className="w-3 h-3" /> SMS
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
          <Field label="স্বেচ্ছাসেবকের ছবি">
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
          <Field label="দক্ষতা"><input className={inputCls} value={modal.data.skills ?? ""} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, skills: e.target.value } }))} /></Field>
          <Field label="শিক্ষাগত যোগ্যতা"><input className={inputCls} placeholder="যেমন: এইচএসসি / স্নাতক" value={modal.data.education ?? ""} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, education: e.target.value } }))} /></Field>
          <Field label="পূর্ব অভিজ্ঞতা (যদি থাকে)">
            <textarea rows={3} maxLength={1000} className={inputCls} placeholder="অতীতে কোনো সংগঠন/স্বেচ্ছাসেবী কাজের অভিজ্ঞতা থাকলে লিখুন" value={modal.data.previous_experience ?? ""} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, previous_experience: e.target.value } }))} />
          </Field>
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
    </div>
  );
}


function CardPreview({ row, onClose }: { row: V | null; onClose: () => void }) {
  const [downloading, setDownloading] = useState(false);
  const verifyUrl = useMemo(() => {
    if (!row?.volunteer_code || typeof window === "undefined") return "";
    return `${window.location.origin}/v/${row.volunteer_code}`;
  }, [row]);
  if (!row) return null;

  const downloadPdf = async () => {
    setDownloading(true);
    try {
      const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-vcard]"));
      if (nodes.length < 2) throw new Error("কার্ড পাওয়া যায়নি");

      // Wait for all images inside the cards to finish loading (or fail) so html2canvas captures them
      const imgs = nodes.flatMap((n) => Array.from(n.querySelectorAll("img")));
      await Promise.all(
        imgs.map(
          (img) =>
            new Promise<void>((resolve) => {
              if (img.complete && img.naturalWidth > 0) return resolve();
              img.addEventListener("load", () => resolve(), { once: true });
              img.addEventListener("error", () => resolve(), { once: true });
              // safety timeout
              setTimeout(() => resolve(), 5000);
            }),
        ),
      );
      // Give layout a frame to settle
      await new Promise((r) => requestAnimationFrame(() => r(null)));

      const pdf = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });
      const pw = pdf.internal.pageSize.getWidth();
      const margin = 36;
      let y = margin;
      for (const node of nodes) {
        const dataUrl = await toPng(node, {
          pixelRatio: 3,
          cacheBust: true,
          backgroundColor: "#ffffff",
          skipFonts: false,
        });
        // Get natural dims
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

      pdf.save(`volunteer-card-${row.volunteer_code || row.id}.pdf`);
      toast.success("PDF ডাউনলোড সম্পন্ন");
    } catch (e) {
      showError(e);
    } finally {
      setDownloading(false);
    }
  };


  return (
    <Modal open={!!row} onClose={onClose} title={`স্মার্ট আইডি কার্ড — ${row.name}`}>
      <div className="space-y-4 print:space-y-2">
        <div className="grid sm:grid-cols-2 gap-4">
          <div data-vcard><VolunteerSmartCard data={row} verifyUrl={verifyUrl} side="front" /></div>
          <div data-vcard><VolunteerSmartCard data={row} verifyUrl={verifyUrl} side="back" /></div>
        </div>
        <p className="text-xs text-muted-foreground text-center break-all">
          যাচাই লিংক: <span className="font-mono">{verifyUrl}</span>
        </p>
        <div className="flex justify-end gap-2 print:hidden">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm font-semibold hover:bg-muted">বন্ধ</button>
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 px-5 py-2 rounded-lg border border-border text-sm font-semibold hover:bg-muted">
            <Printer className="w-4 h-4" /> প্রিন্ট
          </button>
          <button onClick={downloadPdf} disabled={downloading} className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50">
            <Download className="w-4 h-4" /> {downloading ? "তৈরি হচ্ছে..." : "PDF ডাউনলোড"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
