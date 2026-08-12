"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * SubmitButton — loading-state aware form submit button.
 * Features spinner animation, disabled state, and gradient styling.
 */
interface SubmitButtonProps {
  children: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  className?: string;
  type?: "submit" | "button";
  onClick?: () => void;
  variant?: "default" | "outline" | "secondary" | "ghost";
}

export function SubmitButton({
  children,
  isLoading = false,
  loadingText = "Please wait...",
  disabled = false,
  className,
  type = "submit",
  onClick,
}: SubmitButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={cn(
        "relative w-full h-11 flex items-center justify-center font-medium rounded-lg text-sm transition-all duration-200 overflow-hidden",
        "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md hover:-translate-y-0.5",
        "disabled:pointer-events-none disabled:opacity-50 disabled:translate-y-0",
        className
      )}
    >
      {/* Subtle shine effect */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer pointer-events-none" />

      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}
