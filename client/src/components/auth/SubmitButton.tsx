"use client";

import { Button } from "@/components/ui/button";
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
  variant = "default",
}: SubmitButtonProps) {
  return (
    <Button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      variant={variant}
      className={cn(
        "w-full h-11 text-sm font-semibold transition-all duration-300",
        variant === "default" &&
          "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30",
        className
      )}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
