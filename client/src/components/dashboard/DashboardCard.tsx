"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * DashboardCard — glassmorphism card wrapper with hover effects.
 * Base container for all dashboard sections.
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        "rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm",
        "hover:border-border hover:shadow-md transition-all duration-300",
        "overflow-hidden",
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
    </motion.div>
  );
}
