"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, User, Moon, Sun, Monitor, LogOut, ShieldAlert } from "lucide-react";
import { authService } from "@/lib/services/auth.service";

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { clearAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Prevent hydration mismatch for next-themes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await authService.signOut();
      clearAuth();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch {
      toast.error("Failed to log out");
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account preferences and application settings
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Settings */}
        <DashboardCard
          title="Profile Settings"
          description="Manage your public profile, skills, and resume"
          icon={<User className="h-4 w-4" />}
          delay={0.1}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Edit Profile Information</p>
              <p className="text-xs text-muted-foreground">
                Update your avatar, bio, academic details, and portfolio links.
              </p>
            </div>
            <Button onClick={() => router.push("/profile/edit")} variant="outline">
              Go to Profile Settings
            </Button>
          </div>
        </DashboardCard>

        {/* Appearance Settings */}
        <DashboardCard
          title="Appearance"
          description="Customize how the application looks"
          icon={<Settings className="h-4 w-4" />}
          delay={0.2}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Theme Preference</p>
              <p className="text-xs text-muted-foreground">
                Choose between light and dark mode, or sync with your system.
              </p>
            </div>
            {mounted && (
              <div className="w-[180px]">
                <Select value={theme} onValueChange={(val) => val && setTheme(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        <span>Light</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        <span>Dark</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        <span>System</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </DashboardCard>

        {/* Account Security */}
        <DashboardCard
          title="Account Security"
          description="Manage your active session"
          icon={<ShieldAlert className="h-4 w-4 text-destructive" />}
          delay={0.3}
        >
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Sign Out</p>
                <p className="text-xs text-muted-foreground">
                  Sign out of your current session on this device.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {isLoggingOut ? "Signing out..." : "Sign Out"}
              </Button>
            </div>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
