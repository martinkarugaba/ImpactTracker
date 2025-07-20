"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Activity } from "../../types/types";
import { ACTIVITY_STATUSES } from "../../types/types";

interface ActivityReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity: Activity;
  onSave: (reportData: {
    status: string;
    outcomes: string;
    challenges: string;
    recommendations: string;
    actualCost?: number;
    numberOfParticipants?: number;
  }) => void;
}

export function ActivityReportDialog({
  open,
  onOpenChange,
  activity,
  onSave,
}: ActivityReportDialogProps) {
  const [formData, setFormData] = useState({
    status: activity.status || "completed",
    outcomes: activity.outcomes || "",
    challenges: activity.challenges || "",
    recommendations: activity.recommendations || "",
    actualCost: activity.actualCost || undefined,
    numberOfParticipants: activity.numberOfParticipants || undefined,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave(formData);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save activity report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Activity Report</DialogTitle>
          <DialogDescription>
            Document the outcomes, challenges, and recommendations for "
            {activity.title}".
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="status">Activity Status</Label>
              <Select
                value={formData.status}
                onValueChange={value => handleInputChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_STATUSES.map(status => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="participants">Number of Participants</Label>
              <Input
                id="participants"
                type="number"
                placeholder="0"
                value={formData.numberOfParticipants || ""}
                onChange={e =>
                  handleInputChange(
                    "numberOfParticipants",
                    e.target.value ? parseInt(e.target.value) : 0
                  )
                }
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="actual-cost">Actual Cost (USD)</Label>
            <Input
              id="actual-cost"
              type="number"
              placeholder="0.00"
              value={formData.actualCost || ""}
              onChange={e =>
                handleInputChange(
                  "actualCost",
                  e.target.value ? parseFloat(e.target.value) : 0
                )
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="outcomes">Outcomes</Label>
            <Textarea
              id="outcomes"
              placeholder="Describe the key outcomes and achievements..."
              value={formData.outcomes}
              onChange={e => handleInputChange("outcomes", e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="challenges">Challenges</Label>
            <Textarea
              id="challenges"
              placeholder="Describe any challenges or issues encountered..."
              value={formData.challenges}
              onChange={e => handleInputChange("challenges", e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="recommendations">Recommendations</Label>
            <Textarea
              id="recommendations"
              placeholder="Provide recommendations for future activities..."
              value={formData.recommendations}
              onChange={e =>
                handleInputChange("recommendations", e.target.value)
              }
              className="min-h-[100px] resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
