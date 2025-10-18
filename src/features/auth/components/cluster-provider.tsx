"use client";

import { useSession } from "next-auth/react";
import { useAtom } from "jotai";
import { useEffect } from "react";
import {
  clusterAtom,
  initializeClusterFromSession,
} from "../atoms/cluster-atom";

export function ClusterProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [, setCluster] = useAtom(clusterAtom);

  useEffect(() => {
    if (status === "authenticated" && session) {
      const clusterData = initializeClusterFromSession(session);
      setCluster(clusterData);
    } else if (status === "unauthenticated") {
      setCluster(null);
    }
  }, [session, status, setCluster]);

  return <>{children}</>;
}
