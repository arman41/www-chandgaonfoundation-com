import { useEffect, useState } from "react";
import { MEMBERSHIP_TERMS, type MembershipType } from "@/lib/membership-terms";

export function MembershipTermsModal({
  open,
  type,
  onAccept,
  onCancel,
  submitting,
}: {
  open: boolean;
  type: MembershipType;
  onAccept: () => void;
  onCancel: () => void;
  submitting?: boolean;
}) {
  const [agreed, setAgreed] = useState(false);
  useEffect(() => { if (open) setAgreed(false); }, [open, type]);

  if (!open) return null;
  const doc = MEMBERSHIP_TERMS[type];
  if (!doc) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "oklch(0 0 0 / 0.55)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-title"
    >
      <div className="w-full sm:max-w-lg bg-card border border-border rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[92vh]" style={{ boxShadow: "var(--shadow-elegant)" }}>
        <div className="px-5 sm:px-7 py-4 border-b border-border" style={{ background: "var(--gradient-hero)", color: "oklch(0.98 0 0)" }}>
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--gold)" }}>শর্তাবলী</p>
          <h2 id="terms-title" className="mt-1 text-lg sm:text-xl font-bold">{doc.title}</h2>
        </div>

        <div className="overflow-y-auto px-5 sm:px-7 py-5 space-y-4 text-sm leading-relaxed">
          <p className="text-muted-foreground">{doc.intro}</p>
          <ol className="list-decimal ps-5 space-y-2 marker:text-primary marker:font-bold">
            {doc.clauses.map((c, i) => <li key={i}>{c}</li>)}
          </ol>
          {doc.footer && <p className="mt-3 text-xs text-muted-foreground border-t border-border pt-3">{doc.footer}</p>}
        </div>

        <div className="border-t border-border px-5 sm:px-7 py-4 space-y-3 bg-background/60">
          <label className="flex items-start gap-2.5 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 h-4 w-4 accent-primary"
            />
            <span>
              আমি উপরের সকল শর্তাবলী পড়েছি এবং <strong className="text-primary">স্বেচ্ছায় সম্মতি</strong> প্রদান করছি।
            </span>
          </label>
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="px-5 py-2.5 rounded-full border border-border font-semibold text-sm hover:bg-muted disabled:opacity-60"
            >
              বাতিল
            </button>
            <button
              type="button"
              disabled={!agreed || submitting}
              onClick={onAccept}
              className="px-6 py-2.5 rounded-full font-bold text-sm disabled:opacity-50"
              style={{ background: "var(--gradient-gold)", color: "oklch(0.22 0.05 160)", boxShadow: "var(--shadow-gold)" }}
            >
              {submitting ? "জমা হচ্ছে..." : "সম্মতি দিয়ে আবেদন জমা দিন"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
