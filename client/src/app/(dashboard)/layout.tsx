import { ReactNode } from "react";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar (Stub) */}
      <aside className="w-64 border-r bg-sidebar border-sidebar-border hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
          <Link href="/dashboard" className="text-xl font-bold text-primary">
            Nexora
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {/* Nav items will go here */}
          <div className="text-sm text-sidebar-foreground p-2">Navigation Stub</div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Topbar (Stub) */}
        <header className="h-16 border-b flex items-center justify-between px-6 bg-background">
          <div className="flex items-center gap-4">
            <span className="font-medium">Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            {/* User menu, notifications will go here */}
            <div className="h-8 w-8 rounded-full bg-muted"></div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-muted/10">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
