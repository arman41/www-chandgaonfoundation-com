import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";
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
  distribution_date: string;
  distribution_day: string;
  distribution_time: string;
  distribution_location: string;
  batch_number: string;
};

export type SlipBrand = {
  name: string;
  tagline?: string | null;
  logoUrl?: string | null;
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

async function urlToDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = () => reject(new Error("read fail"));
      r.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// Palette — Emerald Prestige + Gold
const C = {
  ink: "#0b3b2e",
  inkSoft: "#1f4d40",
  body: "#0f2a23",
  gold: "#b8893d",
  goldSoft: "#e8c97a",
  cream: "#fbf7ec",
  line: "#cdb986",
  muted: "#5b6b66",
};

function buildSlipBoxHtml(s: DistributionSlip, qrDataUrl: string, brand: SlipBrand, logoDataUrl: string | null): string {
  const code = s.app_code ?? s.application_id.slice(0, 8).toUpperCase();
  return `
    <div style="position:relative;height:100%;box-sizing:border-box;background:${C.cream};border:1.5px solid ${C.gold};border-radius:10px;padding:0;overflow:hidden;font-family:'Hind Siliguri','Noto Sans Bengali',system-ui,sans-serif;color:${C.body};">
      <!-- corner ornaments -->
      <div style="position:absolute;top:6px;left:6px;width:18px;height:18px;border-top:2px solid ${C.gold};border-left:2px solid ${C.gold};border-top-left-radius:6px;"></div>
      <div style="position:absolute;top:6px;right:6px;width:18px;height:18px;border-top:2px solid ${C.gold};border-right:2px solid ${C.gold};border-top-right-radius:6px;"></div>
      <div style="position:absolute;bottom:6px;left:6px;width:18px;height:18px;border-bottom:2px solid ${C.gold};border-left:2px solid ${C.gold};border-bottom-left-radius:6px;"></div>
      <div style="position:absolute;bottom:6px;right:6px;width:18px;height:18px;border-bottom:2px solid ${C.gold};border-right:2px solid ${C.gold};border-bottom-right-radius:6px;"></div>

      <!-- header -->
      <div style="background:linear-gradient(135deg, ${C.ink} 0%, ${C.inkSoft} 100%);color:${C.cream};padding:8px 12px;display:flex;align-items:center;gap:10px;border-bottom:2px solid ${C.gold};">
        ${logoDataUrl
          ? `<img src="${logoDataUrl}" style="width:36px;height:36px;border-radius:50%;background:${C.cream};padding:2px;object-fit:contain;flex-shrink:0;"/>`
          : `<div style="width:36px;height:36px;border-radius:50%;background:${C.gold};color:${C.ink};display:flex;align-items:center;justify-content:center;font-weight:900;font-size:14px;flex-shrink:0;">CF</div>`}
        <div style="flex:1;min-width:0;line-height:1.15;">
          <div style="font-size:11.5px;font-weight:800;color:${C.cream};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(brand.name)}</div>
          ${brand.tagline ? `<div style="font-size:8.5px;color:${C.goldSoft};margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(brand.tagline)}</div>` : ""}
        </div>
        <div style="background:${C.gold};color:${C.ink};font-size:9px;font-weight:800;padding:3px 8px;border-radius:999px;letter-spacing:0.3px;flex-shrink:0;">সহায়তা স্লিপ</div>
      </div>

      <!-- body -->
      <div style="padding:8px 12px 6px 12px;display:flex;gap:10px;">
        <div style="flex:1;font-size:10px;line-height:1.55;color:${C.body};">
          <div style="display:flex;gap:4px;"><span style="color:${C.muted};min-width:42px;">নাম:</span><b style="color:${C.ink};">${escapeHtml(s.applicant_name)}</b></div>
          ${s.father_name ? `<div style="display:flex;gap:4px;"><span style="color:${C.muted};min-width:42px;">পিতা:</span><span>${escapeHtml(s.father_name)}</span></div>` : ""}
          ${s.phone ? `<div style="display:flex;gap:4px;"><span style="color:${C.muted};min-width:42px;">মোবাইল:</span><span>${escapeHtml(s.phone)}</span></div>` : ""}
          ${s.nid ? `<div style="display:flex;gap:4px;"><span style="color:${C.muted};min-width:42px;">NID:</span><span>${escapeHtml(s.nid)}</span></div>` : ""}
          ${s.project_name ? `<div style="display:flex;gap:4px;"><span style="color:${C.muted};min-width:42px;">প্রকল্প:</span><b style="color:${C.ink};">${escapeHtml(s.project_name)}</b></div>` : ""}
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:2px;flex-shrink:0;">
          <div style="padding:3px;background:#fff;border:1px solid ${C.line};border-radius:4px;">
            <img src="${qrDataUrl}" style="width:66px;height:66px;display:block;"/>
          </div>
          <div style="font-size:8px;font-weight:700;color:${C.ink};letter-spacing:0.4px;">#${escapeHtml(code)}</div>
        </div>
      </div>

      <!-- distribution panel -->
      <div style="margin:0 12px;padding:6px 8px;background:#fff;border:1px dashed ${C.line};border-radius:6px;display:grid;grid-template-columns:1fr 1fr;gap:2px 8px;font-size:9.5px;color:${C.body};">
        <div><span style="color:${C.muted};">তারিখ:</span> <b style="color:${C.ink};">${escapeHtml(fmtDateBn(s.distribution_date))}</b></div>
        ${s.distribution_day ? `<div><span style="color:${C.muted};">বার:</span> <b style="color:${C.ink};">${escapeHtml(s.distribution_day)}</b></div>` : "<div></div>"}
        ${s.distribution_time ? `<div><span style="color:${C.muted};">সময়:</span> <b style="color:${C.ink};">${escapeHtml(s.distribution_time)}</b></div>` : "<div></div>"}
        ${s.batch_number ? `<div><span style="color:${C.muted};">ব্যাচ:</span> <b style="color:${C.ink};">${escapeHtml(s.batch_number)}</b></div>` : "<div></div>"}
        ${s.distribution_location ? `<div style="grid-column:1 / -1;"><span style="color:${C.muted};">স্থান:</span> <b style="color:${C.ink};">${escapeHtml(s.distribution_location)}</b></div>` : ""}
      </div>

      <!-- footer -->
      <div style="position:absolute;left:12px;right:12px;bottom:8px;display:flex;justify-content:space-between;align-items:center;font-size:8.5px;color:${C.muted};border-top:1px solid ${C.line};padding-top:4px;">
        <span>সংগ্রহের সময় NID ও স্লিপ সাথে আনুন</span>
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
  return QRCode.toDataURL(payload, { width: 200, margin: 1, color: { dark: C.ink, light: "#ffffff" } });
}

async function buildA4PageHtml(slips: DistributionSlip[], brand: SlipBrand, logoDataUrl: string | null): Promise<HTMLDivElement> {
  const qrs = await Promise.all(slips.map(qrFor));
  const el = document.createElement("div");
  el.style.cssText = `position:fixed;left:-10000px;top:0;width:794px;height:1123px;background:#ffffff;color:${C.body};padding:28px;box-sizing:border-box;font-family:'Hind Siliguri','Noto Sans Bengali','SolaimanLipi','Kalpurush',system-ui,sans-serif;`;
  const cells = Array.from({ length: 8 }).map((_, i) => {
    const s = slips[i];
    return `<div style="height:100%;">${s ? buildSlipBoxHtml(s, qrs[i], brand, logoDataUrl) : ""}</div>`;
  }).join("");
  el.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;grid-template-rows:repeat(4,1fr);gap:14px;width:100%;height:100%;">${cells}</div>
  `;
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

function normalizeBrand(b: SlipBrand | string): SlipBrand {
  return typeof b === "string" ? { name: b } : b;
}

export async function buildSlipsPdf(slips: DistributionSlip[], brand: SlipBrand | string): Promise<jsPDF> {
  const b = normalizeBrand(brand);
  const logoDataUrl = b.logoUrl ? await urlToDataUrl(b.logoUrl) : null;
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pw = pdf.internal.pageSize.getWidth();
  const ph = pdf.internal.pageSize.getHeight();
  const pages = Math.max(1, Math.ceil(slips.length / 8));
  for (let p = 0; p < pages; p++) {
    const chunk = slips.slice(p * 8, p * 8 + 8);
    const el = await buildA4PageHtml(chunk, b, logoDataUrl);
    await waitForImages(el);
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      onclone: (doc) => {
        const style = doc.createElement("style");
        style.textContent = `:root,.dark{--background:#ffffff;--foreground:#0f172a;--border:#cdb986;--input:#e2e8f0;--ring:#b8893d;--primary:#0b3b2e;--primary-foreground:#fbf7ec;--secondary:#f1f5f9;--secondary-foreground:#0f172a;--muted:#f1f5f9;--muted-foreground:#475569;--accent:#e8c97a;--accent-foreground:#0b3b2e;--card:#ffffff;--card-foreground:#0f172a;--popover:#ffffff;--popover-foreground:#0f172a;--destructive:#dc2626;--destructive-foreground:#ffffff;--sidebar:#ffffff;--sidebar-foreground:#0f172a;--sidebar-border:#cdb986;--sidebar-accent:#f1f5f9;--sidebar-accent-foreground:#0f172a;--sidebar-primary:#0b3b2e;--sidebar-primary-foreground:#fbf7ec;--sidebar-ring:#b8893d;--chart-1:#0b3b2e;--chart-2:#b8893d;--chart-3:#16a34a;--chart-4:#3b82f6;--chart-5:#a855f7;}`;
        doc.head.appendChild(style);
      },
    });
    document.body.removeChild(el);
    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    if (p > 0) pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, 0, pw, ph);
  }
  return pdf;
}

