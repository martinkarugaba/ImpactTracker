import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import type { User } from "next-auth";
import { db } from "@/lib/db";
import {
  users,
  clusters,
  clusterUsers,
  organizationMembers,
  organizations,
  clusterMembers,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import {
  getOrganizationLocationData,
  type LocationData,
} from "@/features/locations/actions/location-data";

// Helper function to get user's cluster information
async function getUserClusterInfo(userId: string) {
  try {
    // Super admins can access any cluster - for now, let's get the first available cluster
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) return null;

    if (user.role === "super_admin") {
      const firstCluster = await db.query.clusters.findFirst({
        columns: { id: true, name: true },
      });
      return firstCluster
        ? { id: firstCluster.id, name: firstCluster.name }
        : null;
    }

    // Check if user is directly assigned to any cluster via clusterUsers table
    const userCluster = await db.query.clusterUsers.findFirst({
      where: eq(clusterUsers.user_id, userId),
      columns: { cluster_id: true },
    });

    if (userCluster?.cluster_id) {
      const cluster = await db.query.clusters.findFirst({
        where: eq(clusters.id, userCluster.cluster_id),
        columns: { id: true, name: true },
      });
      return cluster ? { id: cluster.id, name: cluster.name } : null;
    }

    // For users not directly assigned to a cluster, get cluster through organization membership
    const [member] = await db
      .select({ organization_id: organizationMembers.organization_id })
      .from(organizationMembers)
      .where(eq(organizationMembers.user_id, userId));

    if (member?.organization_id) {
      // Get the cluster ID for that organization
      const [org] = await db
        .select({ cluster_id: organizations.cluster_id })
        .from(organizations)
        .where(eq(organizations.id, member.organization_id));

      if (org?.cluster_id) {
        const cluster = await db.query.clusters.findFirst({
          where: eq(clusters.id, org.cluster_id),
          columns: { id: true, name: true },
        });
        return cluster ? { id: cluster.id, name: cluster.name } : null;
      }

      // Fallback: resolve cluster via clusterMembers mapping
      const orgCluster = await db.query.clusterMembers.findFirst({
        where: eq(clusterMembers.organization_id, member.organization_id),
        columns: { cluster_id: true },
      });

      if (orgCluster?.cluster_id) {
        const cluster = await db.query.clusters.findFirst({
          where: eq(clusters.id, orgCluster.cluster_id),
          columns: { id: true, name: true },
        });
        return cluster ? { id: cluster.id, name: cluster.name } : null;
      }
    }

    return null;
  } catch (error) {
    console.error("Error getting cluster info:", error);
    return null;
  }
}

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

      // Always use token data for session - this is more reliable than querying the database
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      session.accessToken = token.accessToken as string;

      // Add cluster information to session if available
      if (token.clusterId) {
        session.user.clusterId = token.clusterId as string;
        session.user.clusterName = token.clusterName as string;
      }

      // Add location data to session if available
      if (
        token.locationData &&
        typeof token.locationData === "object" &&
        token.locationData !== null
      ) {
        session.user.locationData = token.locationData as LocationData;
      }

      // Note: We rely on JWT token data instead of querying the database in the session callback
      // This avoids Edge Runtime compatibility issues with the database client
      // The user's role and other data is already stored in the JWT token during login
      // If you need to sync with database, consider doing it in the application layer instead

      return session;
    },
    async jwt({ token, user }) {
      if (user && "id" in user && "role" in user) {
        token.id = user.id;
        token.role = user.role;
        token.accessToken = user.accessToken;
        // Include cluster information in JWT token
        if ("clusterId" in user && user.clusterId) {
          token.clusterId = user.clusterId;
          token.clusterName = user.clusterName;
        }
        // Include location data in JWT token
        if ("locationData" in user && user.locationData) {
          token.locationData = user.locationData;
        }
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

          // Get cluster information
          const clusterInfo = await getUserClusterInfo(user.id);
          console.log("Cluster info for user:", clusterInfo);

          // Get organization ID for location data
          let organizationId = null;
          try {
            const [member] = await db
              .select({ organization_id: organizationMembers.organization_id })
              .from(organizationMembers)
              .where(eq(organizationMembers.user_id, user.id));
            organizationId = member?.organization_id || null;
          } catch (error) {
            console.error("Error fetching organization ID:", error);
          }

          // Get location data for the user's organization/cluster
          let locationData = undefined;
          if (organizationId) {
            try {
              locationData = await getOrganizationLocationData(organizationId);
              console.log("Location data loaded for user:", !!locationData);
            } catch (error) {
              console.error("Error fetching location data:", error);
            }
          } else if (clusterInfo?.id) {
            try {
              // Fallback to cluster location data if no organization
              const { getClusterLocationData } = await import(
                "@/features/locations/actions/location-data"
              );
              locationData = await getClusterLocationData(clusterInfo.id);
              console.log(
                "Cluster location data loaded for user:",
                !!locationData
              );
            } catch (error) {
              console.error("Error fetching cluster location data:", error);
            }
          }

          // Return user without password
          const result = {
            id: user.id,
            name: user.name || "",
            email: user.email,
            role: user.role,
            accessToken: `token_${user.id}`,
            clusterId: clusterInfo?.id || undefined,
            clusterName: clusterInfo?.name || undefined,
            locationData: locationData || undefined,
          };

          console.log("Returning user object:", {
            id: result.id,
            email: result.email,
            role: result.role,
            clusterId: result.clusterId,
            clusterName: result.clusterName,
            hasLocationData: !!result.locationData,
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
