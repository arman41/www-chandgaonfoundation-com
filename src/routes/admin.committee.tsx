import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ClipboardList, Plus, Trash2, Download, Save, FileText } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";
import { supabase } from "@/integrations/supabase/client";
import { useFoundationSettings } from "@/hooks/use-foundation-settings";
import {
  PageHeader, inputCls, showError,
} from "@/components/admin/AdminCrud";

export const Route = createFileRoute("/admin/committee")({
  head: () => ({ meta: [{ title: "কমিটি | অ্যাডমিন" }] }),
  component: Page,
});

type Volunteer = {
  id: string;
  name: string;
  phone: string | null;
  area: string | null;
  photo_url: string | null;
  volunteer_code: string | null;
  nid: string | null;
};

type Assignment = { role: string; volunteer_id: string };

type Committee = {
  id: string;
  name: string;
  year: string;
  members: Assignment[];
};

const FIXED_ROLES = [
  "সভাপতি",
  "সহ-সভাপতি",
  "সাধারণ সম্পাদক",
  "সহ-সাধারণ সম্পাদক",
  "সাংগঠনিক সম্পাদক",
  "কোষাধ্যক্ষ",
  "সহ-কোষাধ্যক্ষ",
  "প্রচার সম্পাদক",
  "দপ্তর সম্পাদক",
  "সমাজকল্যাণ সম্পাদক",
  "শিক্ষা সম্পাদক",
  "ধর্ম বিষয়ক সম্পাদক",
  "ত্রাণ ও পুনর্বাসন সম্পাদক",
  "ক্রীড়া ও সংস্কৃতি সম্পাদক",
];

const LS_KEY = "cf-committees-v1";

function loadCommittees(): Committee[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Committee[];
  } catch { return []; }
}
function saveCommittees(list: Committee[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(list)); } catch {}
}

