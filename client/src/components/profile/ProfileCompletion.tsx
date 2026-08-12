"use client";

import { cn } from "@/lib/utils";

/**
 * ProfileCompletion — circular progress ring with percentage.
 * Reusable on dashboard and profile pages.
 */

interface ProfileCompletionProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showLabel?: boolean;
}

export function ProfileCompletion({
  percentage,
  size = 80,
  strokeWidth = 6,
  className,
  showLabel = true,
}: ProfileCompletionProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 80) return "text-emerald-500";
    if (percentage >= 50) return "text-blue-500";
    if (percentage >= 25) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
          aria-label={`Profile ${percentage}% complete`}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {/* Background ring */}
          <circle
            className="text-muted/50"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          {/* Progress ring */}
          <circle
            className={cn("transition-all duration-700 ease-out", getColor())}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>
        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("font-bold", size > 60 ? "text-lg" : "text-sm")}>
            {percentage}%
          </span>
        </div>
      </div>
      {showLabel && (
        <p className="text-xs text-muted-foreground font-medium">
          Profile Complete
        </p>
      )}
    </div>
  );
}
