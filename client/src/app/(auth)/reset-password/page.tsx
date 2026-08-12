"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Lock, CheckCircle2 } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { FormField } from "@/components/auth/FormField";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/lib/validations/auth.schemas";
import { authService } from "@/lib/services/auth.service";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const password = useWatch({
    control,
    name: "password",
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    try {
      await authService.resetPassword(data.password);
      setIsSuccess(true);
      toast.success("Password updated!", {
        description: "Your password has been reset successfully.",
      });
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error("Failed to reset password", {
        description:
          err?.message ||
          "The reset link may have expired. Please request a new one.",
      });
    }
  };

  if (isSuccess) {
    return (
      <AuthCard
        title="Password reset complete"
        description="Your password has been updated successfully"
      >
        <div className="flex flex-col items-center py-4 space-y-6">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
            <div className="relative h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>
          </div>

          <SubmitButton
            type="button"
            onClick={() => router.push("/login")}
          >
            Sign in with new password
          </SubmitButton>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reset your password"
      description="Choose a new password for your account"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" suppressHydrationWarning>
        <FormField
          id="reset-password"
          label="New Password"
          type="password"
          placeholder="Enter your new password"
          icon={Lock}
          registration={register("password")}
          error={errors.password?.message}
          disabled={isSubmitting}
          autoComplete="new-password"
        />

        {password && <PasswordStrengthMeter password={password} />}

        <FormField
          id="reset-confirm-password"
          label="Confirm New Password"
          type="password"
          placeholder="Confirm your new password"
          icon={Lock}
          registration={register("confirmPassword")}
          error={errors.confirmPassword?.message}
          disabled={isSubmitting}
          autoComplete="new-password"
        />

        <SubmitButton isLoading={isSubmitting} loadingText="Resetting password...">
          Reset password
        </SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link
          href="/login"
          className="font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          Back to sign in
        </Link>
      </p>
    </AuthCard>
  );
}