function Page() {
  const { settings } = useFoundationSettings();
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const padRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [vRes, mRes] = await Promise.all([
        supabase
          .from("volunteers")
          .select("id,name,phone,area,photo_url,volunteer_code,nid")
          .order("name"),
        supabase
          .from("members")
          .select("id,name,phone,area,photo_url,member_code,nid,status")
          .order("name"),
      ]);
      if (vRes.error) showError(vRes.error);
      if (mRes.error) showError(mRes.error);
      const vols: Volunteer[] = (vRes.data ?? []).map((v) => ({
        id: `v:${v.id}`,
        name: `[স্বেচ্ছাসেবক] ${v.name}`,
        phone: v.phone,
        area: v.area,
        photo_url: v.photo_url,
        volunteer_code: v.volunteer_code,
        nid: v.nid,
      }));
      const mems: Volunteer[] = (mRes.data ?? [])
        .filter((m) => (m as { status?: string }).status !== "rejected")
        .map((m) => ({
          id: `m:${m.id}`,
          name: `[সদস্য] ${m.name}`,
          phone: m.phone,
          area: m.area,
          photo_url: m.photo_url,
          volunteer_code: (m as { member_code?: string | null }).member_code ?? null,
          nid: m.nid,
        }));
      setVolunteers([...mems, ...vols]);
      const list = loadCommittees();
      setCommittees(list);
      if (list.length) setActiveId(list[0].id);
      setLoading(false);
    })();
  }, []);

  const active = useMemo(() => committees.find((c) => c.id === activeId) ?? null, [committees, activeId]);
  const volMap = useMemo(() => new Map(volunteers.map((v) => [v.id, v] as const)), [volunteers]);

  function update(fn: (c: Committee) => Committee) {
    if (!active) return;
    const next = committees.map((c) => (c.id === active.id ? fn(c) : c));
    setCommittees(next);
  }

  function persist() {
    saveCommittees(committees);
    toast.success("কমিটি সংরক্ষিত হয়েছে");
  }

  function addCommittee() {
    const name = window.prompt("কমিটির নাম (যেমন: কার্যকরী কমিটি)") ?? "";
    if (!name.trim()) return;
    const year = window.prompt("বছর (যেমন: ২০২৬)") ?? "";
    const c: Committee = {
      id: crypto.randomUUID(),
      name: name.trim(),
      year: year.trim(),
      members: FIXED_ROLES.map((r) => ({ role: r, volunteer_id: "" })),
    };
    const next = [c, ...committees];
    setCommittees(next);
    setActiveId(c.id);
    saveCommittees(next);
  }

  function removeCommittee(id: string) {
    if (!window.confirm("এই কমিটি মুছে ফেলবেন?")) return;
    const next = committees.filter((c) => c.id !== id);
    setCommittees(next);
    saveCommittees(next);
    if (activeId === id) setActiveId(next[0]?.id ?? null);
  }

  function setAssignment(idx: number, volunteer_id: string) {
    update((c) => ({ ...c, members: c.members.map((m, i) => (i === idx ? { ...m, volunteer_id } : m)) }));
  }
  function setRole(idx: number, role: string) {
    update((c) => ({ ...c, members: c.members.map((m, i) => (i === idx ? { ...m, role } : m)) }));
  }
  function removeRow(idx: number) {
    update((c) => ({ ...c, members: c.members.filter((_, i) => i !== idx) }));
  }
  function addRow(role = "কার্যকরী সদস্য") {
    update((c) => ({ ...c, members: [...c.members, { role, volunteer_id: "" }] }));
  }

  async function downloadPdf() {
    if (!active || !padRef.current) return;
    setDownloading(true);
    try {
      // wait for images
      const imgs = Array.from(padRef.current.querySelectorAll("img"));
      await Promise.all(imgs.map((img) => new Promise<void>((res) => {
        if (img.complete && img.naturalWidth > 0) return res();
        img.addEventListener("load", () => res(), { once: true });
        img.addEventListener("error", () => res(), { once: true });
        setTimeout(() => res(), 4000);
      })));
      await new Promise((r) => requestAnimationFrame(() => r(null)));

      const dataUrl = await toPng(padRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#ffffff",
      });
      const pdf = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      const dims = await new Promise<{ w: number; h: number }>((res) => {
        const im = new Image();
        im.onload = () => res({ w: im.naturalWidth, h: im.naturalHeight });
        im.onerror = () => res({ w: 1000, h: 1400 });
        im.src = dataUrl;
      });
      const ratio = dims.h / dims.w;
      const w = pw;
      let h = w * ratio;
      // If single image taller than one page, split across pages
      if (h <= ph) {
        pdf.addImage(dataUrl, "PNG", 0, 0, w, h);
      } else {
        // Slice the canvas into page-sized chunks
        const sliceHpx = dims.w * (ph / pw);
        const canvas = document.createElement("canvas");
        canvas.width = dims.w;
        canvas.height = Math.ceil(sliceHpx);
        const ctx = canvas.getContext("2d")!;
        const fullImg = new Image();
        fullImg.src = dataUrl;
        await new Promise<void>((r) => { fullImg.onload = () => r(); });
        let y = 0;
        let page = 0;
        while (y < dims.h) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(fullImg, 0, -y);
          const sliceUrl = canvas.toDataURL("image/png");
          if (page > 0) pdf.addPage();
          pdf.addImage(sliceUrl, "PNG", 0, 0, w, ph);
          y += sliceHpx;
          page += 1;
        }
      }
      pdf.save(`committee-${active.name}-${active.year || ""}.pdf`);
      toast.success("PDF ডাউনলোড হয়েছে");
    } catch (e) {
      showError(e);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ClipboardList}
        title="কমিটি ব্যবস্থাপনা"
        subtitle="সদস্য ও স্বেচ্ছাসেবক থেকে পদ অনুযায়ী কমিটি বাছাই ও PDF ডাউনলোড"
        action={
          <button onClick={addCommittee} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold">
            <Plus className="w-4 h-4" /> নতুন কমিটি
          </button>
        }
      />

      <div className="grid lg:grid-cols-[260px_1fr] gap-4">
        <aside className="rounded-xl border border-border bg-card p-2 space-y-1 max-h-[70vh] overflow-auto">
          {loading && <p className="text-xs text-muted-foreground p-2">লোড হচ্ছে...</p>}
          {!loading && committees.length === 0 && (
            <p className="text-xs text-muted-foreground p-3">কোনো কমিটি নেই। উপরে "নতুন কমিটি" দিন।</p>
          )}
          {committees.map((c) => (
            <div key={c.id} className={"flex items-center gap-1 rounded-lg " + (c.id === activeId ? "bg-primary/10" : "hover:bg-muted")}>
              <button onClick={() => setActiveId(c.id)} className="flex-1 text-left px-3 py-2 text-sm">
                <div className="font-semibold truncate">{c.name}</div>
                {c.year && <div className="text-[10px] text-muted-foreground">{c.year}</div>}
              </button>
              <button onClick={() => removeCommittee(c.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg" aria-label="মুছুন">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </aside>

        <section className="space-y-4">
          {!active ? (
            <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              একটি কমিটি নির্বাচন করুন বা নতুন তৈরি করুন।
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <label className="block text-xs font-semibold">
                    কমিটির নাম
                    <input className={inputCls + " mt-1"} value={active.name} onChange={(e) => update((c) => ({ ...c, name: e.target.value }))} />
                  </label>
                  <label className="block text-xs font-semibold">
                    বছর
                    <input className={inputCls + " mt-1"} value={active.year} onChange={(e) => update((c) => ({ ...c, year: e.target.value }))} />
                  </label>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted text-xs">
                      <tr>
                        <th className="text-left p-2 w-10">#</th>
                        <th className="text-left p-2">পদবী</th>
                        <th className="text-left p-2">সদস্য / স্বেচ্ছাসেবক</th>
                        <th className="w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {active.members.map((m, i) => (
                        <tr key={i} className="border-t border-border">
                          <td className="p-2 text-muted-foreground">{i + 1}</td>
                          <td className="p-2">
                            <input className={inputCls} value={m.role} onChange={(e) => setRole(i, e.target.value)} />
                          </td>
                          <td className="p-2">
                            <select className={inputCls} value={m.volunteer_id} onChange={(e) => setAssignment(i, e.target.value)}>
                              <option value="">— নির্বাচন করুন —</option>
                              {volunteers.map((v) => (
                                <option key={v.id} value={v.id}>{v.name}{v.phone ? ` — ${v.phone}` : ""}</option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2">
                            <button onClick={() => removeRow(i)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button onClick={() => addRow()} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted">
                    <Plus className="w-3.5 h-3.5" /> সদস্য যোগ
                  </button>
                  <button onClick={persist} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold">
                    <Save className="w-3.5 h-3.5" /> সংরক্ষণ
                  </button>
                  <button onClick={downloadPdf} disabled={downloading} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-50">
                    <Download className="w-3.5 h-3.5" /> {downloading ? "তৈরি হচ্ছে..." : "PDF (A4) ডাউনলোড"}
                  </button>
                </div>
              </div>

              {/* Off-screen A4 letterhead pad for capture */}
              <div className="overflow-auto rounded-xl border border-border bg-white" style={{ maxHeight: "70vh" }}>
                <Letterhead ref={padRef} committee={active} volMap={volMap} settings={settings} />
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function Letterhead({
  committee, volMap, settings, ref,
}: {
  committee: Committee;
  volMap: Map<string, Volunteer>;
  settings: ReturnType<typeof useFoundationSettings>["settings"];
  ref: React.RefObject<HTMLDivElement | null>;
}) {
  const rows = committee.members.filter((m) => m.volunteer_id);
  return (
    <div
      ref={ref}
      style={{
        width: "794px", // A4 @ 96dpi
        minHeight: "1123px",
        padding: "48px 56px",
        background: "#ffffff",
        color: "#0b1220",
        fontFamily: "'Hind Siliguri', 'Tiro Bangla', system-ui, sans-serif",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, borderBottom: "3px double #0f5132", paddingBottom: 16 }}>
        {settings?.logo_url && (
          <img src={settings.logo_url} alt="logo" crossOrigin="anonymous" style={{ width: 80, height: 80, objectFit: "contain" }} />
        )}
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#0f5132" }}>{settings?.name || "চাঁদগাঁও প্রবাসী ও যুবসমাজ কল্যাণ ফাউন্ডেশন"}</div>
          {settings?.tagline && <div style={{ fontSize: 13, color: "#475569", marginTop: 2 }}>{settings.tagline}</div>}
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
            {[settings?.address, settings?.phone, settings?.email].filter(Boolean).join(" • ")}
          </div>
        </div>
      </div>

      {/* Title */}
      <div style={{ textAlign: "center", margin: "22px 0 14px" }}>
        <div style={{ display: "inline-block", padding: "6px 18px", background: "#0f5132", color: "#fff", fontWeight: 700, fontSize: 16, borderRadius: 6 }}>
          {committee.name}{committee.year ? ` — ${committee.year}` : ""}
        </div>
      </div>

      {/* Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
        <thead>
          <tr style={{ background: "#f1f5f9" }}>
            <th style={cell(28, true)}>ক্রম</th>
            <th style={cell(60, true)}>ছবি</th>
            <th style={{ ...cell(undefined, true), textAlign: "left" }}>নাম</th>
            <th style={{ ...cell(95, true), textAlign: "left" }}>মোবাইল</th>
            <th style={{ ...cell(110, true), textAlign: "left" }}>NID</th>
            <th style={{ ...cell(80, true), textAlign: "left" }}>সদস্য কার্ড</th>
            <th style={{ ...cell(undefined, true), textAlign: "left" }}>ঠিকানা</th>
            <th style={{ ...cell(120, true), textAlign: "left" }}>পদবী</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((m, i) => {
            const v = volMap.get(m.volunteer_id);
            if (!v) return null;
            return (
              <tr key={i}>
                <td style={cell(28)}>{i + 1}</td>
                <td style={cell(60)}>
                  {v.photo_url ? (
                    <img src={v.photo_url} alt="" crossOrigin="anonymous" style={{ width: 44, height: 44, borderRadius: 6, objectFit: "cover", display: "block", margin: "0 auto" }} />
                  ) : (
                    <div style={{ width: 44, height: 44, borderRadius: 6, background: "#e2e8f0", margin: "0 auto" }} />
                  )}
                </td>
                <td style={{ ...cell(), textAlign: "left", fontWeight: 600 }}>{v.name}</td>
                <td style={{ ...cell(95), textAlign: "left" }}>{v.phone || "—"}</td>
                <td style={{ ...cell(110), textAlign: "left" }}>{v.nid || "—"}</td>
                <td style={{ ...cell(80), textAlign: "left" }}>{v.volunteer_code || "—"}</td>
                <td style={{ ...cell(), textAlign: "left" }}>{v.area || "—"}</td>
                <td style={{ ...cell(120), textAlign: "left", fontWeight: 600, color: "#0f5132" }}>{m.role}</td>
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr>
              <td colSpan={8} style={{ ...cell(), padding: "24px", textAlign: "center", color: "#94a3b8" }}>
                কোনো স্বেচ্ছাসেবক নির্বাচিত হয়নি।
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Footer signatures */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 80, fontSize: 12 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ borderTop: "1px solid #0b1220", paddingTop: 6, minWidth: 180 }}>সাধারণ সম্পাদক</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ borderTop: "1px solid #0b1220", paddingTop: 6, minWidth: 180 }}>সভাপতি</div>
        </div>
      </div>

      <div style={{ marginTop: 24, fontSize: 10, color: "#94a3b8", textAlign: "center" }}>
        প্রকাশ তারিখ: {new Date().toLocaleDateString("bn-BD")} • {settings?.website_url || "chandgaonfundition.xyz"}
      </div>
    </div>
  );
}

function cell(width?: number, header = false): React.CSSProperties {
  return {
    border: "1px solid #cbd5e1",
    padding: "8px 6px",
    textAlign: "center",
    verticalAlign: "middle",
    width,
    background: header ? "#f1f5f9" : undefined,
    fontWeight: header ? 700 : undefined,
  };
}
