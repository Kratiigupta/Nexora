import { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * DashboardCard — glassmorphism card wrapper with hover effects.
 * Optimized with pure GPU-accelerated CSS animations.
 */

interface DashboardCardProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function DashboardCard({
  title,
  description,
  icon,
  action,
  children,
  className,
  delay = 0,
}: DashboardCardProps) {
  return (
    <div
      style={delay ? { animationDelay: `${Math.round(delay * 1000)}ms` } : undefined}
      className={cn(
        "rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm",
        "hover:border-border hover:shadow-md transition-all duration-300",
        "overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards",
        className
      )}
    >
      {(title || action) && (
        <div className="flex items-center justify-between px-5 pt-5 pb-0">
          <div className="flex items-center gap-2.5">
            {icon && (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                {icon}
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-sm font-semibold">{title}</h3>
              )}
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
