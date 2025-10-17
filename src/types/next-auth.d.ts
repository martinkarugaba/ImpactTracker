import type { DefaultSession } from "next-auth";
import type { LocationData } from "@/features/locations/actions/location-data";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      clusterId?: string;
      clusterName?: string;
      locationData?: LocationData;
      accessToken?: string;
    } & DefaultSession["user"];
    accessToken?: string;
  }

  interface User {
    id: string;
    role: string;
    clusterId?: string;
    clusterName?: string;
    locationData?: LocationData;
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    clusterId?: string;
    clusterName?: string;
    locationData?: LocationData;
    accessToken?: string;
  }
}
