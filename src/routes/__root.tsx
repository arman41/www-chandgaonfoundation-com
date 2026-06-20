import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "@/components/ui/sonner";
import { useFoundationSettings } from "@/hooks/use-foundation-settings";

import { useEffect, useState } from "react";
import { Menu, X, MapPin, Phone, Mail } from "lucide-react";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#0f5132" },
      { title: "চাঁদগাঁও ফাউন্ডেশন" },
      { name: "description", content: "চাঁদগাঁওয়ের প্রবাসী ও যুবসমাজের উদ্যোগে মানবিক, শিক্ষা ও সামাজিক কল্যাণমূলক দাতব্য ফাউন্ডেশন।" },
      { name: "author", content: "Chandgaon Foundation" },
      { property: "og:title", content: "চাঁদগাঁও ফাউন্ডেশন" },
      { property: "og:description", content: "চাঁদগাঁওয়ের প্রবাসী ও যুবসমাজের উদ্যোগে মানবিক, শিক্ষা ও সামাজিক কল্যাণমূলক দাতব্য ফাউন্ডেশন।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "চাঁদগাঁও ফাউন্ডেশন" },
      { name: "twitter:description", content: "চাঁদগাঁওয়ের প্রবাসী ও যুবসমাজের উদ্যোগে মানবিক, শিক্ষা ও সামাজিক কল্যাণমূলক দাতব্য ফাউন্ডেশন।" },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/b0ad8232-74d4-4b62-bfbc-1bd74f2d695a" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/b0ad8232-74d4-4b62-bfbc-1bd74f2d695a" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Tiro+Bangla:ital@0;1&display=swap",
      },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "icon", href: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { rel: "apple-touch-icon", href: "/icon-192.png" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              name: "চাঁদগাঁও প্রবাসী ও যুবসমাজ কল্যান ফাউন্ডেশন",
              alternateName: "Chandgaon Foundation",
              url: "https://chandgaonfoundation-info.lovable.app",
              logo: "https://chandgaonfoundation-info.lovable.app/icon-512.png",
              description: "চাঁদগাঁওয়ের প্রবাসী ও যুবসমাজের উদ্যোগে মানবিক, শিক্ষা ও সামাজিক কল্যাণমূলক দাতব্য ফাউন্ডেশন।",
              address: {
                "@type": "PostalAddress",
                addressLocality: "চাঁদগাঁও, লাকসাম",
                addressRegion: "কুমিল্লা",
                addressCountry: "BD",
              },
            },
            {
              "@type": "WebSite",
              name: "চাঁদগাঁও ফাউন্ডেশন",
              url: "https://chandgaonfoundation-info.lovable.app",
            },
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const { settings } = useFoundationSettings();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("cf-theme");
      const dark = stored ? stored === "dark" : window.matchMedia?.("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", !!dark);
    } catch {}
  }, []);

  // Sync favicon / apple-touch-icon with the foundation logo (admin → Foundation settings)
  useEffect(() => {
    const href = settings?.logo_url;
    if (!href) return;
    const ensure = (rel: string, sizes?: string) => {
      const selector = sizes ? `link[rel="${rel}"][sizes="${sizes}"]` : `link[rel="${rel}"]`;
      let el = document.querySelector<HTMLLinkElement>(selector);
      if (!el) {
        el = document.createElement("link");
        el.rel = rel;
        if (sizes) el.sizes = sizes;
        document.head.appendChild(el);
      }
      el.href = href;
    };
    ensure("icon");
    ensure("shortcut icon");
    ensure("apple-touch-icon");
  }, [settings?.logo_url]);

  useEffect(() => {
    const refreshRoutes = () => router.invalidate();
    window.addEventListener("cf-auth-role-ready", refreshRoutes);
    return () => window.removeEventListener("cf-auth-role-ready", refreshRoutes);
  }, [router]);

  return (
    <QueryClientProvider client={queryClient}>
      <SiteLayout>
        <Outlet />
      </SiteLayout>
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}

function SiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdmin = pathname.startsWith("/admin");
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-background text-foreground font-bengali">
        {children}
      </div>
    );
  }
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-bengali">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  const navLink =
    "text-sm font-medium text-foreground/80 hover:text-primary transition-colors";
  const { user, isAdmin } = useAuth();
  const { settings } = useFoundationSettings();
  const [open, setOpen] = useState(false);
  const [logoErr, setLogoErr] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => { setLogoErr(false); }, [settings?.logo_url]);
  const links = [
    { to: "/", label: "হোম" },
    { to: "/about", label: "আমাদের সম্পর্কে" },
    { to: "/activities", label: "কার্যক্রম" },
    { to: "/membership", label: "সদস্যপদ" },
    { to: "/contact", label: "যোগাযোগ" },
  ] as const;
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
        <Link to="/" className="flex items-center gap-2 min-w-0">
          {settings?.logo_url && !logoErr ? (
            <img
              src={settings.logo_url}
              alt={settings?.name || "চাঁদগাঁও ফাউন্ডেশন"}
              onError={() => setLogoErr(true)}
              className="w-9 h-9 shrink-0 rounded-full object-cover bg-background"
            />
          ) : (
            <span className="w-9 h-9 shrink-0 rounded-full grid place-items-center text-primary-foreground font-bold" style={{ background: "var(--gradient-hero)" }}>
              চা
            </span>
          )}
          <span className="font-semibold text-sm leading-tight hidden sm:block">
            চাঁদগাঁও প্রবাসী ও যুবসমাজ<br />
            <span className="text-xs text-muted-foreground">কল্যান ফাউন্ডেশন</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {links.map(l => <Link key={l.to} to={l.to} className={navLink}>{l.label}</Link>)}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin" className="hidden sm:inline text-sm font-semibold text-primary hover:underline" title={user.email ?? ""}>
                  অ্যাডমিন
                </Link>
              )}
              <button onClick={() => supabase.auth.signOut()} className="hidden sm:inline text-sm font-medium text-foreground/70 hover:text-primary" title={user.email ?? ""}>
                লগআউট
              </button>
            </>
          ) : (
            <Link to="/login" className="hidden sm:inline text-sm font-medium text-foreground/70 hover:text-primary">
              লগইন
            </Link>
          )}
          <Link
            to="/donate"
            className="inline-flex items-center justify-center rounded-full px-3 sm:px-5 py-2 text-xs sm:text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
            style={{ background: "var(--gradient-gold)", color: "oklch(0.22 0.05 160)", boxShadow: "var(--shadow-gold)" }}
          >
            দান করুন
          </Link>
          <button
            type="button"
            onClick={() => setOpen(v => !v)}
            aria-label="Menu"
            aria-expanded={open}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-border hover:bg-accent transition"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
          <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col">
            {links.map(l => (
              <Link key={l.to} to={l.to} className="py-2.5 text-sm font-medium text-foreground/90 hover:text-primary border-b border-border/60 last:border-0">
                {l.label}
              </Link>
            ))}
            {user ? (
              <>
                {isAdmin && <Link to="/admin" className="py-2.5 text-sm font-semibold text-primary border-b border-border/60">অ্যাডমিন</Link>}
                <button onClick={() => supabase.auth.signOut()} className="py-2.5 text-sm font-medium text-left text-foreground/80 hover:text-primary">লগআউট</button>
              </>
            ) : (
              <Link to="/login" className="py-2.5 text-sm font-medium text-foreground/80 hover:text-primary">লগইন</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
function SiteFooter() {
  const { settings } = useFoundationSettings();
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-semibold mb-3 text-base">চাঁদগাঁও ফাউন্ডেশন</h3>
          <p className="text-sm opacity-80 leading-relaxed">
            প্রবাসী ও যুবসমাজের উদ্যোগে মানবিক কল্যাণে নিবেদিত একটি অলাভজনক প্রতিষ্ঠান।
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide" style={{ color: "var(--gold)" }}>লিংক</h4>
          <ul className="space-y-2 text-sm opacity-90">
            <li><Link to="/about" className="hover:opacity-100">আমাদের সম্পর্কে</Link></li>
            <li><Link to="/activities" className="hover:opacity-100">কার্যক্রম</Link></li>
            <li><Link to="/events" className="hover:opacity-100">ইভেন্ট</Link></li>
            <li><Link to="/notices" className="hover:opacity-100">নোটিশ</Link></li>
            <li><Link to="/donate" className="hover:opacity-100">দান করুন</Link></li>
            <li><Link to="/help" className="hover:opacity-100">সাহায্যের আবেদন</Link></li>
            <li><Link to="/membership" className="hover:opacity-100">সদস্যপদ আবেদন</Link></li>
            <li><Link to="/my-membership" className="hover:opacity-100">আমার সদস্য কার্ড</Link></li>
            <li><Link to="/track" className="hover:opacity-100">আবেদন ট্র্যাক</Link></li>
            <li><Link to="/contact" className="hover:opacity-100">যোগাযোগ</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide" style={{ color: "var(--gold)" }}>যোগাযোগ</h4>
          <p className="text-sm opacity-90 flex items-start gap-2">
            <MapPin className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
            <span>{settings?.address || "চাঁদগাঁও, লাকসাম, কুমিল্লা, বাংলাদেশ"}</span>
          </p>
          {settings?.phone && (
            <p className="text-sm opacity-90 mt-1 flex items-center gap-2">
              <Phone className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{settings.phone}</span>
            </p>
          )}
          {settings?.email && (
            <p className="text-sm opacity-90 mt-1 flex items-center gap-2">
              <Mail className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{settings.email}</span>
            </p>
          )}
          {(settings?.facebook_url || settings?.youtube_url || settings?.whatsapp_url || settings?.instagram_url || settings?.twitter_url || settings?.website_url) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {settings?.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition" title="Facebook">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H8v-2.9h2.4V9.8c0-2.4 1.4-3.7 3.6-3.7 1 0 2.1.2 2.1.2v2.3h-1.2c-1.2 0-1.5.7-1.5 1.5v1.8h2.6l-.4 2.9h-2.2v7A10 10 0 0 0 22 12z"/></svg>
                </a>
              )}
              {settings?.youtube_url && (
                <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition" title="YouTube">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M23 12s0-3.2-.4-4.7a2.5 2.5 0 0 0-1.8-1.8C19.3 5 12 5 12 5s-7.3 0-8.8.5A2.5 2.5 0 0 0 1.4 7.3C1 8.8 1 12 1 12s0 3.2.4 4.7a2.5 2.5 0 0 0 1.8 1.8C4.7 19 12 19 12 19s7.3 0 8.8-.5a2.5 2.5 0 0 0 1.8-1.8c.4-1.5.4-4.7.4-4.7zM9.8 15.3V8.7l6 3.3-6 3.3z"/></svg>
                </a>
              )}
              {settings?.whatsapp_url && (
                <a href={settings.whatsapp_url} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition" title="WhatsApp">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.4A10 10 0 1 0 12 2z"/></svg>
                </a>
              )}
              {settings?.instagram_url && (
                <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition" title="Instagram">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>
                </a>
              )}
              {settings?.twitter_url && (
                <a href={settings.twitter_url} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition" title="Twitter">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M18.9 3H22l-7 8 8.3 10h-6.5l-5.1-6.3L5.7 21H2.5l7.5-8.6L2 3h6.6l4.6 5.8L18.9 3z"/></svg>
                </a>
              )}
              {settings?.website_url && (
                <a href={settings.website_url} target="_blank" rel="noopener noreferrer" aria-label="Website" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition" title="Website">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>
                </a>
              )}
            </div>
          )}
        </div>

      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs opacity-70">
        © {new Date().getFullYear()} চাঁদগাঁও প্রবাসী ও যুবসমাজ কল্যান ফাউন্ডেশন
      </div>
    </footer>
  );
}
