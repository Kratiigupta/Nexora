"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

/**
 * PasswordStrengthMeter — visual password strength indicator.
 * Color-coded bars from weak (red) → strong (green).
 */
interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
}

interface StrengthResult {
  score: number; // 0–4
  label: string;
  color: string;
}

function getPasswordStrength(password: string): StrengthResult {
  if (!password) return { score: 0, label: "", color: "" };

  let score = 0;

  // Length checks
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Character variety
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  // Cap at 4
  const normalizedScore = Math.min(4, Math.floor((score / 6) * 4));

  const levels: Record<number, { label: string; color: string }> = {
    0: { label: "Very weak", color: "bg-red-500" },
    1: { label: "Weak", color: "bg-orange-500" },
    2: { label: "Fair", color: "bg-yellow-500" },
    3: { label: "Strong", color: "bg-emerald-500" },
    4: { label: "Very strong", color: "bg-green-500" },
  };

  return { score: normalizedScore, ...levels[normalizedScore] };
}

export function PasswordStrengthMeter({
  password,
  className,
}: PasswordStrengthMeterProps) {
  const strength = useMemo(() => getPasswordStrength(password), [password]);

  if (!password) return null;

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={cn(
              "h-1 flex-1 rounded-full transition-all duration-500",
              index < strength.score ? strength.color : "bg-muted"
            )}
          />
        ))}
      </div>
      <p
        className={cn(
          "text-xs font-medium transition-colors duration-300",
          strength.score <= 1
            ? "text-red-500"
            : strength.score <= 2
              ? "text-yellow-600 dark:text-yellow-500"
              : "text-emerald-600 dark:text-emerald-500"
        )}
      >
        {strength.label}
      </p>
    </div>
  );
}
