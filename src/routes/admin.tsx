import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAdminGuard } from "@/hooks/use-admin-guard";
import {
  LayoutDashboard,
  Users,
  HeartHandshake,
  HandHeart,
  CalendarDays,
  Megaphone,
  LifeBuoy,
  Images,
  BarChart3,
  ScrollText,
  Settings,
  LogOut,
  Building2,
  Moon,
  Sun,
  Activity,
  FolderKanban,
  MessageSquare,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/hooks/use-theme";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "অ্যাডমিন প্যানেল | চাঁদগাঁও ফাউন্ডেশন" }],
  }),
  component: AdminLayout,
});

type NavItem = { title: string; url: string; icon: typeof LayoutDashboard; exact?: boolean };
const navItems: NavItem[] = [
  { title: "ড্যাশবোর্ড", url: "/admin", icon: LayoutDashboard, exact: true },
  { title: "সদস্য", url: "/admin/members", icon: Users },
  { title: "দান", url: "/admin/donations", icon: HeartHandshake },
  { title: "স্বেচ্ছাসেবক", url: "/admin/volunteers", icon: HandHeart },
  { title: "ইভেন্ট", url: "/admin/events", icon: CalendarDays },
  { title: "কার্যক্রম", url: "/admin/activities", icon: Activity },
  { title: "নোটিশ", url: "/admin/notices", icon: Megaphone },
  { title: "সাহায্য প্রকল্প", url: "/admin/projects", icon: FolderKanban },
  { title: "সাহায্যের আবেদন", url: "/admin/help-requests", icon: LifeBuoy },
  { title: "গ্যালারি", url: "/admin/gallery", icon: Images },
  { title: "রিপোর্ট", url: "/admin/reports", icon: BarChart3 },
  { title: "SMS পাঠান", url: "/admin/sms", icon: MessageSquare },
  { title: "অ্যাক্টিভিটি লগ", url: "/admin/activity-logs", icon: ScrollText },
  { title: "ফাউন্ডেশন তথ্য", url: "/admin/foundation", icon: Building2 },
  { title: "সেটিংস", url: "/admin/settings", icon: Settings },
];

function AdminLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const guard = useAdminGuard();

  if (guard === "loading" || guard === "unauthenticated") {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">লোড হচ্ছে...</div>;
  }
  if (guard === "denied") {
    return (
      <div className="min-h-screen grid place-items-center px-6">
        <div className="max-w-md text-center rounded-2xl border border-destructive/30 bg-destructive/5 p-8">
          <h1 className="text-2xl font-bold text-destructive">অনুমতি নেই</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            অ্যাডমিন প্যানেল ব্যবহার করতে আপনার অ্যাকাউন্টে admin ভূমিকা প্রয়োজন।
          </p>
          <Link to="/" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">← হোমে ফিরুন</Link>
        </div>
      </div>
    );
  }


  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/80 backdrop-blur px-4">
            <SidebarTrigger />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground leading-none">অ্যাডমিন প্যানেল</p>
              <p className="text-sm font-semibold truncate">চাঁদগাঁও প্রবাসী ও যুবসমাজ কল্যাণ ফাউন্ডেশন</p>
            </div>
            <button
              onClick={toggle}
              aria-label="থিম স্যুইচ"
              className="h-9 w-9 grid place-items-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={async () => {
                if (user) {
                  await supabase.from("admin_activity_logs").insert({
                    actor_id: user.id,
                    actor_email: user.email,
                    action: "auth.logout",
                    user_agent: navigator.userAgent,
                  });
                }
                await supabase.auth.signOut();
                navigate({ to: "/" });
              }}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-destructive transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" /> লগআউট
            </button>
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { isAdmin } = useAuth();

  const isActive = (url: string, exact?: boolean) =>
    exact ? pathname === url : pathname === url || pathname.startsWith(url + "/");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/admin" className="flex items-center gap-2 px-2 py-2">
          <span
            className="w-8 h-8 rounded-lg grid place-items-center text-primary-foreground font-bold text-sm flex-shrink-0"
            style={{ background: "var(--gradient-hero, var(--primary))" }}
          >
            চা
          </span>
          {!collapsed && (
            <span className="text-sm font-semibold leading-tight truncate">
              ফাউন্ডেশন
              <br />
              <span className="text-[10px] font-normal text-sidebar-foreground/60">অ্যাডমিন প্যানেল</span>
            </span>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>ব্যবস্থাপনা</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url, item.exact)} tooltip={item.title}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        {!collapsed && (
          <div className="px-2 py-2 text-[11px] text-sidebar-foreground/60">
            {isAdmin ? "🛡️ সুপার অ্যাডমিন" : "👤 মডারেটর"}
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}