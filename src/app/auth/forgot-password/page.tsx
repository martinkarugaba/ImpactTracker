import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password | KPI Tracking",
  description: "Reset your password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="from-background to-muted/50 relative flex min-h-screen items-center justify-center bg-gradient-to-br">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,var(--primary)_0,transparent_100%)] opacity-10" />

      {/* Content */}
      <div className="relative container mx-auto flex w-full max-w-[480px] flex-col items-center justify-center p-4">
        <div className="bg-card w-full rounded-xl border p-8 shadow-lg">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight">
              Forgot your password?
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Enter your email address and we&apos;ll send you instructions to
              reset your password.
            </p>
          </div>
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
