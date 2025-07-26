import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Users } from "lucide-react";
import Link from "next/link";
import { VSLA } from "../../types";

interface VSLADetailsHeaderProps {
  vsla: VSLA;
}

export function VSLADetailsHeader({ vsla }: VSLADetailsHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{vsla.name}</h1>
          <div className="text-muted-foreground flex items-center gap-2">
            <span>{vsla.code}</span>
            {vsla.village && (
              <>
                <span>•</span>
                <span>
                  {vsla.village}, {vsla.district}
                </span>
              </>
            )}
            <span>•</span>
            <Badge
              variant={
                vsla.status === "active"
                  ? "default"
                  : vsla.status === "inactive"
                    ? "secondary"
                    : "destructive"
              }
              className="capitalize"
            >
              {vsla.status}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/vslas/${vsla.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit VSLA
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/vslas/${vsla.id}/members`}>
              <Users className="mr-2 h-4 w-4" />
              Manage Members
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
