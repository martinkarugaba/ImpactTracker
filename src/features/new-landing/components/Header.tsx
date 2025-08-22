"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { AuthButtons } from "@/features/landing/components/auth-buttons";
import { UserMenu } from "@/features/landing/components/user-menu";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="flex w-full items-center justify-center border-2 border-b border-solid border-b-[#e7eef3] px-4 py-3 sm:px-6 md:px-8 lg:px-10">
      <section className="flex w-full max-w-7xl justify-between border-red-500">
        <div className="flex items-center gap-2 text-[#0e151b] sm:gap-4">
          <div className="size-4">
            <svg
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z"
                fill="currentColor"
              ></path>
            </svg>
          </div>
          <h2 className="text-base leading-tight font-bold tracking-[-0.015em] text-[#0e151b] sm:text-lg">
            ImpactTrack
          </h2>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden flex-1 justify-end gap-6 md:flex lg:gap-8">
          <div className="flex items-center gap-6 lg:gap-9">
            <a
              className="text-sm leading-normal font-medium text-[#0e151b] transition-colors hover:text-[#1991e6]"
              href="#features"
            >
              Features
            </a>
            <a
              className="text-sm leading-normal font-medium text-[#0e151b] transition-colors hover:text-[#1991e6]"
              href="#pricing"
            >
              Pricing
            </a>
            <a
              className="text-sm leading-normal font-medium text-[#0e151b] transition-colors hover:text-[#1991e6]"
              href="#about"
            >
              About
            </a>
            <a
              className="text-sm leading-normal font-medium text-[#0e151b] transition-colors hover:text-[#1991e6]"
              href="#contact"
            >
              Contact
            </a>
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm leading-normal font-semibold text-[#0e151b] transition-colors hover:text-[#1991e6]"
                >
                  Dashboard
                </Link>
                <UserMenu session={session} />
              </>
            ) : (
              <AuthButtons />
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#e7eef3] transition-colors hover:bg-[#f8fafc] md:hidden">
          <svg
            className="size-5 text-[#0e151b]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </section>
    </header>
  );
}
