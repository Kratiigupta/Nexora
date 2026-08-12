"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, Lock, User, Building2, GraduationCap, School } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { FormField } from "@/components/auth/FormField";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { SocialDivider } from "@/components/auth/SocialDivider";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { registerSchema, type RegisterFormValues } from "@/lib/validations/auth.schemas";
import { authService } from "@/lib/services/auth.service";

export default function RegisterPage() {
  const router = useRouter();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      department: "",
      year: undefined,
      college: "",
    },
  });

  const password = useWatch({
    control,
    name: "password",
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await authService.signUp({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        department: data.department,
        year: data.year,
        college: data.college || undefined,
      });

      toast.success("Account created!", {
        description: "Please check your email to verify your account.",
      });

      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (error: unknown) {
      const err = error as { message?: string };
      const message =
        err?.message?.includes("already registered")
          ? "This email is already registered. Please sign in instead."
          : err?.message || "Failed to create account. Please try again.";
      toast.error("Registration failed", { description: message });
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setIsGoogleLoading(true);
      await authService.signInWithGoogle();
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error("Google sign up failed", {
        description: err?.message || "Something went wrong.",
      });
      setIsGoogleLoading(false);
    }
  };

  return (
    <AuthCard
      title="Create your account"
      description="Join Nexora and start collaborating with fellow students"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" suppressHydrationWarning>
        <FormField
          id="register-fullname"
          label="Full Name"
          placeholder="John Doe"
          icon={User}
          registration={register("fullName")}
          error={errors.fullName?.message}
          disabled={isSubmitting}
          autoComplete="name"
        />

        <FormField
          id="register-email"
          label="Email"
          type="email"
          placeholder="you@university.edu"
          icon={Mail}
          registration={register("email")}
          error={errors.email?.message}
          disabled={isSubmitting}
          autoComplete="email"
        />

        <div className="grid grid-cols-2 gap-3">
          <FormField
            id="register-department"
            label="Department"
            placeholder="Computer Science"
            icon={Building2}
            registration={register("department")}
            error={errors.department?.message}
            disabled={isSubmitting}
          />

          <FormField
            id="register-year"
            label="Year"
            type="number"
            placeholder="1–6"
            icon={GraduationCap}
            registration={register("year", { valueAsNumber: true })}
            error={errors.year?.message}
            disabled={isSubmitting}
          />
        </div>

        <FormField
          id="register-college"
          label="College"
          placeholder="Your college/university (optional)"
          icon={School}
          registration={register("college")}
          error={errors.college?.message}
          disabled={isSubmitting}
        />

        <FormField
          id="register-password"
          label="Password"
          type="password"
          placeholder="Create a strong password"
          icon={Lock}
          registration={register("password")}
          error={errors.password?.message}
          disabled={isSubmitting}
          autoComplete="new-password"
        />

        {password && <PasswordStrengthMeter password={password} />}

        <FormField
          id="register-confirm-password"
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          icon={Lock}
          registration={register("confirmPassword")}
          error={errors.confirmPassword?.message}
          disabled={isSubmitting}
          autoComplete="new-password"
        />

        <SubmitButton isLoading={isSubmitting} loadingText="Creating account...">
          Create account
        </SubmitButton>
      </form>

      <div className="mt-6">
        <SocialDivider
          onGoogleClick={handleGoogleSignup}
          isLoading={isGoogleLoading}
        />
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
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
