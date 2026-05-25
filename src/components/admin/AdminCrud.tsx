import { ReactNode, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, X } from "lucide-react";
import { toast } from "sonner";

export type Column<T> = {
  key: keyof T | string;
  label: string;
  render?: (row: T) => ReactNode;
  className?: string;
};

export function PageHeader({ icon: Icon, title, subtitle, action }: { icon: any; title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <header className="flex items-start justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-3">
        <span className="h-11 w-11 rounded-2xl grid place-items-center bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {action}
    </header>
  );
}

export function AddButton({ onClick, label = "নতুন যোগ করুন" }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:opacity-90 transition shadow-sm"
    >
      <Plus className="h-4 w-4" /> {label}
    </button>
  );
}

export function SearchBox({ value, onChange, placeholder = "খুঁজুন..." }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative max-w-sm flex-1">
      <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  loading,
  onEdit,
  onDelete,
  emptyText = "কোনো রেকর্ড নেই",
}: {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  emptyText?: string;
}) {
  if (loading) return <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">লোড হচ্ছে...</div>;
  if (!rows.length) return <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">{emptyText}</div>;

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                {columns.map((c) => (
                  <th key={String(c.key)} className={`text-left font-semibold px-4 py-3 ${c.className ?? ""}`}>{c.label}</th>
                ))}
                {(onEdit || onDelete) && <th className="px-4 py-3 text-right">অ্যাকশন</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-muted/20 transition">
                  {columns.map((c) => (
                    <td key={String(c.key)} className={`px-4 py-3 ${c.className ?? ""}`}>
                      {c.render ? c.render(row) : String((row as any)[c.key] ?? "—")}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        {onEdit && (
                          <button onClick={() => onEdit(row)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted text-muted-foreground hover:text-primary">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {onDelete && (
                          <button onClick={() => onDelete(row)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {rows.map((row) => (
          <div key={row.id} className="rounded-2xl border border-border bg-card p-4 space-y-1.5">
            {columns.map((c) => (
              <div key={String(c.key)} className="flex justify-between gap-3 text-sm">
                <span className="text-muted-foreground text-xs">{c.label}</span>
                <span className="text-right">{c.render ? c.render(row) : String((row as any)[c.key] ?? "—")}</span>
              </div>
            ))}
            {(onEdit || onDelete) && (
              <div className="pt-2 flex justify-end gap-2 border-t border-border">
                {onEdit && (
                  <button onClick={() => onEdit(row)} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted">
                    এডিট
                  </button>
                )}
                {onDelete && (
                  <button onClick={() => onDelete(row)} className="text-xs px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10">
                    ডিলিট
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold">{title}</h3>
          <button onClick={onClose} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, children, required }: { label: string; children: ReactNode; required?: boolean }) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="font-medium text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </span>
      {children}
    </label>
  );
}

export const inputCls =
  "w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring";

export function FormActions({ onCancel, submitting, submitLabel = "সংরক্ষণ করুন" }: { onCancel: () => void; submitting?: boolean; submitLabel?: string }) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <button type="button" onClick={onCancel} className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted">
        বাতিল
      </button>
      <button type="submit" disabled={submitting} className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-50">
        {submitting ? "অপেক্ষা..." : submitLabel}
      </button>
    </div>
  );
}

export async function confirmDelete(message = "আপনি কি নিশ্চিতভাবে মুছে ফেলতে চান?") {
  return window.confirm(message);
}

export function showError(e: unknown) {
  const msg = e instanceof Error ? e.message : "একটি সমস্যা হয়েছে";
  toast.error(msg);
}

export function StatusPill({ tone, label }: { tone: "success" | "warn" | "danger" | "muted" | "info"; label: string }) {
  const map = {
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    warn: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    danger: "bg-destructive/10 text-destructive",
    muted: "bg-muted text-muted-foreground",
    info: "bg-primary/10 text-primary",
  };
  return <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${map[tone]}`}>{label}</span>;
}
