import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import QRCode from "qrcode";
import { supabase } from "@/integrations/supabase/client";

export type DistributionSlip = {
  id: string;
  application_id: string;
  applicant_id: string;
  project_id: string | null;
  app_code: string | null;
  applicant_name: string;
  father_name: string | null;
  phone: string | null;
  nid: string | null;
  project_name: string | null;
  distribution_date: string;
  distribution_day: string | null;
  distribution_time: string | null;
  distribution_location: string | null;
  batch_number: string | null;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
};

export type SlipMeta = {
  distribution_date: string; // YYYY-MM-DD
  distribution_day: string;
  distribution_time: string;
  distribution_location: string;
  batch_number: string;
};

const BN_DAYS = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];
export function bnDayFromDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return BN_DAYS[d.getDay()] ?? "";
}

function escapeHtml(s: string | null | undefined): string {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function fmtDateBn(d: string): string {
  try {
    return new Date(d).toLocaleDateString("bn-BD", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return d;
  }
}

function buildSlipBoxHtml(s: DistributionSlip, qrDataUrl: string, foundationName: string): string {
  return `
    <div style="border:2px solid #0c2340;border-radius:8px;padding:14px 16px;height:100%;box-sizing:border-box;display:flex;flex-direction:column;gap:6px;background:#fff;">
      <div style="text-align:center;border-bottom:1.5px solid #16a34a;padding-bottom:6px;margin-bottom:4px;">
        <div style="font-size:13px;font-weight:800;color:#0c2340;line-height:1.2;">${escapeHtml(foundationName)}</div>
        <div style="font-size:11px;font-weight:700;color:#16a34a;margin-top:2px;">সহায়তা গ্রহণ স্লিপ</div>
      </div>
      <div style="display:flex;gap:8px;flex:1;">
        <div style="flex:1;font-size:10.5px;line-height:1.55;color:#0f172a;">
          <div><b>নাম:</b> ${escapeHtml(s.applicant_name)}</div>
          ${s.father_name ? `<div><b>পিতা:</b> ${escapeHtml(s.father_name)}</div>` : ""}
          ${s.phone ? `<div><b>মোবাইল:</b> ${escapeHtml(s.phone)}</div>` : ""}
          ${s.nid ? `<div><b>NID:</b> ${escapeHtml(s.nid)}</div>` : ""}
          ${s.project_name ? `<div><b>প্রকল্প:</b> ${escapeHtml(s.project_name)}</div>` : ""}
          <div><b>তারিখ:</b> ${escapeHtml(fmtDateBn(s.distribution_date))}</div>
          ${s.distribution_day ? `<div><b>বার:</b> ${escapeHtml(s.distribution_day)}</div>` : ""}
          ${s.distribution_time ? `<div><b>সময়:</b> ${escapeHtml(s.distribution_time)}</div>` : ""}
          ${s.distribution_location ? `<div><b>স্থান:</b> ${escapeHtml(s.distribution_location)}</div>` : ""}
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:3px;">
          <img src="${qrDataUrl}" style="width:74px;height:74px;"/>
          ${s.batch_number ? `<div style="font-size:9px;color:#475569;">ব্যাচ: ${escapeHtml(s.batch_number)}</div>` : ""}
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px dashed #cbd5e1;padding-top:4px;font-size:9.5px;color:#475569;">
        <span>App ID: <b style="color:#0c2340;">${escapeHtml(s.app_code ?? s.application_id.slice(0, 8))}</b></span>
        <span>${escapeHtml(new Date(s.created_at).toLocaleDateString("bn-BD"))}</span>
      </div>
    </div>
  `;
}

async function qrFor(s: DistributionSlip): Promise<string> {
  const payload = JSON.stringify({
    app_id: s.application_id,
    applicant_id: s.applicant_id,
    project_id: s.project_id,
    code: s.app_code,
  });
  return QRCode.toDataURL(payload, { width: 200, margin: 1, color: { dark: "#0c2340", light: "#ffffff" } });
}

async function buildA4PageHtml(slips: DistributionSlip[], foundationName: string): Promise<HTMLDivElement> {
  const qrs = await Promise.all(slips.map(qrFor));
  // A4 at 96dpi: 794 x 1123
  const el = document.createElement("div");
  el.style.cssText = "position:fixed;left:-10000px;top:0;width:794px;height:1123px;background:#ffffff;color:#0f172a;border-color:#cbd5e1;padding:32px;box-sizing:border-box;font-family:'Noto Sans Bengali','SolaimanLipi','Kalpurush',system-ui,sans-serif;--background:#ffffff;--foreground:#0f172a;--border:#cbd5e1;--input:#e2e8f0;--ring:#16a34a;--primary:#0c2340;--primary-foreground:#ffffff;--secondary:#f1f5f9;--secondary-foreground:#0f172a;--muted:#f1f5f9;--muted-foreground:#475569;--accent:#fde68a;--accent-foreground:#0f172a;--card:#ffffff;--card-foreground:#0f172a;--popover:#ffffff;--popover-foreground:#0f172a;--destructive:#dc2626;--destructive-foreground:#ffffff;";
  const cells = Array.from({ length: 8 }).map((_, i) => {
    const s = slips[i];
    return `<div style="height:100%;">${s ? buildSlipBoxHtml(s, qrs[i], foundationName) : ""}</div>`;
  }).join("");
  el.innerHTML = `<div style="display:grid;grid-template-columns:1fr 1fr;grid-template-rows:repeat(4,1fr);gap:12px;width:100%;height:100%;">${cells}</div>`;
  document.body.appendChild(el);
  return el;
}

async function waitForImages(el: HTMLElement) {
  const imgs = Array.from(el.querySelectorAll("img"));
  await Promise.all(imgs.map((img) => img.complete ? Promise.resolve() : new Promise<void>((res) => {
    img.onload = () => res();
    img.onerror = () => res();
  })));
}

export async function buildSlipsPdf(slips: DistributionSlip[], foundationName: string): Promise<jsPDF> {
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pw = pdf.internal.pageSize.getWidth();
  const ph = pdf.internal.pageSize.getHeight();
  const pages = Math.max(1, Math.ceil(slips.length / 8));
  for (let p = 0; p < pages; p++) {
    const chunk = slips.slice(p * 8, p * 8 + 8);
    const el = await buildA4PageHtml(chunk, foundationName);
    await waitForImages(el);
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      onclone: (doc) => {
        const style = doc.createElement("style");
        style.textContent = `:root,.dark{--background:#ffffff;--foreground:#0f172a;--border:#cbd5e1;--input:#e2e8f0;--ring:#16a34a;--primary:#0c2340;--primary-foreground:#ffffff;--secondary:#f1f5f9;--secondary-foreground:#0f172a;--muted:#f1f5f9;--muted-foreground:#475569;--accent:#fde68a;--accent-foreground:#0f172a;--card:#ffffff;--card-foreground:#0f172a;--popover:#ffffff;--popover-foreground:#0f172a;--destructive:#dc2626;--destructive-foreground:#ffffff;--sidebar:#ffffff;--sidebar-foreground:#0f172a;--sidebar-border:#cbd5e1;--sidebar-accent:#f1f5f9;--sidebar-accent-foreground:#0f172a;--sidebar-primary:#0c2340;--sidebar-primary-foreground:#ffffff;--sidebar-ring:#16a34a;--chart-1:#0c2340;--chart-2:#16a34a;--chart-3:#f59e0b;--chart-4:#3b82f6;--chart-5:#a855f7;}`;
        doc.head.appendChild(style);
      },
    });
    document.body.removeChild(el);
    const imgData = canvas.toDataURL("image/jpeg", 0.92);
    if (p > 0) pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, 0, pw, ph);
  }
  return pdf;
}

