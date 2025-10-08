import type { userRole } from "./db/schema";

type Role = (typeof userRole.enumValues)[number];

// Define the role hierarchy
const roleHierarchy: Record<Role, Role[]> = {
  super_admin: [
    "super_admin",
    "cluster_manager",
    "organization_admin",
    "organization_member",
    "user",
  ],
  cluster_manager: [
    "cluster_manager",
    "organization_admin",
    "organization_member",
    "user",
  ],
  organization_admin: ["organization_admin", "organization_member", "user"],
  organization_member: ["organization_member", "user"],
  user: ["user"],
};

// Check if a user has a specific role
export function hasRole(userRole: Role, requiredRole: Role): boolean {
  return roleHierarchy[userRole].includes(requiredRole);
}

// Check if a user has any of the required roles
export function hasAnyRole(userRole: Role, requiredRoles: Role[]): boolean {
  return requiredRoles.some(role => hasRole(userRole, role));
}

// Check if a user has all of the required roles
export function hasAllRoles(userRole: Role, requiredRoles: Role[]): boolean {
  return requiredRoles.every(role => hasRole(userRole, role));
}

// Get the minimum required role for an action
export function getMinimumRequiredRole(requiredRole: Role): Role[] {
  return roleHierarchy[requiredRole];
}

// Authorization middleware type
export interface AuthConfig {
  roles?: Role[];
  requireAllRoles?: boolean;
  redirectTo?: string;
}
