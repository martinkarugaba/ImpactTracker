import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import type { VSLA } from "../../types";

interface VSLALocationDetailsProps {
  vsla: VSLA;
}

export function VSLALocationDetails({ vsla }: VSLALocationDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Location Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-muted-foreground" />
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Country</span>
              <span className="text-sm font-medium">{vsla.country}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">District</span>
              <span className="text-sm font-medium">{vsla.district}</span>
            </div>
            {vsla.sub_county && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Sub-county
                </span>
                <span className="text-sm font-medium">{vsla.sub_county}</span>
              </div>
            )}
            {vsla.parish && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Parish</span>
                <span className="text-sm font-medium">{vsla.parish}</span>
              </div>
            )}
            {vsla.village && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Village</span>
                <span className="text-sm font-medium">{vsla.village}</span>
              </div>
            )}
            {vsla.address && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Address</span>
                <span className="text-sm font-medium">{vsla.address}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