export async function downloadSlipsPdf(slips: DistributionSlip[], foundationName: string, filename = "distribution-slips.pdf") {
  if (slips.length === 0) return;
  const pdf = await buildSlipsPdf(slips, foundationName);
  pdf.save(filename);
}

export async function printSlipsPdf(slips: DistributionSlip[], foundationName: string) {
  if (slips.length === 0) return;
  const pdf = await buildSlipsPdf(slips, foundationName);
  const url = URL.createObjectURL(pdf.output("blob"));
  const w = window.open(url, "_blank");
  if (w) {
    w.addEventListener("load", () => {
      try { w.print(); } catch { /* noop */ }
    });
  }
}

export async function uploadSlipsPdf(slips: DistributionSlip[], foundationName: string, slipIdsToTag: string[]): Promise<string | null> {
  try {
    const pdf = await buildSlipsPdf(slips, foundationName);
    const blob = pdf.output("blob");
    const path = `slips/batch-${Date.now()}.pdf`;
    const { error } = await supabase.storage.from("application-pdf").upload(path, blob, {
      contentType: "application/pdf",
      upsert: true,
    });
    if (error) throw error;
    const url = supabase.storage.from("application-pdf").getPublicUrl(path).data.publicUrl;
    if (slipIdsToTag.length > 0) {
      await supabase.from("distribution_slips" as never).update({ pdf_url: url } as never).in("id", slipIdsToTag);
    }
    return url;
  } catch (e) {
    console.error("Slip PDF upload failed", e);
    return null;
  }
}

export async function createSlipForApplication(applicationId: string, meta: SlipMeta): Promise<DistributionSlip | null> {
  const { data: app, error: aErr } = await supabase
    .from("help_applications")
    .select("id, app_code, name, father_name, phone, nid, project_id, status")
    .eq("id", applicationId)
    .single();
  if (aErr || !app) {
    console.error(aErr);
    return null;
  }
  if (app.status !== "approved") {
    throw new Error("শুধুমাত্র অনুমোদিত আবেদনের জন্য স্লিপ তৈরি করা যাবে");
  }

  let projectName: string | null = null;
  if (app.project_id) {
    const { data: proj } = await supabase
      .from("aid_projects" as never)
      .select("name")
      .eq("id", app.project_id)
      .single();
    projectName = (proj as { name?: string } | null)?.name ?? null;
  }

  const insertPayload = {
    application_id: app.id,
    applicant_id: app.id,
    project_id: app.project_id,
    app_code: app.app_code,
    applicant_name: app.name,
    father_name: app.father_name,
    phone: app.phone,
    nid: app.nid,
    project_name: projectName,
    distribution_date: meta.distribution_date,
    distribution_day: meta.distribution_day || bnDayFromDate(meta.distribution_date),
    distribution_time: meta.distribution_time,
    distribution_location: meta.distribution_location,
    batch_number: meta.batch_number,
  };

  const { data, error } = await supabase
    .from("distribution_slips" as never)
    .insert(insertPayload as never)
    .select("*")
    .single();
  if (error) {
    console.error(error);
    throw new Error(error.message);
  }
  return data as unknown as DistributionSlip;
}
