import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Phone, HeartHandshake } from "lucide-react";
import { useFoundationSettings } from "@/hooks/use-foundation-settings";
import { useLanguage } from "@/hooks/use-language";

function normalizeWhatsapp(input: string | null | undefined, phone: string | null | undefined) {
  const url = (input || "").trim();
  if (url) {
    if (url.startsWith("http")) return url;
    const digits = url.replace(/[^\d]/g, "");
    if (digits) return `https://wa.me/${digits}`;
  }
  const p = (phone || "").replace(/[^\d]/g, "");
  if (!p) return null;
  const normalized = p.startsWith("0") ? `88${p}` : p.startsWith("88") ? p : `88${p}`;
  return `https://wa.me/${normalized}`;
}

export function FloatingActions() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { settings } = useFoundationSettings();
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 240);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname.startsWith("/admin") || pathname.startsWith("/login") || pathname.startsWith("/forgot-password") || pathname.startsWith("/reset-password")) {
    return null;
  }

  const whatsappHref = normalizeWhatsapp(settings?.whatsapp_url, settings?.phone);
  const phoneHref = settings?.phone ? `tel:${settings.phone.replace(/\s+/g, "")}` : null;
  const onDonate = pathname === "/donate";

  return (
    <>
      {/* Desktop + mobile floating bubbles */}
      <div className={`fixed z-40 right-3 sm:right-5 bottom-20 sm:bottom-6 flex flex-col gap-3 transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
        {whatsappHref && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("হোয়াটসঅ্যাপে বার্তা পাঠান", "Message on WhatsApp")}
            title="WhatsApp"
            className="group relative w-12 h-12 sm:w-14 sm:h-14 rounded-full grid place-items-center text-white shadow-lg hover:scale-110 transition-transform"
            style={{ background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)" }}
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6 sm:w-7 sm:h-7" fill="currentColor" aria-hidden="true">
              <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.4A10 10 0 1 0 12 2z" />
            </svg>
            <span className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ background: "#25D366" }} />
          </a>
        )}
        {phoneHref && (
          <a
            href={phoneHref}
            aria-label={t("ফোন করুন", "Call us")}
            title={settings?.phone || "Call"}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full grid place-items-center text-primary-foreground shadow-lg hover:scale-110 transition-transform"
            style={{ background: "var(--gradient-hero)" }}
          >
            <Phone className="w-5 h-5 sm:w-6 sm:h-6" />
          </a>
        )}
      </div>

      {/* Mobile sticky donate bar */}
      {!onDonate && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 pt-2 pointer-events-none">
          <div className="pointer-events-auto rounded-2xl shadow-2xl border border-white/20 backdrop-blur-md" style={{ background: "linear-gradient(135deg, oklch(0.28 0.08 148 / 0.96), oklch(0.2 0.06 148 / 0.96))" }}>
            <Link
              to="/donate"
              className="flex items-center justify-center gap-2 py-3.5 text-sm font-bold text-primary-foreground rounded-2xl"
            >
              <HeartHandshake className="w-5 h-5" style={{ color: "var(--gold)" }} />
              <span>{t("এখনই দান করুন", "Donate Now")}</span>
              <span className="text-xs opacity-80 font-normal">— {t("যেকোনো পরিমাণ", "any amount")}</span>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
