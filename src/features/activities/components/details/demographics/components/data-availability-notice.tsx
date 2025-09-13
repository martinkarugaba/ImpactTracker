import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";

export function DataAvailabilityNotice() {
  return (
    <Card
      className="border-muted-foreground/20 bg-muted/50 border-l-4"
      style={{ borderLeftColor: "oklch(var(--primary))" }}
    >
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <Info
            className="mt-0.5 h-5 w-5"
            style={{ color: "oklch(var(--primary))" }}
          />
          <div className="space-y-2">
            <p className="text-sm font-medium">Demographics Data Status</p>
            <p className="text-muted-foreground text-sm">
              This tab shows participant demographics with mock data
              calculations. Demographic fields (age, gender, disability status,
              employment details) are not yet available in the current
              participant data structure and will need to be added to the
              database schema.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
