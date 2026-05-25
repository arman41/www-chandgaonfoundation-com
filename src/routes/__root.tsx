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
import { useEffect } from "react";

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
      { title: "চাঁদগাঁও প্রবাসী ও যুবসমাজ কল্যান ফাউন্ডেশন" },
      { name: "description", content: "চাঁদগাঁওয়ের প্রবাসী ও যুবসমাজের উদ্যোগে মানবিক, শিক্ষা ও সামাজিক কল্যাণমূলক দাতব্য ফাউন্ডেশন।" },
      { name: "author", content: "Chandgaon Foundation" },
      { property: "og:title", content: "চাঁদগাঁও প্রবাসী ও যুবসমাজ কল্যান ফাউন্ডেশন" },
      { property: "og:description", content: "চাঁদগাঁওয়ের প্রবাসী ও যুবসমাজের উদ্যোগে মানবিক, শিক্ষা ও সামাজিক কল্যাণমূলক দাতব্য ফাউন্ডেশন।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "চাঁদগাঁও প্রবাসী ও যুবসমাজ কল্যান ফাউন্ডেশন" },
      { name: "twitter:description", content: "চাঁদগাঁওয়ের প্রবাসী ও যুবসমাজের উদ্যোগে মানবিক, শিক্ষা ও সামাজিক কল্যাণমূলক দাতব্য ফাউন্ডেশন।" },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/A7tgESygPISdUpPDkn3u7Ey2EA52/social-images/social-1779520834466-28125.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/A7tgESygPISdUpPDkn3u7Ey2EA52/social-images/social-1779520834466-28125.webp" },
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

  useEffect(() => {
    try {
      const stored = localStorage.getItem("cf-theme");
      const dark = stored ? stored === "dark" : window.matchMedia?.("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", !!dark);
    } catch {}
  }, []);

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
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-full grid place-items-center text-primary-foreground font-bold" style={{ background: "var(--gradient-hero)" }}>
            চা
          </span>
          <span className="font-semibold text-sm leading-tight hidden sm:block">
            চাঁদগাঁও প্রবাসী ও যুবসমাজ<br />
            <span className="text-xs text-muted-foreground">কল্যান ফাউন্ডেশন</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className={navLink}>হোম</Link>
          <Link to="/about" className={navLink}>আমাদের সম্পর্কে</Link>
          <Link to="/activities" className={navLink}>কার্যক্রম</Link>
          <Link to="/events" className={navLink}>ইভেন্ট</Link>
          <Link to="/notices" className={navLink}>নোটিশ</Link>
          <Link to="/help" className={navLink}>সাহায্যের আবেদন</Link>
          <Link to="/membership" className={navLink}>সদস্যপদ</Link>
          <Link to="/track" className={navLink}>ট্র্যাক</Link>
          <Link to="/contact" className={navLink}>যোগাযোগ</Link>
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-sm font-medium text-foreground/70 hover:text-primary"
              title={user.email ?? ""}
            >
              {isAdmin ? "অ্যাডমিন" : "লগআউট"}
            </button>
          ) : (
            <Link to="/login" className="text-sm font-medium text-foreground/70 hover:text-primary">
              লগইন
            </Link>
          )}
          <Link
            to="/donate"
            className="inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
            style={{ background: "var(--gradient-gold)", color: "oklch(0.22 0.05 160)", boxShadow: "var(--shadow-gold)" }}
          >
            দান করুন
          </Link>
        </div>
      </div>
    </header>
  );
}

function SiteFooter() {
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
            <li><Link to="/track" className="hover:opacity-100">আবেদন ট্র্যাক</Link></li>
            <li><Link to="/contact" className="hover:opacity-100">যোগাযোগ</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide" style={{ color: "var(--gold)" }}>যোগাযোগ</h4>
          <p className="text-sm opacity-90">চাঁদগাঁও, লাকসাম, কুমিল্লা, বাংলাদেশ</p>
          <p className="text-sm opacity-90 mt-1">info@chandgaonfoundation.org</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs opacity-70">
        © {new Date().getFullYear()} চাঁদগাঁও প্রবাসী ও যুবসমাজ কল্যান ফাউন্ডেশন
      </div>
    </footer>
  );
}
