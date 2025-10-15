import { atom } from "jotai";

// Extended Cluster type to include additional fields
interface Cluster {
  id: string;
  name: string;
  members?: Array<{ id: string; name: string; role: string }>;
  permissions?: Array<string>;
}

// Atom to store the user's cluster data globally
export const clusterAtom = atom<Cluster | null>(null);
