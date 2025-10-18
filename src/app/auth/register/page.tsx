import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export const metadata: Metadata = {
  title: "Register | KPI Tracking",
  description: "Create a new account",
};

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/50">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,var(--primary)_0,transparent_100%)] opacity-10" />

      {/* Content */}
      <div className="relative container mx-auto flex w-full max-w-[480px] flex-col items-center justify-center p-4">
        <div className="w-full rounded-xl border bg-card p-8 shadow-lg">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight">
              Create an account
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Join us to start tracking your KPIs
            </p>
          </div>
          <RegisterForm />
          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link
              href="/auth/login"
              className="font-medium text-primary hover:text-primary/90"
            >
              Already have an account? Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
