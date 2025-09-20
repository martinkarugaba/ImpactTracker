"use client";

import Link from "next/link";

export function Brand() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-primary-foreground h-5 w-5"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <span className="text-xl font-bold">Impact Tracker</span>
    </Link>
  );
}
