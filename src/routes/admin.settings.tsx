import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Settings as SettingsIcon, Shield, ShieldOff, UserPlus, Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/hooks/use-theme";
import { PageHeader, Field, inputCls, showError, StatusPill, confirmDelete } from "@/components/admin/AdminCrud";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "সেটিংস | অ্যাডমিন" }] }),
  component: Page,
});

type RoleRow = { id: string; user_id: string; role: "admin" | "moderator" | "user"; created_at: string; email?: string };

function Page() {
  const { theme, setTheme } = useTheme();
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "moderator">("moderator");
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("user_roles").select("*").order("created_at", { ascending: false });
    if (error) showError(error);
    setRoles((data ?? []) as RoleRow[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function grant(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setBusy(true);
    try {
      // We can't query auth.users directly via RLS; rely on the user having signed up first.
      // Try to find a matching auth user via the admin_activity_logs (signups don't log there).
      // Best path: ask admin to insert via SQL helper. Here, attempt an RPC-style fallback:
      const { data: existing } = await supabase
        .from("user_roles")
        .select("user_id")
        .limit(1000);
      // Resort: prompt error since we lack a public lookup; recommend the SQL route.
      const { error } = await supabase.rpc("grant_role_by_email" as any, { _email: email, _role: newRole });
      if (error) throw new Error("ইউজার খুঁজে পাওয়া যায়নি। ব্যবহারকারীকে আগে সাইনআপ করতে বলুন।");
      void existing;
      toast.success(`${email}-কে ${newRole} ভূমিকা দেওয়া হয়েছে`);
      setEmail("");
      load();
    } catch (err) {
      showError(err);
    } finally {
      setBusy(false);
    }
  }

  async function revoke(r: RoleRow) {
    if (!(await confirmDelete(`${r.role} ভূমিকা প্রত্যাহার করবেন?`))) return;
    const { error } = await supabase.from("user_roles").delete().eq("id", r.id);
    if (error) return showError(error);
    toast.success("ভূমিকা প্রত্যাহার করা হয়েছে");
    load();
  }

  return (
    <div className="space-y-6">
      <PageHeader icon={SettingsIcon} title="সেটিংস" subtitle="থিম এবং ভূমিকা ব্যবস্থাপনা" />

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-semibold mb-1 flex items-center gap-2">
          {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />} থিম
        </h2>
        <p className="text-sm text-muted-foreground mb-4">ডার্ক ও লাইট মোডের মধ্যে স্যুইচ করুন।</p>
        <div className="flex gap-2">
          {(["light", "dark"] as const).map((t) => (
            <button key={t} onClick={() => setTheme(t)}
              className={`px-4 py-2 text-sm rounded-xl border transition ${theme === t ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}>
              {t === "light" ? "লাইট" : "ডার্ক"}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-semibold mb-1 flex items-center gap-2"><UserPlus className="h-4 w-4" /> ভূমিকা প্রদান</h2>
        <p className="text-sm text-muted-foreground mb-4">ব্যবহারকারীকে অবশ্যই আগে সাইনআপ করতে হবে।</p>
        <form onSubmit={grant} className="grid sm:grid-cols-[1fr_auto_auto] gap-2">
          <Field label="ইমেইল"><input type="email" required className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" /></Field>
          <Field label="ভূমিকা">
            <select className={inputCls} value={newRole} onChange={(e) => setNewRole(e.target.value as "admin" | "moderator")}>
              <option value="moderator">মডারেটর</option><option value="admin">অ্যাডমিন</option>
            </select>
          </Field>
          <div className="flex items-end">
            <button disabled={busy} className="h-[42px] px-4 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-50">
              প্রদান করুন
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="font-semibold flex items-center gap-2"><Shield className="h-4 w-4" /> বর্তমান ভূমিকা</h2>
          <p className="text-sm text-muted-foreground">মোট {roles.length} জন স্টাফ</p>
        </div>
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">লোড হচ্ছে...</div>
        ) : roles.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">কোনো ভূমিকা প্রদান করা হয়নি</div>
        ) : (
          <ul className="divide-y divide-border">
            {roles.map((r) => (
              <li key={r.id} className="flex items-center justify-between p-4 gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-mono truncate">{r.user_id}</p>
                  <p className="text-xs text-muted-foreground">যোগদান: {new Date(r.created_at).toLocaleDateString("bn-BD")}</p>
                </div>
                {r.role === "admin" ? <StatusPill tone="danger" label="অ্যাডমিন" /> : <StatusPill tone="info" label="মডারেটর" />}
                <button onClick={() => revoke(r)} className="text-xs px-2.5 py-1 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 inline-flex items-center gap-1">
                  <ShieldOff className="h-3 w-3" /> প্রত্যাহার
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
