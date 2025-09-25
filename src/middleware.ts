import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/features/auth/auth";

export async function middleware(request: NextRequest) {
  // Only run on dashboard routes
  if (!request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  try {
    const session = await auth();

    // If no session, let the auth system handle it
    if (!session?.user) {
      return NextResponse.next();
    }

    // Handle role-based redirects for dashboard root
    if (request.nextUrl.pathname === "/dashboard" && session.user.role) {
      if (session.user.role === "super_admin") {
        // Super admin stays on main dashboard
        return NextResponse.next();
      } else {
        // Regular users get redirected to user-overview
        return NextResponse.redirect(
          new URL("/dashboard/user-overview", request.url)
        );
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Error in middleware:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
