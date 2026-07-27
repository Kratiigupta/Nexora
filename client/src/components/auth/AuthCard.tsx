"use client";

import { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * AuthCard — glassmorphism card wrapper for all auth pages.
 * Features gradient border glow, frosted glass effect, and responsive sizing.
 */
interface AuthCardProps {
  children: ReactNode;
  title: string;
  description?: string;
  className?: string;
}

export function AuthCard({ children, title, description, className }: AuthCardProps) {
  return (
    <div className={cn("w-full", className)}>
      {/* Gradient glow ring behind card */}
      <div className="relative">
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 opacity-75 blur-lg" />

        <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl rounded-2xl">
          {/* Subtle shimmer overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-purple-500/[0.03] pointer-events-none" />

          <CardHeader className="relative space-y-2 pb-2 pt-8 px-8">
            <h2 className="text-2xl font-bold tracking-tight text-center text-foreground">
              {title}
            </h2>
            {description && (
              <p className="text-sm text-muted-foreground text-center leading-relaxed">
                {description}
              </p>
            )}
          </CardHeader>

          <CardContent className="relative px-8 pb-8 pt-4">
            {children}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
