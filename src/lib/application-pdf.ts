import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";
import QRCode from "qrcode";
import { uploadApplicationPdf } from "@/lib/uploads.functions";

export type ReceiptData = {
  app_code: string;
  name: string;
  phone: string;
  nid: string;
  type: string;
  amount?: string | null;
  requested_amount?: number | null;
  reason: string;
  project_name?: string | null;
  father_name?: string | null;
  mother_name?: string | null;
  present_address?: string | null;
  photo_url?: string | null;
  foundation_name: string;
  created_at: string;
};

function escapeHtml(s: string | null | undefined): string {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

async function buildReceiptHtml(d: ReceiptData, qrDataUrl: string): Promise<HTMLDivElement> {
  const el = document.createElement("div");
  el.style.cssText = "position:fixed;left:-10000px;top:0;width:794px;background:#fff;color:#0c2340;font-family:'Noto Sans Bengali','SolaimanLipi','Kalpurush',system-ui,sans-serif;padding:48px;box-sizing:border-box;";
  el.innerHTML = `
    <div style="border:3px solid #0c2340;padding:32px;border-radius:12px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #16a34a;padding-bottom:16px;margin-bottom:24px;">
        <div>
          <div style="font-size:22px;font-weight:800;color:#0c2340;">${escapeHtml(d.foundation_name)}</div>
          <div style="font-size:13px;color:#475569;margin-top:4px;">আবেদন রসিদ / Application Receipt</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:11px;color:#64748b;font-weight:600;text-transform:uppercase;">আবেদন নম্বর</div>
          <div style="font-size:18px;font-weight:800;color:#16a34a;letter-spacing:2px;">${escapeHtml(d.app_code)}</div>
        </div>
      </div>

      <div style="display:flex;gap:24px;margin-bottom:20px;">
        ${d.photo_url ? `<img src="${escapeHtml(d.photo_url)}" crossorigin="anonymous" style="width:110px;height:140px;object-fit:cover;border:2px solid #0c2340;border-radius:6px;"/>` : ""}
        <div style="flex:1;font-size:13px;line-height:1.9;">
          <div><b>নাম:</b> ${escapeHtml(d.name)}</div>
          ${d.father_name ? `<div><b>পিতা:</b> ${escapeHtml(d.father_name)}</div>` : ""}
          ${d.mother_name ? `<div><b>মাতা:</b> ${escapeHtml(d.mother_name)}</div>` : ""}
          <div><b>মোবাইল:</b> ${escapeHtml(d.phone)}</div>
          <div><b>NID:</b> ${escapeHtml(d.nid)}</div>
          ${d.present_address ? `<div><b>ঠিকানা:</b> ${escapeHtml(d.present_address)}</div>` : ""}
        </div>
      </div>

      <div style="background:#f8fafc;padding:14px 18px;border-radius:8px;font-size:13px;line-height:1.9;margin-bottom:16px;">
        ${d.project_name ? `<div><b>প্রকল্প:</b> ${escapeHtml(d.project_name)}</div>` : ""}
        <div><b>সাহায্যের ধরন:</b> ${escapeHtml(d.type)}</div>
        ${d.requested_amount ? `<div><b>প্রয়োজনীয় পরিমাণ:</b> ৳ ${Number(d.requested_amount).toLocaleString("bn-BD")}</div>` : (d.amount ? `<div><b>পরিমাণ:</b> ${escapeHtml(d.amount)}</div>` : "")}
        <div><b>আবেদনের তারিখ:</b> ${new Date(d.created_at).toLocaleString("bn-BD")}</div>
      </div>

      <div style="font-size:13px;line-height:1.7;margin-bottom:20px;">
        <div style="font-weight:700;margin-bottom:6px;">আবেদনের কারণ:</div>
        <div style="white-space:pre-wrap;">${escapeHtml(d.reason)}</div>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:flex-end;border-top:1px dashed #cbd5e1;padding-top:16px;">
        <div style="font-size:11px;color:#64748b;max-width:420px;line-height:1.6;">
          এই রসিদটি সংরক্ষণ করুন। আবেদনটি যাচাই-বাছাই করে কর্তৃপক্ষ যোগাযোগ করবে। অনলাইনে ট্র্যাক করতে QR স্ক্যান করুন বা আবেদন নম্বর ব্যবহার করুন।
        </div>
        <img src="${qrDataUrl}" style="width:96px;height:96px;"/>
      </div>
    </div>
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

export async function generateAndUploadReceipt(d: ReceiptData, upload_token: string): Promise<string | null> {
  try {
    const trackUrl = `${window.location.origin}/track?id=${encodeURIComponent(d.app_code)}`;
    const qr = await QRCode.toDataURL(trackUrl, { width: 200, margin: 1, color: { dark: "#0c2340", light: "#ffffff" } });
    const el = await buildReceiptHtml(d, qr);
    await waitForImages(el);

    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#ffffff", logging: false });
    document.body.removeChild(el);

    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const pw = pdf.internal.pageSize.getWidth();
    const ph = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pw / canvas.width, ph / canvas.height);
    const w = canvas.width * ratio;
    const h = canvas.height * ratio;
    pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", (pw - w) / 2, 20, w, h);

    const blob = pdf.output("blob");
    const dataBase64 = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => {
        const s = r.result as string;
        const i = s.indexOf(",");
        resolve(i >= 0 ? s.slice(i + 1) : s);
      };
      r.onerror = () => reject(new Error("read failed"));
      r.readAsDataURL(blob);
    });
    const { path } = await uploadApplicationPdf({ data: { app_code: d.app_code, dataBase64 } });
    return path;
  } catch (err) {
    console.error("PDF generation failed:", err);
    return null;
  }
}
