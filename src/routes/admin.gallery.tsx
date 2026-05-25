import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Images, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, SearchBox, confirmDelete, inputCls, showError, Field, Modal, FormActions, AddButton } from "@/components/admin/AdminCrud";

export const Route = createFileRoute("/admin/gallery")({
  head: () => ({ meta: [{ title: "গ্যালারি | অ্যাডমিন" }] }),
  component: Page,
});

type G = { id: string; title: string | null; type: string; media_url: string; album: string | null; created_at: string };

function Page() {
  const [rows, setRows] = useState<G[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<{ title: string; album: string; type: "photo" | "video"; media_url: string; file: File | null }>({
    title: "", album: "", type: "photo", media_url: "", file: null,
  });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("gallery_items").select("*").order("created_at", { ascending: false });
    if (error) showError(error);
    setRows((data ?? []) as G[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const filtered = rows.filter((r) => !q || [r.title, r.album].some((x) => x?.toLowerCase().includes(q.toLowerCase())));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      let url = form.media_url;
      if (form.file) {
        const ext = form.file.name.split(".").pop() ?? "bin";
        const path = `gallery/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("foundation-media").upload(path, form.file, { upsert: false });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("foundation-media").getPublicUrl(path);
        url = pub.publicUrl;
      }
      if (!url) throw new Error("ছবি/ভিডিও URL বা ফাইল প্রয়োজন");
      const { error } = await supabase.from("gallery_items").insert({
        title: form.title || null, album: form.album || null, type: form.type, media_url: url,
      });
      if (error) throw error;
      toast.success("গ্যালারিতে যোগ হয়েছে");
      setForm({ title: "", album: "", type: "photo", media_url: "", file: null });
      setModal(false);
      load();
    } catch (err) {
      showError(err);
    } finally {
      setSaving(false);
    }
  }

  async function remove(row: G) {
    if (!(await confirmDelete("এই আইটেম মুছবেন?"))) return;
    const { error } = await supabase.from("gallery_items").delete().eq("id", row.id);
    if (error) return showError(error);
    toast.success("মুছে ফেলা হয়েছে");
    load();
  }

  return (
    <div className="space-y-6">
      <PageHeader icon={Images} title="গ্যালারি ব্যবস্থাপনা" subtitle={`${rows.length}টি আইটেম`}
        action={<AddButton onClick={() => setModal(true)} label="নতুন আপলোড" />} />
      <SearchBox value={q} onChange={setQ} placeholder="শিরোনাম বা অ্যালবাম..." />

      {loading ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">লোড হচ্ছে...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">কোনো আইটেম নেই</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map((g) => (
            <div key={g.id} className="group relative rounded-xl overflow-hidden border border-border bg-card aspect-square">
              {g.type === "video" ? (
                <video src={g.media_url} className="w-full h-full object-cover" muted />
              ) : (
                <img src={g.media_url} alt={g.title ?? ""} className="w-full h-full object-cover" loading="lazy" />
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition">
                <p className="text-white text-xs truncate">{g.title || g.album || "—"}</p>
              </div>
              <button onClick={() => remove(g)} className="absolute top-1.5 right-1.5 h-7 w-7 grid place-items-center rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition hover:bg-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="নতুন আপলোড">
        <form onSubmit={save} className="space-y-3">
          <Field label="শিরোনাম">
            <input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="অ্যালবাম"><input className={inputCls} value={form.album} onChange={(e) => setForm({ ...form, album: e.target.value })} /></Field>
            <Field label="ধরন">
              <select className={inputCls} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "photo" | "video" })}>
                <option value="photo">ছবি</option><option value="video">ভিডিও</option>
              </select>
            </Field>
          </div>
          <Field label="ফাইল আপলোড করুন">
            <div className="flex items-center gap-2">
              <label className="flex-1 flex items-center gap-2 cursor-pointer rounded-lg border border-dashed border-border px-3 py-2.5 text-sm hover:bg-muted/40">
                <Upload className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{form.file?.name ?? "ফাইল নির্বাচন করুন..."}</span>
                <input type="file" accept={form.type === "video" ? "video/*" : "image/*"} className="hidden" onChange={(e) => setForm({ ...form, file: e.target.files?.[0] ?? null })} />
              </label>
            </div>
          </Field>
          <Field label="অথবা URL দিন">
            <input className={inputCls} placeholder="https://..." value={form.media_url} onChange={(e) => setForm({ ...form, media_url: e.target.value })} />
          </Field>
          <FormActions onCancel={() => setModal(false)} submitting={saving} submitLabel="আপলোড" />
        </form>
      </Modal>
    </div>
  );
}
