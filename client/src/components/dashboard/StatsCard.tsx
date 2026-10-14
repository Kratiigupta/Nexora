import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

/**
 * StatsCard — individual stat with icon, value, label, and optional trend.
 * Optimized with pure GPU-accelerated CSS animations.
 */

interface StatsCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  trend?: { value: number; label: string };
  className?: string;
  delay?: number;
}

export function StatsCard({
  label,
  value,
  icon,
  trend,
  className,
  delay = 0,
}: StatsCardProps) {
  const TrendIcon =
    trend && trend.value > 0
      ? TrendingUp
      : trend && trend.value < 0
        ? TrendingDown
        : Minus;
  const trendColor =
    trend && trend.value > 0
      ? "text-emerald-500"
      : trend && trend.value < 0
        ? "text-red-500"
        : "text-muted-foreground";

  return (
    <div
      style={delay ? { animationDelay: `${Math.round(delay * 1000)}ms` } : undefined}
      className={cn(
        "rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-4",
        "hover:border-border hover:shadow-md transition-all duration-300",
        "animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        {trend && (
          <div className={cn("flex items-center gap-1 text-xs font-medium", trendColor)}>
            <TrendIcon className="h-3 w-3" />
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}
