"use client";

import Link from "next/link";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const searchParams = useSearchParams();
  const errorMessages = {
    session_expired: "Your session has expired. Please log in again.",
    database_error: "A database error occurred. Please try logging in again.",
    auth_error: "Authentication failed. Please try again.",
  };

  const errorParam = searchParams.get("error");
  const errorMessage =
    errorParam && errorParam in errorMessages
      ? errorMessages[errorParam as keyof typeof errorMessages]
      : errorParam
        ? "An error occurred. Please try logging in again."
        : null;

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/50">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,var(--primary)_0,transparent_100%)] opacity-10" />

      {/* Content */}
      <div className="relative container mx-auto flex w-full max-w-[480px] flex-col items-center justify-center p-4">
        <div className="w-full rounded-xl border bg-card p-8 shadow-lg">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <LoginForm />
          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link
              href="/auth/register"
              className="font-medium text-primary hover:text-primary/90"
            >
              Don&apos;t have an account? Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
