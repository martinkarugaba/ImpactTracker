import type { DefaultSession, DefaultUser } from "next-auth";
import type { LocationData } from "@/features/locations/actions/location-data";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    role: string;
    accessToken?: string;
    clusterId?: string | null;
    clusterName?: string | null;
    locationData?: LocationData | null;
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      role: string;
      clusterId?: string | null;
      clusterName?: string | null;
      locationData?: LocationData | null;
    } & DefaultSession["user"];
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    accessToken?: string;
    clusterId?: string | null;
    clusterName?: string | null;
    locationData?: LocationData | null;
  }
}

declare module "@auth/core/adapters" {
  interface AdapterUser extends DefaultUser {
    id: string;
    role: string;
  }
}
