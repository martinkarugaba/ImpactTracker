import { auth } from "@/features/auth/auth";
import { redirect } from "next/navigation";
import { hasAnyRole, hasAllRoles, AuthConfig } from "@/lib/auth";
import { userRole } from "@/lib/db/schema";

type Role = (typeof userRole.enumValues)[number];

export async function requireAuth(config?: AuthConfig) {
  const session = await auth();

  if (!session?.user) {
    redirect("/?auth=required");
  }

  if (config?.roles) {
    const hasAccess = config.requireAllRoles
      ? hasAllRoles(session.user.role as Role, config.roles)
      : hasAnyRole(session.user.role as Role, config.roles);

    if (!hasAccess) {
      redirect("/unauthorized");
    }
  }

  return session;
}

export async function requireRole(role: Role) {
  const session = await auth();

  if (!session?.user) {
    redirect("/?auth=required");
  }

  if (session.user.role !== role) {
    redirect("/unauthorized");
  }

  return session;
}

export async function requireAnyRole(roles: Role[]) {
  const session = await auth();

  if (!session?.user) {
    redirect("/?auth=required");
  }

  if (!hasAnyRole(session.user.role as Role, roles)) {
    redirect("/unauthorized");
  }

  return session;
}

export async function requireAllRoles(roles: Role[]) {
  const session = await auth();

  if (!session?.user) {
    redirect("/?auth=required");
  }

  if (!hasAllRoles(session.user.role as Role, roles)) {
    redirect("/unauthorized");
  }

  return session;
}
