import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BarChart3, Download, FileSpreadsheet, FileText } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/admin/AdminCrud";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({ meta: [{ title: "রিপোর্ট ও এক্সপোর্ট | অ্যাডমিন" }] }),
  component: Page,
});

type Row = Record<string, unknown>;

const STATUS_LABEL: Record<string, string> = {
  pending: "জমা হয়েছে",
  under_review: "যাচাই চলছে",
  approved: "অনুমোদিত",
  completed: "সম্পন্ন",
  rejected: "প্রত্যাখ্যাত",
};

function Page() {
  const [apps, setApps] = useState<Row[]>([]);
  const [donations, setDonations] = useState<Row[]>([]);
  const [members, setMembers] = useState<Row[]>([]);
  const [slips, setSlips] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [batch, setBatch] = useState<string>("");

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [a, d, m, s] = await Promise.all([
      supabase.from("help_applications").select("*").order("created_at", { ascending: false }).limit(5000),
      supabase.from("donations").select("*").order("created_at", { ascending: false }).limit(5000),
      supabase.from("members").select("*").order("created_at", { ascending: false }).limit(5000),
      supabase.from("distribution_slips").select("application_id,batch_number").limit(10000),
    ]);
    setApps((a.data as Row[]) ?? []);
    setDonations((d.data as Row[]) ?? []);
    setMembers((m.data as Row[]) ?? []);
    setSlips((s.data as Row[]) ?? []);
    setLoading(false);
  }

  const batchByApp = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of slips) {
      const aid = String(s.application_id ?? "");
      const bn = String(s.batch_number ?? "").trim();
      if (aid && bn) map.set(aid, bn);
    }
    return map;
  }, [slips]);

  const batchOptions = useMemo(() => {
    const set = new Set<string>();
    for (const b of batchByApp.values()) set.add(b);
    return Array.from(set).sort();
  }, [batchByApp]);

  const filter = <T extends Row>(rows: T[], applyBatch = false): T[] => rows.filter((r) => {
    const c = String(r.created_at ?? "").slice(0, 10);
    if (from && c < from) return false;
    if (to && c > to) return false;
    if (applyBatch && batch) {
      const bn = batchByApp.get(String(r.id ?? ""));
      if (bn !== batch) return false;
    }
    return true;
  });

  const fApps = useMemo(() => filter(apps, true), [apps, from, to, batch, batchByApp]);
  const fDon = useMemo(() => filter(donations), [donations, from, to]);
  const fMem = useMemo(() => filter(members), [members, from, to]);

  const stats = useMemo(() => {
    const byStatus: Record<string, number> = {};
    for (const a of fApps) byStatus[String(a.status)] = (byStatus[String(a.status)] || 0) + 1;
    const byType: Record<string, number> = {};
    for (const a of fApps) byType[String(a.type)] = (byType[String(a.type)] || 0) + 1;
    const donationTotal = fDon
      .filter((d) => d.status === "verified" || d.status === "approved" || d.status === "completed")
      .reduce((s, d) => s + Number(d.amount || 0), 0);
    const donationPending = fDon.reduce((s, d) => s + Number(d.amount || 0), 0);
    return { byStatus, byType, donationTotal, donationPending };
  }, [fApps, fDon]);

  function exportExcel() {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(fApps.map(appRow)), "আবেদন");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(fDon.map(donRow)), "দান");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(fMem.map(memRow)), "সদস্য");
    const summary = [
      { বিষয়: "মোট আবেদন", সংখ্যা: fApps.length },
      { বিষয়: "মোট দান (সব)", সংখ্যা: `৳ ${stats.donationPending.toLocaleString("bn-BD")}` },
      { বিষয়: "যাচাইকৃত দান", সংখ্যা: `৳ ${stats.donationTotal.toLocaleString("bn-BD")}` },
      { বিষয়: "মোট সদস্য", সংখ্যা: fMem.length },
      ...Object.entries(stats.byStatus).map(([k, v]) => ({ বিষয়: `আবেদন - ${STATUS_LABEL[k] || k}`, সংখ্যা: v })),
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summary), "সারসংক্ষেপ");
    XLSX.writeFile(wb, `foundation-report-${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success("Excel ফাইল ডাউনলোড শুরু হয়েছে");
  }

  async function exportApplicationsPdf() {
    if (!fApps.length) return toast.error("কোন আবেদন নেই");
    toast.loading("PDF তৈরি হচ্ছে...", { id: "pdf" });
    try {
      const container = document.createElement("div");
      container.style.cssText = "position:fixed;left:-99999px;top:0;width:1400px;background:#fff;color:#0a0a0a;font-family:'Hind Siliguri','Noto Sans Bengali',system-ui,sans-serif;padding:32px;";
      const today = new Date().toLocaleDateString("bn-BD");
      const rows = fApps.map((r) => `
        <tr>
          <td style="border:1px solid #d4d4d8;padding:6px 8px;font-size:11px;">${batchByApp.get(String(r.id ?? "")) ?? "-"}</td>
          <td style="border:1px solid #d4d4d8;padding:6px 8px;font-size:11px;">${r.app_code ?? "-"}</td>
          <td style="border:1px solid #d4d4d8;padding:6px 8px;font-size:11px;">${r.name ?? "-"}</td>
          <td style="border:1px solid #d4d4d8;padding:6px 8px;font-size:11px;">${r.father_name ?? "-"}</td>
          <td style="border:1px solid #d4d4d8;padding:6px 8px;font-size:11px;">${r.phone ?? "-"}</td>
          <td style="border:1px solid #d4d4d8;padding:6px 8px;font-size:11px;">${r.type ?? "-"}</td>
          <td style="border:1px solid #d4d4d8;padding:6px 8px;font-size:11px;">${STATUS_LABEL[String(r.status)] || r.status || "-"}</td>
          <td style="border:1px solid #d4d4d8;padding:6px 8px;font-size:11px;">${String(r.created_at ?? "").slice(0, 10)}</td>
        </tr>`).join("");
      container.innerHTML = `
        <div style="text-align:center;border-bottom:3px solid #0f766e;padding-bottom:16px;margin-bottom:20px;">
          <h1 style="margin:0;font-size:24px;font-weight:800;color:#0f766e;">চাঁদগাঁও ফাউন্ডেশন — আবেদন রিপোর্ট</h1>
          <p style="margin:6px 0 0;font-size:13px;color:#525252;">তারিখ: ${today} · মোট আবেদন: ${fApps.length}${batch ? ` · ব্যাচ: ${batch}` : ""}${from || to ? ` · সময়সীমা: ${from || "শুরু"} → ${to || "আজ"}` : ""}</p>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#0f766e;color:#fff;">
              <th style="border:1px solid #0f766e;padding:8px;font-size:12px;text-align:left;">ব্যাচ</th>
              <th style="border:1px solid #0f766e;padding:8px;font-size:12px;text-align:left;">আবেদন কোড</th>
              <th style="border:1px solid #0f766e;padding:8px;font-size:12px;text-align:left;">নাম</th>
              <th style="border:1px solid #0f766e;padding:8px;font-size:12px;text-align:left;">পিতা</th>
              <th style="border:1px solid #0f766e;padding:8px;font-size:12px;text-align:left;">মোবাইল</th>
              <th style="border:1px solid #0f766e;padding:8px;font-size:12px;text-align:left;">ধরন</th>
              <th style="border:1px solid #0f766e;padding:8px;font-size:12px;text-align:left;">অবস্থা</th>
              <th style="border:1px solid #0f766e;padding:8px;font-size:12px;text-align:left;">তারিখ</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>`;
      document.body.appendChild(container);
      const canvas = await html2canvas(container, { scale: 2, backgroundColor: "#ffffff" });
      document.body.removeChild(container);

      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = pageW;
      const imgH = (canvas.height * imgW) / canvas.width;
      let heightLeft = imgH;
      let position = 0;
      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", 0, position, imgW, imgH);
      heightLeft -= pageH;
      while (heightLeft > 0) {
        position = heightLeft - imgH;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgW, imgH);
        heightLeft -= pageH;
      }
      pdf.save(`applications-report-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success("PDF ডাউনলোড হয়েছে", { id: "pdf" });
    } catch (e: any) {
      toast.error(e?.message || "PDF তৈরি করা যায়নি", { id: "pdf" });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={BarChart3}
        title="রিপোর্ট ও এক্সপোর্ট"
        subtitle="পরিসংখ্যান, Excel ও PDF ডাউনলোড"
        action={
          <button onClick={exportExcel} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90">
            <FileSpreadsheet className="h-4 w-4" /> সম্পূর্ণ Excel রিপোর্ট
          </button>
        }
      />

      {/* Date filter */}
      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-card p-4">
        <div>
          <label className="block text-xs font-medium mb-1">শুরু</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-9 px-3 rounded-lg border border-input bg-background text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">শেষ</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-9 px-3 rounded-lg border border-input bg-background text-sm" />
        </div>
        {(from || to) && (
          <button onClick={() => { setFrom(""); setTo(""); }} className="h-9 px-3 rounded-lg border border-border text-xs">রিসেট</button>
        )}
        <div className="ml-auto text-xs text-muted-foreground">{loading ? "লোড হচ্ছে..." : `${fApps.length} আবেদন · ${fDon.length} দান · ${fMem.length} সদস্য`}</div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="মোট আবেদন" value={fApps.length} />
        <StatCard label="অনুমোদিত" value={stats.byStatus.approved || 0} accent="emerald" />
        <StatCard label="যাচাইকৃত দান" value={`৳ ${stats.donationTotal.toLocaleString("bn-BD")}`} accent="emerald" />
        <StatCard label="সদস্য" value={fMem.length} />
      </div>

      {/* Status breakdown */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-sm font-bold mb-3">আবেদনের অবস্থা</h3>
        <div className="space-y-2">
          {Object.entries(stats.byStatus).map(([k, v]) => {
            const pct = fApps.length ? Math.round((v / fApps.length) * 100) : 0;
            return (
              <div key={k}>
                <div className="flex justify-between text-xs mb-1">
                  <span>{STATUS_LABEL[k] || k}</span>
                  <span className="text-muted-foreground">{v} ({pct}%)</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
          {!Object.keys(stats.byStatus).length && <p className="text-xs text-muted-foreground">কোন ডাটা নেই</p>}
        </div>
      </div>

      {/* Type breakdown */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-sm font-bold mb-3">সাহায্যের ধরন অনুযায়ী</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {Object.entries(stats.byType).map(([k, v]) => (
            <div key={k} className="flex justify-between rounded-lg border border-border px-3 py-2 text-xs">
              <span className="truncate">{k}</span>
              <span className="font-bold text-primary">{v}</span>
            </div>
          ))}
          {!Object.keys(stats.byType).length && <p className="text-xs text-muted-foreground">কোন ডাটা নেই</p>}
        </div>
      </div>

      {/* PDF download */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><FileText className="h-4 w-4" /> আবেদন PDF রিপোর্ট</h3>
        <p className="text-xs text-muted-foreground mb-3">শিরোনাম, তারিখ ও সম্পূর্ণ আবেদন তালিকা সম্বলিত PDF ডাউনলোড করুন।</p>
        <button onClick={exportApplicationsPdf} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90">
          <Download className="h-3.5 w-3.5" /> আবেদন PDF ডাউনলোড ({fApps.length})
        </button>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: "emerald" }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${accent === "emerald" ? "text-emerald-600 dark:text-emerald-400" : "text-primary"}`}>{value}</p>
    </div>
  );
}

function ExportBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold border border-border hover:bg-accent">
      <Download className="h-3.5 w-3.5" /> {label}
    </button>
  );
}

function appRow(r: Row): Row {
  return {
    "আবেদন কোড": r.app_code, "নাম": r.name, "পিতা": r.father_name, "মাতা": r.mother_name,
    "মোবাইল": r.phone, "NID": r.nid, "ধরন": r.type, "প্রয়োজনীয় পরিমাণ": r.requested_amount,
    "ঠিকানা": r.present_address, "মাসিক আয়": r.monthly_income, "পরিবার সদস্য": r.family_count,
    "অবস্থা": STATUS_LABEL[String(r.status)] || r.status, "PDF": r.pdf_url,
    "তারিখ": String(r.created_at).slice(0, 10),
  };
}
function donRow(r: Row): Row {
  return {
    "দাতা": r.donor_name, "মোবাইল": r.donor_phone, "পরিমাণ": r.amount,
    "মাধ্যম": r.method, "ট্রানজেকশন আইডি": r.transaction_id, "উদ্দেশ্য": r.purpose,
    "অবস্থা": r.status, "তারিখ": r.donated_at,
  };
}
function memRow(r: Row): Row {
  return {
    "সদস্য কোড": r.member_code, "নাম": r.name, "মোবাইল": r.phone, "ইমেইল": r.email,
    "এলাকা": r.area, "পদ": r.role, "অবস্থা": r.status, "যোগদান": r.join_date,
  };
}
