import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import type { User } from "next-auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("=== SIGNIN CALLBACK ===");
      console.log("User:", user ? { id: user.id, email: user.email } : null);
      console.log(
        "Account:",
        account ? { provider: account.provider, type: account.type } : null
      );
      console.log("Profile:", profile ? "present" : "not present");

      // Allow all sign-ins for credentials provider
      if (account?.provider === "credentials") {
        console.log("Credentials provider sign-in approved");
        return true;
      }
      console.log("Other provider sign-in approved");
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      // Redirect to dashboard on successful login
      if (url.startsWith("/dashboard")) {
        return url;
      }
      return `${baseUrl}/dashboard`;
    },
    async session({ session, token }) {
      if (!token || !session.user) {
        return session;
      }

      session.user.id = token.id as string;
      session.user.role = token.role as string;
      session.accessToken = token.accessToken as string;

      // Validate that we have a valid user ID before proceeding
      if (!session.user.id || typeof session.user.id !== "string") {
        console.error("Invalid user ID in session:", session.user.id);
        return session;
      }

      // Only try database operations if we're not in Edge Runtime
      // Edge Runtime detection: check if process.versions exists (Node.js specific)
      // We need to safely check for Node.js APIs that don't exist in Edge Runtime
      let isNodeRuntime = false;
      try {
        isNodeRuntime =
          typeof process !== "undefined" &&
          typeof process.versions !== "undefined" &&
          typeof process.versions.node !== "undefined";
      } catch {
        // If accessing process.versions throws, we're in Edge Runtime
        isNodeRuntime = false;
      }

      if (isNodeRuntime) {
        try {
          // Validate ID format before querying
          if (!session.user.id || session.user.id.trim() === "") {
            console.error("Empty or invalid user ID, skipping database query");
            return session;
          }

          const user = await db.query.users.findFirst({
            where: eq(users.id, session.user.id),
          });

          // If user doesn't exist, return the session without modifications
          if (!user) {
            console.log(
              `User ${session.user.id} not found in database during session creation`
            );
            return session;
          }

          // Update session with latest user data
          session.user.role = user.role;
        } catch (dbError) {
          // Database connection error, log but proceed with session
          console.error(
            "Database connection error in session callback:",
            dbError instanceof Error ? dbError.message : dbError
          );
          // Don't throw, just return session with token data
        }
      } else {
        console.log("Skipping database check in Edge Runtime context");
      }

      return session;
    },
    async jwt({ token, user }) {
      if (user && "id" in user && "role" in user) {
        token.id = user.id;
        token.role = user.role;
        token.accessToken = user.accessToken;
      }
      return token;
    },
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<User | null> {
        console.log("=== AUTHORIZE FUNCTION CALLED ===");
        console.log("Credentials received:", {
          email: credentials?.email,
          passwordProvided: !!credentials?.password,
        });

        if (!credentials?.email || !credentials?.password) {
          console.error("Missing email or password in credentials");
          return null;
        }

        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (!parsedCredentials.success) {
          console.error("Invalid credentials format:", parsedCredentials.error);
          return null;
        }

        const { email, password } = parsedCredentials.data;
        console.log("Validated credentials for email:", email);

        try {
          console.log("Attempting database connection...");

          // Add retry logic for database connection issues
          let user = null;
          let retryCount = 0;
          const maxRetries = 3;

          while (retryCount < maxRetries && !user) {
            try {
              // Find user by email
              user = await db.query.users.findFirst({
                where: eq(users.email, email),
              });
              break; // Success, exit retry loop
            } catch (dbError) {
              retryCount++;
              console.log(
                `Database connection attempt ${retryCount} failed:`,
                dbError
              );

              if (retryCount >= maxRetries) {
                throw dbError; // Re-throw after max retries
              }

              // Wait 1 second before retry
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }

          console.log("Database query completed. User found:", !!user);

          if (!user || !user.password) {
            console.error(
              "User not found or no password set for email:",
              email
            );
            return null;
          }

          console.log("User found, verifying password...");

          // Verify password
          const isValidPassword = await bcrypt.compare(password, user.password);

          console.log("Password verification result:", isValidPassword);

          if (!isValidPassword) {
            console.error("Invalid password for user:", email);
            return null;
          }

          console.log("Authentication successful for user:", email);

          // Return user without password
          const result = {
            id: user.id,
            name: user.name || "",
            email: user.email,
            role: user.role,
            accessToken: `token_${user.id}`,
          };

          console.log("Returning user object:", {
            id: result.id,
            email: result.email,
            role: result.role,
          });

          return result;
        } catch (error) {
          console.error("Database error during authentication:", error);
          return null;
        }
      },
    }),
  ],
};
