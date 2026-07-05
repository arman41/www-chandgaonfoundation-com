import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Activity as ActivityIcon, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  AddButton, DataTable, Field, FormActions, Modal, PageHeader, SearchBox,
  confirmDelete, inputCls, showError,
} from "@/components/admin/AdminCrud";
import { CATEGORIES } from "@/lib/activities";

export const Route = createFileRoute("/admin/activities")({
  head: () => ({ meta: [{ title: "কার্যক্রম | অ্যাডমিন" }] }),
  component: Page,
});

type A = {
  id: string;
  title: string;
  category: string;
  date: string;
  location: string;
  description: string;
  image_url: string | null;
  created_at: string;
  goal_amount: number | null;
  raised_amount: number | null;
  supporters_count: number | null;
};

const EMPTY: Partial<A> = {
  title: "", category: CATEGORIES[0], date: "", location: "", description: "", image_url: "", goal_amount: null,
};

function Page() {
  const [rows, setRows] = useState<A[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [modal, setModal] = useState<{ open: boolean; data: Partial<A> }>({ open: false, data: EMPTY });
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("activities").select("*").order("created_at", { ascending: false });
    if (error) showError(error);
    setRows((data ?? []) as A[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const filtered = rows.filter((r) =>
    !q || [r.title, r.category, r.location].some((x) => x?.toLowerCase().includes(q.toLowerCase()))
  );

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const d = modal.data;
      let image_url = d.image_url || null;
      if (file) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `activities/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: upErr } = await supabase.storage.from("foundation-media").upload(path, file, { upsert: false });
        if (upErr) throw upErr;
        image_url = supabase.storage.from("foundation-media").getPublicUrl(path).data.publicUrl;
      }
      const payload: Record<string, unknown> = {
        title: d.title!, category: d.category || CATEGORIES[0], date: d.date!,
        location: d.location!, description: d.description!, image_url,
        goal_amount: d.goal_amount != null && d.goal_amount !== ("" as unknown as number) ? Number(d.goal_amount) : null,
      };
      if (d.id && d.raised_amount != null) payload.raised_amount = Number(d.raised_amount);
      const op = d.id ? supabase.from("activities").update(payload).eq("id", d.id) : supabase.from("activities").insert(payload);
      const { error } = await op;
      if (error) throw error;
      toast.success(d.id ? "আপডেট সম্পন্ন" : "কার্যক্রম প্রকাশ হয়েছে");
      setModal({ open: false, data: EMPTY });
      setFile(null);
      load();
    } catch (err) {
      showError(err);
    } finally {
      setSaving(false);
    }
  }

  async function remove(row: A) {
    if (!(await confirmDelete(`"${row.title}" মুছবেন?`))) return;
    const { error } = await supabase.from("activities").delete().eq("id", row.id);
    if (error) return showError(error);
    toast.success("মুছে ফেলা হয়েছে");
    load();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ActivityIcon}
        title="কার্যক্রম ব্যবস্থাপনা"
        subtitle={`মোট ${rows.length}টি কার্যক্রম`}
        action={<AddButton onClick={() => { setModal({ open: true, data: EMPTY }); setFile(null); }} label="+ নতুন কার্যক্রম প্রকাশ করুন" />}
      />
      <SearchBox value={q} onChange={setQ} placeholder="শিরোনাম, বিভাগ বা স্থান..." />
      <DataTable<A>
        loading={loading}
        rows={filtered}
        onEdit={(r) => { setModal({ open: true, data: r }); setFile(null); }}
        onDelete={remove}
        columns={[
          { key: "title", label: "শিরোনাম", render: (r) => (
            <div className="flex items-center gap-2">
              {r.image_url && <img src={r.image_url} alt="" className="h-9 w-9 rounded-lg object-cover" />}
              <span className="font-medium">{r.title}</span>
            </div>
          )},
          { key: "category", label: "বিভাগ" },
          { key: "date", label: "তারিখ" },
          { key: "location", label: "স্থান" },
        ]}
      />
      <Modal open={modal.open} onClose={() => { setModal({ open: false, data: EMPTY }); setFile(null); }} title={modal.data.id ? "কার্যক্রম সম্পাদনা" : "নতুন কার্যক্রম"}>
        <form onSubmit={save} className="space-y-3">
          <Field label="শিরোনাম" required>
            <input className={inputCls} required value={modal.data.title ?? ""} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, title: e.target.value } }))} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="বিভাগ" required>
              <select className={inputCls} required value={modal.data.category ?? CATEGORIES[0]} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, category: e.target.value } }))}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="তারিখ" required>
              <input className={inputCls} required placeholder="যেমন: ১৫ জানুয়ারি ২০২৬" value={modal.data.date ?? ""} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, date: e.target.value } }))} />
            </Field>
          </div>
          <Field label="স্থান" required>
            <input className={inputCls} required value={modal.data.location ?? ""} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, location: e.target.value } }))} />
          </Field>
          <Field label="বিবরণ" required>
            <textarea rows={4} className={inputCls} required value={modal.data.description ?? ""} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, description: e.target.value } }))} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="লক্ষ্য (৳)">
              <input
                type="number"
                min={0}
                className={inputCls}
                placeholder="যেমন: 50000"
                value={modal.data.goal_amount ?? ""}
                onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, goal_amount: e.target.value === "" ? null : Number(e.target.value) } }))}
              />
            </Field>
            <Field label="বর্তমান সংগৃহীত (৳)">
              <input
                type="number"
                min={0}
                className={inputCls}
                value={modal.data.raised_amount ?? ""}
                onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, raised_amount: e.target.value === "" ? 0 : Number(e.target.value) } }))}
              />
            </Field>
          </div>
          <Field label="ছবি আপলোড">
            <label className="flex items-center gap-2 cursor-pointer rounded-lg border border-dashed border-border px-3 py-2.5 text-sm hover:bg-muted/40">
              <Upload className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{file?.name ?? "ফাইল নির্বাচন করুন..."}</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </label>
            {modal.data.image_url && !file && (
              <img src={modal.data.image_url} alt="" className="mt-2 h-24 w-24 rounded-lg object-cover" />
            )}
          </Field>
          <Field label="অথবা ছবির URL">
            <input className={inputCls} placeholder="https://..." value={modal.data.image_url ?? ""} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, image_url: e.target.value } }))} />
          </Field>
          <FormActions onCancel={() => { setModal({ open: false, data: EMPTY }); setFile(null); }} submitting={saving} />
        </form>
      </Modal>
    </div>
  );
}
