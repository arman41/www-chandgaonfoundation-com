import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Heart, ArrowRight, ChevronDown, Share2, X,
  Facebook, Twitter, MessageCircle, Send, Link as LinkIcon,
} from "lucide-react";
import type { Activity } from "@/lib/activities";
import { useLanguage } from "@/hooks/use-language";
import { useIsMobile } from "@/hooks/use-mobile";

function fmt(n: number, lang: string) {
  const locale = lang === "bn" ? "bn-BD" : "en-US";
  return n.toLocaleString(locale, { maximumFractionDigits: 0 });
}

export function ActivityGoal({ activity }: { activity: Activity }) {
  const { t, lang } = useLanguage();
  const goal = activity.goalAmount ?? 0;
  const raised = activity.raisedAmount ?? 0;
  const pct = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
  if (goal <= 0 && raised <= 0 && activity.supportersCount <= 0) return null;
  return (
    <div className="mt-3">
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="font-bold text-emerald-700">
          ৳{fmt(raised, lang)}
          {goal > 0 && (
            <span className="ml-1 font-normal text-muted-foreground">
              / ৳{fmt(goal, lang)}
            </span>
          )}
        </span>
        {goal > 0 && <span className="text-muted-foreground">{pct}%</span>}
      </div>
      <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: "linear-gradient(90deg,#059669,#10b981)" }}
        />
      </div>
      <div className="mt-1 text-[11px] text-muted-foreground">
        {fmt(activity.supportersCount, lang)} {t("সমর্থক", "supporters")}
      </div>
    </div>
  );
}

export function ActivityCard({ a, onShare, onDetail }: {
  a: Activity;
  onShare: (a: Activity) => void;
  onDetail: (a: Activity) => void;
}) {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  return (
    <article className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col">
      <div className="relative aspect-[4/3] bg-secondary/40 overflow-hidden">
        {a.imageUrl ? (
          <img src={a.imageUrl} alt={a.title} className="w-full h-full object-cover" loading="lazy" width={400} height={300} />
        ) : (
          <div className="w-full h-full grid place-items-center text-muted-foreground">
            <Heart className="w-10 h-10 opacity-30" />
          </div>
        )}
        <span className="absolute top-3 left-3 inline-block text-[10px] font-semibold uppercase tracking-wide text-primary px-2.5 py-1 rounded-full bg-background/90 backdrop-blur">
          {a.category}
        </span>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-base font-bold uppercase tracking-tight text-foreground line-clamp-2">{a.title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">📅 {a.date} · 📍 {a.location}</p>
        <ActivityGoal activity={a} />
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Link
            to="/donate"
            search={{ activity: a.id, purpose: a.category } as never}
            className="inline-flex items-center justify-center gap-1 rounded-full px-2 py-2 text-xs font-semibold text-primary-foreground bg-primary hover:opacity-90 transition"
          >
            <Heart className="w-3.5 h-3.5" /> {t("ডোনেট", "Donate")}
          </Link>
          <button
            type="button"
            onClick={() => onShare(a)}
            className="inline-flex items-center justify-center gap-1 rounded-full px-2 py-2 text-xs font-semibold border border-border hover:border-primary hover:text-primary transition"
          >
            <Share2 className="w-3.5 h-3.5" /> {t("শেয়ার", "Share")}
          </button>
          <button
            type="button"
            aria-expanded={isMobile ? open : undefined}
            onClick={() => (isMobile ? setOpen((v) => !v) : onDetail(a))}
            className="inline-flex items-center justify-center gap-1 rounded-full px-2 py-2 text-xs font-semibold border border-border hover:border-primary hover:text-primary transition"
          >
            {isMobile ? (
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
            ) : (
              <ArrowRight className="w-3.5 h-3.5" />
            )}{" "}
            {t("বিস্তারিত", "Details")}
          </button>
        </div>

        {isMobile && open && (
          <div className="mt-4 border-t border-border pt-4 animate-in fade-in slide-in-from-top-1">
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
              {a.description}
            </p>
            <Link
              to="/donate"
              search={{ activity: a.id, purpose: a.category } as never}
              className="mt-4 inline-flex w-full items-center justify-center gap-1 rounded-full px-4 py-2.5 text-xs font-semibold text-primary-foreground bg-primary"
            >
              <Heart className="w-3.5 h-3.5" /> {t("এই কার্যক্রমে ডোনেট করুন", "Donate to this activity")}
            </Link>
          </div>
        )}
      </div>
    </article>

  );
}

