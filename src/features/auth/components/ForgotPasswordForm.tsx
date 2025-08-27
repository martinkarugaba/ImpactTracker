"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import { requestPasswordReset } from "../actions/auth";

const ForgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type FormValues = z.infer<typeof ForgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);

    try {
      const result = await requestPasswordReset(values.email);

      if (result.success) {
        setIsSubmitted(true);
        toast.success("Password reset instructions sent to your email.");
      } else {
        // If email sending failed but we have a token, show it directly
        if (result.token) {
          setIsSubmitted(true);
          setResetToken(result.token);
          toast.success(
            "Email sending failed. Please use the link below to reset your password."
          );
        } else {
          toast.error(
            result.error ||
              "Failed to request password reset. Please try again."
          );
        }
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const [resetToken, setResetToken] = useState<string | null>(null);

  if (isSubmitted) {
    return (
      <div className="grid w-full max-w-md gap-6">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-semibold">Check your email</h2>
          <p className="text-muted-foreground mb-4">
            We&apos;ve sent password reset instructions to your email address.
          </p>

          {resetToken && (
            <div className="bg-muted mb-4 rounded-md p-4">
              <p className="mb-2 text-sm">
                If you didn&apos;t receive the email, use this link:
              </p>
              <a
                href={`/auth/reset-password/${resetToken}`}
                className="text-primary text-sm break-all hover:underline"
              >
                Reset Password
              </a>
            </div>
          )}

          <Button
            variant="outline"
            onClick={() => router.push("/?auth=login")}
            className="w-full"
          >
            Return to login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid w-full max-w-md gap-6">
      {/* <div className="text-center mb-2">
        <h2 className="text-xl font-semibold">Forgot your password?</h2>
        <p className="text-muted-foreground mt-1">
          Enter your email address and we'll send you instructions to reset your
          password.
        </p>
      </div> */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="name@example.com"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={isLoading}
                    className="h-12 px-4 text-base"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="h-12 cursor-pointer text-base"
          >
            {isLoading && (
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            Send Reset Instructions
          </Button>
          <div className="text-center">
            <Link
              href="/?auth=login"
              className="text-primary hover:text-primary/90 text-sm"
            >
              Back to login
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
}
