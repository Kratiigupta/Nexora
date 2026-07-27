"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Mail, Lock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/components/auth/AuthCard";
import { FormField } from "@/components/auth/FormField";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { SocialDivider } from "@/components/auth/SocialDivider";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth.schemas";
import { authService } from "@/lib/services/auth.service";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await authService.signIn({
        email: data.email,
        password: data.password,
      });
      toast.success("Welcome back!", { description: "You've been signed in successfully." });
      router.push(redirectTo);
      router.refresh();
    } catch (error: unknown) {
      const err = error as { message?: string };
      const message =
        err?.message === "Invalid login credentials"
          ? "Invalid email or password. Please try again."
          : err?.message || "Failed to sign in. Please try again.";
      toast.error("Sign in failed", { description: message });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      await authService.signInWithGoogle();
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error("Google sign in failed", {
        description: err?.message || "Something went wrong.",
      });
      setIsGoogleLoading(false);
    }
  };

  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to your account to continue"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          id="login-email"
          label="Email"
          type="email"
          placeholder="you@university.edu"
          icon={Mail}
          registration={register("email")}
          error={errors.email?.message}
          disabled={isSubmitting}
          autoComplete="email"
        />

        <FormField
          id="login-password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          icon={Lock}
          registration={register("password")}
          error={errors.password?.message}
          disabled={isSubmitting}
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember-me"
              {...register("rememberMe")}
              className="h-4 w-4 rounded border-input accent-primary cursor-pointer"
            />
            <Label
              htmlFor="remember-me"
              className="text-sm text-muted-foreground cursor-pointer"
            >
              Remember me
            </Label>
          </div>

          <Link
            href="/forgot-password"
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <SubmitButton isLoading={isSubmitting} loadingText="Signing in...">
          Sign in
        </SubmitButton>
      </form>

      <div className="mt-6">
        <SocialDivider
          onGoogleClick={handleGoogleLogin}
          isLoading={isGoogleLoading}
        />
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          Create one
        </Link>
      </p>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-[480px] rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl animate-pulse flex flex-col items-center justify-center p-8 gap-4">
          <div className="h-8 w-48 bg-primary/10 rounded-lg animate-pulse" />
          <div className="h-4 w-64 bg-muted/50 rounded animate-pulse" />
          <div className="w-full h-11 bg-muted/30 rounded-lg mt-6 animate-pulse" />
          <div className="w-full h-11 bg-muted/30 rounded-lg mt-2 animate-pulse" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