export function ShareModal({ activity, onClose }: { activity: Activity; onClose: () => void }) {
  const { t } = useLanguage();
  const url = typeof window !== "undefined" ? `${window.location.origin}/activities` : "/activities";
  const text = `${activity.title} — ${t("চাঁদগাঁও ফাউন্ডেশন", "Chandgaon Foundation")}`;
  const enc = encodeURIComponent;
  const links = [
    { label: "Facebook", icon: Facebook, color: "#1877F2", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}&quote=${enc(text)}` },
    { label: "WhatsApp", icon: MessageCircle, color: "#25D366", href: `https://wa.me/?text=${enc(text + "\n" + url)}` },
    { label: "Twitter", icon: Twitter, color: "#1DA1F2", href: `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}` },
    { label: "Messenger", icon: Send, color: "#0084FF", href: `https://www.facebook.com/dialog/send?link=${enc(url)}&app_id=140586622674265&redirect_uri=${enc(url)}` },
  ];
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      toast.success(t("লিঙ্ক কপি হয়েছে", "Link copied"));
    } catch {
      toast.error(t("কপি করা যায়নি", "Could not copy"));
    }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="bg-card rounded-3xl max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{t("শেয়ার করুন", "Share")}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-accent" aria-label={t("বন্ধ করুন", "Close")}><X className="w-4 h-4" /></button>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-5">{activity.title}</p>
        <div className="grid grid-cols-4 gap-3">
          {links.map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-accent transition">
              <span className="w-12 h-12 rounded-full grid place-items-center text-white" style={{ background: l.color }}>
                <l.icon className="w-5 h-5" />
              </span>
              <span className="text-[11px] font-semibold">{l.label}</span>
            </a>
          ))}
        </div>
        <button onClick={copyLink} className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold border border-border hover:bg-accent">
          <LinkIcon className="w-4 h-4" /> {t("লিঙ্ক কপি করুন", "Copy link")}
        </button>
      </div>
    </div>
  );
}

export function DetailModal({ activity, onClose }: { activity: Activity; onClose: () => void }) {
  const { t } = useLanguage();
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-card rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-8" onClick={(e) => e.stopPropagation()}>
        {activity.imageUrl && (
          <img src={activity.imageUrl} alt={activity.title} className="w-full max-h-72 object-cover" />
        )}
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 mb-3">
            <span className="inline-block text-[11px] font-semibold uppercase tracking-wide text-primary px-2.5 py-1 rounded-full" style={{ background: "color-mix(in oklab, var(--accent) 40%, transparent)" }}>
              {activity.category}
            </span>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-accent" aria-label={t("বন্ধ করুন", "Close")}><X className="w-4 h-4" /></button>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold">{activity.title}</h3>
          <p className="mt-2 text-xs text-muted-foreground">📅 {activity.date} · 📍 {activity.location}</p>
          <ActivityGoal activity={activity} />
          <p className="mt-4 text-sm leading-relaxed whitespace-pre-wrap">{activity.description}</p>
          <div className="mt-6 flex gap-2">
            <Link
              to="/donate"
              search={{ activity: activity.id, purpose: activity.category } as never}
              className="flex-1 inline-flex items-center justify-center gap-1 rounded-full px-4 py-2.5 text-sm font-semibold text-primary-foreground bg-primary"
            >
              <Heart className="w-4 h-4" /> {t("এই কার্যক্রমে ডোনেট করুন", "Donate to this activity")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
