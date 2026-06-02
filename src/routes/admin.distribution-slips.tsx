import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useFoundationSettings } from "@/hooks/use-foundation-settings";
import { toast } from "sonner";
import { Download, Printer, Trash2, RefreshCw, Ticket, Search } from "lucide-react";
import {
  type DistributionSlip,
  downloadSlipsPdf,
  printSlipsPdf,
} from "@/lib/distribution-slips";

export const Route = createFileRoute("/admin/distribution-slips")({
  head: () => ({ meta: [{ title: "বিতরণ স্লিপ | অ্যাডমিন" }] }),
  component: Page,
});

function Page() {
  const { isAdmin } = useAuth();
  const settings = useFoundationSettings();
  const foundationName = settings?.name ?? "চাঁদগাঁও প্রবাসী ও যুবসমাজ কল্যাণ ফাউন্ডেশন";

  const [rows, setRows] = useState<DistributionSlip[]>([]);
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    project_id: "" as string,
    distribution_date: "" as string,
    batch_number: "" as string,
    q: "" as string,
  });

  const load = async () => {
    setLoading(true);
    let q = supabase.from("distribution_slips" as never).select("*").order("created_at", { ascending: false });
    if (filters.project_id) q = q.eq("project_id", filters.project_id);
    if (filters.distribution_date) q = q.eq("distribution_date", filters.distribution_date);
    if (filters.batch_number) q = q.eq("batch_number", filters.batch_number);
    const { data, error } = await q;
    if (error) toast.error(error.message);
    setRows((data as unknown as DistributionSlip[]) ?? []);
    setSelected(new Set());
    setLoading(false);
  };

  const loadProjects = async () => {
    const { data } = await supabase.from("aid_projects" as never).select("id,name").order("name");
    setProjects((data as unknown as Array<{ id: string; name: string }>) ?? []);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.project_id, filters.distribution_date, filters.batch_number]);

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.applicant_name, r.phone, r.app_code, r.nid, r.batch_number]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [rows, filters.q]);

  const toggle = (id: string) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((r) => r.id)));
  };

  const selectedSlips = useMemo(() => filtered.filter((r) => selected.has(r.id)), [filtered, selected]);

  const downloadSelected = async () => {
    if (selectedSlips.length === 0) return toast.error("কোনো স্লিপ নির্বাচন করুন");
    toast.loading("PDF তৈরি হচ্ছে...", { id: "pdf" });
    try {
      await downloadSlipsPdf(selectedSlips, foundationName, `slips-${selectedSlips.length}.pdf`);
      toast.success("PDF ডাউনলোড হয়েছে", { id: "pdf" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "ব্যর্থ", { id: "pdf" });
    }
  };

  const downloadAll = async () => {
    if (filtered.length === 0) return toast.error("কোনো স্লিপ নেই");
    toast.loading("PDF তৈরি হচ্ছে...", { id: "pdf" });
    try {
      await downloadSlipsPdf(filtered, foundationName, `slips-all-${filtered.length}.pdf`);
      toast.success("PDF ডাউনলোড হয়েছে", { id: "pdf" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "ব্যর্থ", { id: "pdf" });
    }
  };

  const printSelected = async () => {
    const list = selectedSlips.length > 0 ? selectedSlips : filtered;
    if (list.length === 0) return toast.error("কোনো স্লিপ নেই");
    toast.loading("প্রিন্ট প্রস্তুতি...", { id: "pdf" });
    try {
      await printSlipsPdf(list, foundationName);
      toast.success("প্রিন্ট ডায়ালগ খোলা হয়েছে", { id: "pdf" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "ব্যর্থ", { id: "pdf" });
    }
  };

  const reprintOne = async (s: DistributionSlip) => {
    toast.loading("প্রস্তুতি...", { id: "pdf" });
    try {
      await downloadSlipsPdf([s], foundationName, `slip-${s.app_code ?? s.id.slice(0, 8)}.pdf`);
      toast.success("ডাউনলোড হয়েছে", { id: "pdf" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "ব্যর্থ", { id: "pdf" });
    }
  };

  const remove = async (id: string) => {
    if (!confirm("এই স্লিপটি মুছবেন?")) return;
    const { error } = await supabase.from("distribution_slips" as never).delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("মুছে ফেলা হয়েছে");
    setRows((r) => r.filter((x) => x.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl grid place-items-center bg-primary/10 text-primary">
            <Ticket className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">বিতরণ স্লিপ</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              অনুমোদিত আবেদনের জন্য তৈরি স্লিপসমূহ — A4 (৮টি/পৃষ্ঠা) ফরম্যাটে প্রিন্ট/ডাউনলোড।
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={load} className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg border border-input bg-background text-sm hover:bg-muted">
            <RefreshCw className="h-3.5 w-3.5" /> রিফ্রেশ
          </button>
          <button onClick={downloadSelected} disabled={selectedSlips.length === 0} className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50">
            <Download className="h-3.5 w-3.5" /> নির্বাচিত ({selectedSlips.length})
          </button>
          <button onClick={downloadAll} className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg border border-input bg-background text-sm hover:bg-muted">
            <Download className="h-3.5 w-3.5" /> সব ({filtered.length})
          </button>
          <button onClick={printSelected} className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg border border-input bg-background text-sm hover:bg-muted">
            <Printer className="h-3.5 w-3.5" /> প্রিন্ট
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">প্রকল্প</label>
          <select
            value={filters.project_id}
            onChange={(e) => setFilters((f) => ({ ...f, project_id: e.target.value }))}
            className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm"
          >
            <option value="">সব প্রকল্প</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">বিতরণের তারিখ</label>
          <input
            type="date"
            value={filters.distribution_date}
            onChange={(e) => setFilters((f) => ({ ...f, distribution_date: e.target.value }))}
            className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">ব্যাচ নম্বর</label>
          <input
            value={filters.batch_number}
            onChange={(e) => setFilters((f) => ({ ...f, batch_number: e.target.value }))}
            placeholder="ব্যাচ"
            className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">খুঁজুন</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={filters.q}
              onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
              placeholder="নাম / মোবাইল / কোড"
              className="w-full h-9 pl-8 pr-3 rounded-lg border border-input bg-background text-sm"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-sm text-muted-foreground">লোড হচ্ছে...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">কোনো স্লিপ পাওয়া যায়নি।</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={selected.size === filtered.length && filtered.length > 0}
                      onChange={toggleAll}
                    />
                  </th>
                  <th className="px-3 py-3">কোড</th>
                  <th className="px-3 py-3">নাম</th>
                  <th className="px-3 py-3">মোবাইল</th>
                  <th className="px-3 py-3">প্রকল্প</th>
                  <th className="px-3 py-3">তারিখ</th>
                  <th className="px-3 py-3">সময়</th>
                  <th className="px-3 py-3">স্থান</th>
                  <th className="px-3 py-3">ব্যাচ</th>
                  <th className="px-3 py-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-t border-border align-top">
                    <td className="px-3 py-3">
                      <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggle(r.id)} />
                    </td>
                    <td className="px-3 py-3 font-mono text-xs">{r.app_code ?? "—"}</td>
                    <td className="px-3 py-3">
                      <div className="font-medium">{r.applicant_name}</div>
                      {r.father_name && <div className="text-xs text-muted-foreground">পিতা: {r.father_name}</div>}
                    </td>
                    <td className="px-3 py-3">{r.phone ?? "—"}</td>
                    <td className="px-3 py-3">{r.project_name ?? "—"}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      {r.distribution_date}
                      {r.distribution_day && <div className="text-xs text-muted-foreground">{r.distribution_day}</div>}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">{r.distribution_time ?? "—"}</td>
                    <td className="px-3 py-3">{r.distribution_location ?? "—"}</td>
                    <td className="px-3 py-3 font-mono text-xs">{r.batch_number ?? "—"}</td>
                    <td className="px-3 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => reprintOne(r)}
                          title="রিপ্রিন্ট / ডাউনলোড"
                          className="h-8 w-8 grid place-items-center rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => remove(r.id)}
                            title="মুছুন"
                            className="h-8 w-8 grid place-items-center rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
