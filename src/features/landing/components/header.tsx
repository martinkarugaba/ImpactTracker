"use client";

import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/features/themes/components/mode-toggle";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Brand } from "./brand";
import { MainNavigationMenu } from "./navigation-menu";
import { UserMenu } from "./user-menu";
import { AuthButtons } from "./auth-buttons";

export function Header() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  return (
    <header className="bg-background/95 sticky top-0 z-50 w-full border-b backdrop-blur">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Brand />
            <MainNavigationMenu />
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
            {!isLoading && !session && <AuthButtons />}
            {session && (
              <>
                <Button
                  variant="outline"
                  asChild
                  className="hidden sm:inline-flex"
                >
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <UserMenu session={session} />
              </>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
}
