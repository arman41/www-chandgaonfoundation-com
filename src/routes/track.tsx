import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  findApplication,
  STATUS_LABELS,
  STATUS_STEPS,
  type HelpApplication,
} from "@/lib/help-applications";

type Search = { id?: string };

export const Route = createFileRoute("/track")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    id: typeof search.id === "string" ? search.id : undefined,
  }),
  component: TrackPage,
  head: () => ({
    meta: [
      { title: "আবেদন ট্র্যাক করুন | চাঁদগাঁও ফাউন্ডেশন" },
      {
        name: "description",
        content:
          "আপনার আবেদন নম্বর দিয়ে চাঁদগাঁও ফাউন্ডেশনে জমা দেওয়া সাহায্যের আবেদনের বর্তমান অবস্থা দেখুন।",
      },
    ],
  }),
});

function TrackPage() {
  const { id: initialId } = Route.useSearch();
  const navigate = useNavigate({ from: "/track" });
  const [input, setInput] = useState(initialId ?? "");
  const [result, setResult] = useState<HelpApplication | null | undefined>(undefined);

  const lookup = (id: string) => {
    const trimmed = id.trim();
    if (!trimmed) return;
    setResult(findApplication(trimmed));
  };

  useEffect(() => {
    if (initialId) lookup(initialId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialId]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ search: { id: input.trim() || undefined }, replace: true });
    lookup(input);
  };

  return (
    <section className="max-w-3xl mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          আবেদন ট্র্যাকিং
        </p>
        <h1 className="mt-3 text-3xl md:text-4xl font-bold">
          আপনার আবেদনের বর্তমান অবস্থা
        </h1>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
          আবেদন জমা দেওয়ার সময় প্রাপ্ত নম্বরটি নিচে লিখে অনুসন্ধান করুন।
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="bg-card border border-border rounded-2xl p-6 md:p-8 flex flex-col sm:flex-row gap-3"
        style={{ boxShadow: "var(--shadow-elegant)" }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="যেমন: CF-2605-1234"
          className="flex-1 h-12 px-4 rounded-lg border border-input bg-background text-sm tracking-wider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        />
        <button
          type="submit"
          className="h-12 px-6 rounded-lg text-sm font-semibold text-primary-foreground"
          style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-elegant)" }}
        >
          ট্র্যাক করুন
        </button>
      </form>

      {result === null && (
        <div className="mt-8 rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <p className="font-semibold text-foreground">কোনো আবেদন পাওয়া যায়নি</p>
          <p className="mt-2 text-sm text-muted-foreground">
            নম্বরটি সঠিকভাবে লেখা হয়েছে কিনা যাচাই করুন। নোট: ট্র্যাকিং তথ্য এই ডিভাইসেই সংরক্ষিত থাকে।
          </p>
        </div>
      )}

      {result && <ApplicationCard app={result} />}
    </section>
  );
}

function ApplicationCard({ app }: { app: HelpApplication }) {
  const currentIndex =
    app.status === "rejected" ? -1 : STATUS_STEPS.indexOf(app.status);

  const submitted = new Date(app.createdAt).toLocaleString("bn-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div
      className="mt-8 rounded-2xl border border-border bg-card p-6 md:p-8"
      style={{ boxShadow: "var(--shadow-elegant)" }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-border">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            আবেদন নম্বর
          </p>
          <p className="mt-1 text-xl font-bold text-primary tracking-wider">
            {app.id}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">জমার সময়: {submitted}</p>
        </div>
        <StatusBadge status={app.status} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4 py-5 border-b border-border text-sm">
        <Info label="আবেদনকারী" value={app.name} />
        <Info label="মোবাইল" value={app.phone} />
        <Info label="সাহায্যের ধরন" value={app.type} />
        <Info
          label="আনুমানিক পরিমাণ"
          value={app.amount ? `৳ ${app.amount}` : "—"}
        />
        {app.address && <Info label="ঠিকানা" value={app.address} />}
        <Info label="সংযুক্ত ফাইল" value={`${app.fileCount} টি`} />
      </div>

      {app.status === "rejected" ? (
        <div className="mt-5 p-4 rounded-lg bg-destructive/10 text-sm text-destructive">
          দুঃখিত, আপনার আবেদনটি এই মুহূর্তে গ্রহণ করা সম্ভব হয়নি। বিস্তারিত জানার জন্য যোগাযোগ করুন।
        </div>
      ) : (
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            অগ্রগতি
          </p>
          <ol className="space-y-4">
            {STATUS_STEPS.map((step, i) => {
              const reached = i <= currentIndex;
              const isCurrent = i === currentIndex;
              return (
                <li key={step} className="flex items-start gap-4">
                  <div
                    className={`mt-0.5 w-7 h-7 rounded-full grid place-items-center text-xs font-bold shrink-0 ${
                      reached
                        ? "text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                    style={reached ? { background: "var(--gradient-hero)" } : undefined}
                  >
                    {reached ? "✓" : i + 1}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p
                      className={`text-sm font-semibold ${
                        isCurrent ? "text-primary" : reached ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {STATUS_LABELS[step]}
                    </p>
                    {isCurrent && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        বর্তমান অবস্থা
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: HelpApplication["status"] }) {
  const tone =
    status === "completed"
      ? "bg-primary text-primary-foreground"
      : status === "approved"
        ? "bg-emerald-100 text-emerald-900"
        : status === "rejected"
          ? "bg-destructive/15 text-destructive"
          : status === "under_review"
            ? "bg-amber-100 text-amber-900"
            : "bg-muted text-foreground";
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium text-foreground">{value}</p>
    </div>
  );
}