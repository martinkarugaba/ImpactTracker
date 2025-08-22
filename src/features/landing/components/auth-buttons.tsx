"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export function AuthButtons() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setLoginOpen(true)}
        className="text-secondary-foreground hidden cursor-pointer shadow sm:inline-flex"
      >
        Log In
      </Button>
      <Button onClick={() => setRegisterOpen(true)}>Get Started</Button>

      {/* Login Modal */}
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Welcome back</DialogTitle>
            <DialogDescription>
              Sign in to your account to continue
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <LoginForm onSuccess={() => setLoginOpen(false)} />
            <p className="text-muted-foreground mt-6 text-center text-sm">
              <button
                onClick={() => {
                  setLoginOpen(false);
                  setRegisterOpen(true);
                }}
                className="text-primary hover:text-primary/90 font-medium underline-offset-4 hover:underline"
              >
                Don&apos;t have an account? Sign Up
              </button>
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Register Modal */}
      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent className="max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Create an account</DialogTitle>
            <DialogDescription>
              Join us to start tracking your KPIs
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <RegisterForm onSuccess={() => setRegisterOpen(false)} />
            <p className="text-muted-foreground mt-6 text-center text-sm">
              <button
                onClick={() => {
                  setRegisterOpen(false);
                  setLoginOpen(true);
                }}
                className="text-primary hover:text-primary/90 font-medium underline-offset-4 hover:underline"
              >
                Already have an account? Sign In
              </button>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
