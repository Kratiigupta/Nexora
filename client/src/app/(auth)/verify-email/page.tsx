"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Mail, ArrowLeft, RefreshCw } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { authService } from "@/lib/services/auth.service";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [cooldown, setCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResend = async () => {
    if (!email || cooldown > 0) return;

    try {
      setIsResending(true);
      await authService.resendVerificationEmail(email);
      setCooldown(60); // 60 second cooldown
      toast.success("Verification email resent!", {
        description: "Check your inbox for the new link.",
      });
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error("Failed to resend email", {
        description: err?.message || "Please try again later.",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthCard
      title="Verify your email"
      description={email ? `We've sent a confirmation link to ${email}` : "Check your email for the confirmation link"}
    >
      <div className="flex flex-col items-center py-4 space-y-6">
        {/* Animated mail icon */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
          <div className="relative h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center animate-bounce-gentle">
            <Mail className="h-12 w-12 text-primary" />
          </div>
        </div>

        <div className="text-center space-y-2 max-w-sm">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Click the link in your email to verify your account and get started.
            If you don&apos;t see it, check your spam folder.
          </p>
        </div>

        {email && (
          <SubmitButton
            type="button"
            variant="outline"
            onClick={handleResend}
            isLoading={isResending}
            loadingText="Sending..."
            disabled={cooldown > 0}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {cooldown > 0
              ? `Resend in ${cooldown}s`
              : "Resend verification email"}
          </SubmitButton>
        )}

        <Link
          href="/login"
          className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    </AuthCard>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-[360px] rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl animate-pulse flex flex-col items-center justify-center p-8 gap-4">
          <div className="h-12 w-12 bg-primary/10 rounded-full animate-pulse" />
          <div className="h-6 w-48 bg-muted/50 rounded animate-pulse" />
          <div className="h-4 w-64 bg-muted/30 rounded animate-pulse" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
