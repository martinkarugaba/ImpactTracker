import { atom } from "jotai";
import type { Session } from "next-auth";

// Extended Cluster type to include additional fields
interface Cluster {
  id: string;
  name: string;
  members?: Array<{ id: string; name: string; role: string }>;
  permissions?: Array<string>;
}

// Atom to store the user's cluster data globally
export const clusterAtom = atom<Cluster | null>(null);

// Helper function to initialize cluster atom from session
export function initializeClusterFromSession(session: Session | null) {
  if (session?.user?.clusterId && session?.user?.clusterName) {
    return {
      id: session.user.clusterId,
      name: session.user.clusterName,
      members: [], // Can be populated later if needed
      permissions: [], // Can be populated later if needed
    };
  }
  return null;
}
