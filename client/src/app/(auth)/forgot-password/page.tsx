"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { toast } from "sonner";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { FormField } from "@/components/auth/FormField";
import { SubmitButton } from "@/components/auth/SubmitButton";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/lib/validations/auth.schemas";
import { authService } from "@/lib/services/auth.service";

export default function ForgotPasswordPage() {
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      await authService.forgotPassword(data.email);
      setSentEmail(data.email);
      setEmailSent(true);
      toast.success("Reset link sent!", {
        description: "Check your email for the password reset link.",
      });
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error("Failed to send reset link", {
        description: err?.message || "Please try again.",
      });
    }
  };

  if (emailSent) {
    return (
      <AuthCard
        title="Check your email"
        description={`We've sent a password reset link to ${sentEmail}`}
      >
        <div className="flex flex-col items-center py-4 space-y-6">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
            <div className="relative h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Click the link in your email to reset your password.
              If you don&apos;t see it, check your spam folder.
            </p>
          </div>

          <SubmitButton
            type="button"
            variant="outline"
            onClick={() => {
              setEmailSent(false);
              setSentEmail("");
            }}
          >
            Send another link
          </SubmitButton>

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

  return (
    <AuthCard
      title="Forgot your password?"
      description="Enter your email and we'll send you a reset link"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          id="forgot-email"
          label="Email"
          type="email"
          placeholder="you@university.edu"
          icon={Mail}
          registration={register("email")}
          error={errors.email?.message}
          disabled={isSubmitting}
          autoComplete="email"
        />

        <SubmitButton isLoading={isSubmitting} loadingText="Sending link...">
          Send reset link
        </SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
