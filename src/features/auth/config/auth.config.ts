import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import type { User } from "next-auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ account }) {
      // Allow all sign-ins for credentials provider
      if (account?.provider === "credentials") {
        return true;
      }
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

      try {
        // Check if user exists in database - wrap in try/catch to handle Edge runtime failures gracefully
        try {
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
            dbError
          );
        }
      } catch (error) {
        console.error("Error in session callback:", error);
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

        try {
          // Find user by email
          const user = await db.query.users.findFirst({
            where: eq(users.email, email),
          });

          if (!user || !user.password) {
            console.error(
              "User not found or no password set for email:",
              email
            );
            return null;
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(password, user.password);

          if (!isValidPassword) {
            console.error("Invalid password for user:", email);
            return null;
          }

          // Return user without password
          return {
            id: user.id,
            name: user.name || "",
            email: user.email,
            role: user.role,
            accessToken: `token_${user.id}`,
          };
        } catch (error) {
          console.error("Database error during authentication:", error);
          return null;
        }
      },
    }),
  ],
};
