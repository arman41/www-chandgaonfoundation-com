import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  lookupHelpApplication,
  STATUS_LABELS,
  STATUS_STEPS,
  type PublicHelpLookup,
} from "@/lib/help-applications";
import { useLanguage } from "@/hooks/use-language";

type Search = { id?: string };

const STATUS_LABELS_EN: Record<string, string> = {
  pending: "Pending",
  under_review: "Under Review",
  approved: "Approved",
  in_progress: "In Progress",
  completed: "Completed",
  rejected: "Rejected",
};

export const Route = createFileRoute("/track")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    id: typeof search.id === "string" ? search.id : undefined,
  }),
  component: TrackPage,
  head: () => ({
    meta: [
      { title: "Track Application | Chandgaon Foundation" },
      { name: "description", content: "Use your application number to check the current status of your help request submitted to Chandgaon Foundation." },
      { property: "og:title", content: "Track Application | Chandgaon Foundation" },
      { property: "og:description", content: "Use your application number to check the status of your help request." },
      { property: "og:url", content: "https://www.chandgaonfundition.xyz/track" },
      { name: "twitter:title", content: "Track Application | Chandgaon Foundation" },
      { name: "twitter:description", content: "Use your application number to check the status of your help request." },
      { property: "og:image", content: "https://www.chandgaonfundition.xyz/og-image.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Track Application — Chandgaon Foundation" },
      { name: "twitter:image", content: "https://www.chandgaonfundition.xyz/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://www.chandgaonfundition.xyz/track" }],
  }),
});

function TrackPage() {
  const { id: initialId } = Route.useSearch();
  const navigate = useNavigate({ from: "/track" });
  const { t } = useLanguage();
  const [input, setInput] = useState(initialId ?? "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PublicHelpLookup | null | undefined>(undefined);

  const lookup = async (id: string) => {
    const trimmed = id.trim();
    if (!trimmed) return;
    setLoading(true);
    try {
      setResult(await lookupHelpApplication(trimmed));
    } finally {
      setLoading(false);
    }
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
          {t("আবেদন ট্র্যাকিং", "Application Tracking")}
        </p>
        <h1 className="mt-3 text-3xl md:text-4xl font-bold">
          {t("আপনার আবেদনের বর্তমান অবস্থা", "Current status of your application")}
        </h1>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
          {t("আবেদন জমা দেওয়ার সময় প্রাপ্ত নম্বরটি নিচে লিখে অনুসন্ধান করুন।", "Enter the number you received when you submitted the application.")}
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
          placeholder={t("যেমন: CF-2605-1234", "e.g. CF-2605-1234")}
          className="flex-1 h-12 px-4 rounded-lg border border-input bg-background text-sm tracking-wider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        />
        <button
          type="submit"
          disabled={loading}
          className="h-12 px-6 rounded-lg text-sm font-semibold text-primary-foreground disabled:opacity-60"
          style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-elegant)" }}
        >
          {loading ? t("খুঁজছি...", "Searching...") : t("ট্র্যাক করুন", "Track")}
        </button>
      </form>

      {result === null && (
        <div className="mt-8 rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <p className="font-semibold text-foreground">{t("কোনো আবেদন পাওয়া যায়নি", "No application found")}</p>
          <p className="mt-2 text-sm text-muted-foreground">{t("নম্বরটি সঠিকভাবে লেখা হয়েছে কিনা যাচাই করুন।", "Please check the number you entered.")}</p>
        </div>
      )}

      {result && <ApplicationCard app={result} />}
    </section>
  );
}

function statusLabel(status: string, lang: "bn" | "en"): string {
  if (lang === "en") return STATUS_LABELS_EN[status] ?? STATUS_LABELS[status as keyof typeof STATUS_LABELS] ?? status;
  return STATUS_LABELS[status as keyof typeof STATUS_LABELS] ?? status;
}

function ApplicationCard({ app }: { app: PublicHelpLookup }) {
  const { t, lang } = useLanguage();
  const currentIndex =
    app.status === "rejected" ? -1 : STATUS_STEPS.indexOf(app.status);

  const locale = lang === "bn" ? "bn-BD" : "en-US";
  const submitted = new Date(app.created_at).toLocaleString(locale, {
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
            {t("আবেদন নম্বর", "Application Number")}
          </p>
          <p className="mt-1 text-xl font-bold text-primary tracking-wider">
            {app.app_code}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{t("জমার সময়:", "Submitted:")} {submitted}</p>
        </div>
        <StatusBadge status={app.status} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4 py-5 border-b border-border text-sm">
        <Info label={t("আবেদনকারী", "Applicant")} value={app.name} />
        <Info label={t("সাহায্যের ধরন", "Help Type")} value={app.type} />
        <Info
          label={t("আনুমানিক পরিমাণ", "Approximate Amount")}
          value={app.amount ? `৳ ${app.amount}` : "—"}
        />
        <Info label={t("সংযুক্ত ফাইল", "Attached Files")} value={t(`${app.file_count} টি`, `${app.file_count}`)} />
      </div>

      {app.status === "rejected" ? (
        <div className="mt-5 p-4 rounded-lg bg-destructive/10 text-sm text-destructive">
          {t("দুঃখিত, আপনার আবেদনটি এই মুহূর্তে গ্রহণ করা সম্ভব হয়নি। বিস্তারিত জানার জন্য যোগাযোগ করুন।", "Sorry, your application could not be accepted at this time. Please contact us for details.")}
        </div>
      ) : (
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            {t("অগ্রগতি", "Progress")}
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
                      {statusLabel(step, lang)}
                    </p>
                    {isCurrent && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t("বর্তমান অবস্থা", "Current status")}
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

function StatusBadge({ status }: { status: PublicHelpLookup["status"] }) {
  const { lang } = useLanguage();
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
      {statusLabel(status, lang)}
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
