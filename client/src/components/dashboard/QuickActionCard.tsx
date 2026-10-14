import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

/**
 * QuickActionCard — action button card for quick navigation.
 * Optimized with pure GPU-accelerated CSS animations and hover effects.
 */

interface QuickActionCardProps {
  label: string;
  description: string;
  icon: ReactNode;
  href: string;
  gradient?: string;
  className?: string;
  delay?: number;
}

export function QuickActionCard({
  label,
  description,
  icon,
  href,
  gradient = "from-violet-500/10 to-indigo-500/10",
  className,
  delay = 0,
}: QuickActionCardProps) {
  return (
    <div
      style={delay ? { animationDelay: `${Math.round(delay * 1000)}ms` } : undefined}
      className="animate-in fade-in zoom-in-95 duration-300 fill-mode-backwards"
    >
      <Link
        href={href}
        className={cn(
          "group flex items-center gap-4 rounded-xl border border-border/50 p-4",
          "bg-gradient-to-br hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
          "hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 transform-gpu",
          gradient,
          className
        )}
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 group-hover:bg-primary/20 transition-colors">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold">{label}</h4>
          <p className="text-xs text-muted-foreground truncate">{description}</p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
      </Link>
    </div>
  );
}
