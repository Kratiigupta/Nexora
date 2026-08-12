"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAuthStore } from "@/stores/authStore";
import { authService } from "@/lib/services/auth.service";
import { getInitials } from "@/lib/utils";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Search,
  Users,
  FolderKanban,
  MessageSquare,
  ArrowLeftRight,
  Calendar,
  Bell,
  Settings,
  LogOut,
  Menu,
  User,
  Moon,
  Sun,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "next-themes";
import type { Profile } from "@/types/user";

/**
 * DashboardLayout — functional sidebar + topbar layout.
 * Replaces the previous stub layout with full navigation.
 */

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Profile", href: "/profile", icon: User },
  { label: "Discover", href: "/discover/students", icon: Search },
  { label: "Teams", href: "/teams", icon: Users },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Messages", href: "/messages", icon: MessageSquare },
  { label: "Skill Exchange", href: "/skill-exchange", icon: ArrowLeftRight },
  { label: "Events", href: "/events", icon: Calendar },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

/**
 * SidebarContent — extracted as a standalone component to avoid
 * react-hooks/static-components lint errors from declaring
 * components inside render.
 */
function SidebarContent({
  pathname,
  profile,
  onNavigate,
}: {
  pathname: string;
  profile: Profile | null;
  onNavigate: () => void;
}) {
  return (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-sidebar-border shrink-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 group"
          onClick={onNavigate}
        >
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-violet-500/25">
            N
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Nexora
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-sidebar-primary/10 text-sidebar-primary shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  active ? "text-sidebar-primary" : "text-sidebar-foreground"
                )}
              />
              <span>{item.label}</span>
              {active && (
                <ChevronRight className="h-3.5 w-3.5 ml-auto text-sidebar-primary/50" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      {profile && (
        <div className="border-t border-sidebar-border p-3 shrink-0">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage
                src={profile.avatarUrl || undefined}
                alt={profile.fullName}
              />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                {getInitials(profile.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{profile.fullName}</p>
              <p className="text-xs text-sidebar-foreground truncate">
                @{profile.username}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, clearAuth } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authService.signOut();
      clearAuth();
      toast.success("Signed out successfully");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Failed to sign out");
    }
  };

  const closeMobile = () => setMobileOpen(false);

  // Derive page title from pathname
  const getPageTitle = () => {
    const match = navItems.find((item) => isActive(pathname, item.href));
    if (pathname.includes("/profile/edit")) return "Edit Profile";
    if (pathname.includes("/profile/")) return "Profile";
    return match?.label || "Dashboard";
  };

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="w-64 border-r bg-sidebar border-sidebar-border hidden md:flex flex-col fixed inset-y-0 left-0 z-30">
        <SidebarContent
          pathname={pathname}
          profile={profile}
          onNavigate={closeMobile}
        />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-sidebar border-sidebar-border">
          <SidebarContent
            pathname={pathname}
            profile={profile}
            onNavigate={closeMobile}
          />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 md:ml-64">
        {/* Topbar */}
        <header className="h-16 border-b flex items-center justify-between px-4 sm:px-6 bg-background/80 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h2 className="font-semibold text-base">{getPageTitle()}</h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
              className="text-muted-foreground"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground relative"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
            </Button>

            {/* User menu */}
            {profile && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="relative h-9 w-9 rounded-full inline-flex items-center justify-center hover:bg-accent transition-colors focus:outline-none"
                  aria-label="User menu"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={profile.avatarUrl || undefined}
                      alt={profile.fullName}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                      {getInitials(profile.fullName)}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>
                      <p className="text-sm font-medium">{profile.fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        @{profile.username}
                      </p>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/profile/edit")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Edit Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-muted/10">
          <div className="mx-auto max-w-6xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
