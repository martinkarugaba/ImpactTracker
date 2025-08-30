import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/features/auth/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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

    try {
      // Check if user exists in database
      const user = await db.query.users.findFirst({
        where: eq(users.id, session.user.id),
      });

      // If user doesn't exist, redirect to sign out
      if (!user) {
        console.log(
          `User ${session.user.id} not found in database, signing out`
        );

        // Create a response that redirects to the home page
        const response = NextResponse.redirect(
          new URL("/?auth=required", request.url)
        );

        // Set a cookie to indicate the user was logged out due to not existing in the database
        response.cookies.set("auth-error", "User account no longer exists", {
          maxAge: 60, // 1 minute
          path: "/",
        });

        return response;
      }
    } catch (dbError) {
      console.error("Database connection error in middleware:", dbError);
      // On database error, we'll let the user proceed but log the issue
      // You could choose to redirect users to an error page instead
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