export async function downloadSlipsPdf(slips: DistributionSlip[], brand: SlipBrand | string, filename = "distribution-slips.pdf") {
  if (slips.length === 0) return;
  const pdf = await buildSlipsPdf(slips, brand);
  pdf.save(filename);
}

export async function printSlipsPdf(slips: DistributionSlip[], brand: SlipBrand | string) {
  if (slips.length === 0) return;
  const pdf = await buildSlipsPdf(slips, brand);
  const url = URL.createObjectURL(pdf.output("blob"));
  const w = window.open(url, "_blank");
  if (w) {
    w.addEventListener("load", () => {
      try { w.print(); } catch { /* noop */ }
    });
  }
}

export async function uploadSlipsPdf(slips: DistributionSlip[], brand: SlipBrand | string, slipIdsToTag: string[]): Promise<string | null> {
  try {
    const pdf = await buildSlipsPdf(slips, brand);
    const blob = pdf.output("blob");
    const path = `slips/batch-${Date.now()}.pdf`;
    const { error } = await supabase.storage.from("application-pdf").upload(path, blob, {
      contentType: "application/pdf",
      upsert: true,
    });
    if (error) throw error;
    // Bucket is private — store path; admin generates signed URL on demand.
    if (slipIdsToTag.length > 0) {
      await supabase.from("distribution_slips" as never).update({ pdf_url: path } as never).in("id", slipIdsToTag);
    }
    return path;
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
