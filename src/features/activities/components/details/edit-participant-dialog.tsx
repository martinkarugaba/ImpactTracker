"use client";

import React from "react";
import { useAtom } from "jotai";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  editParticipantLoadingAtom,
  editParticipantFormDataAtom,
} from "../../atoms/activities-atoms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Briefcase, Heart } from "lucide-react";
import type { ActivityParticipant } from "../../types/types";
import { toast } from "react-hot-toast";

// Extended participant type to handle potentially missing fields
interface ExtendedParticipant {
  id: string;
  firstName: string;
  lastName: string;
  contact: string;
  designation: string;
  organizationName?: string;
  sex?: string;
  age?: number;
  enterprise?: string;
  employmentStatus?: string;
  monthlyIncome?: number;
}

interface EditParticipantDialogProps {
  participant: ActivityParticipant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (participant: ActivityParticipant) => void;
}

export function EditParticipantDialog({
  participant,
  open,
  onOpenChange,
  onSave,
}: EditParticipantDialogProps) {
  const [isLoading, setIsLoading] = useAtom(editParticipantLoadingAtom);
  const [formData, setFormData] = useAtom(editParticipantFormDataAtom);

  // Reset form when participant changes
  React.useEffect(() => {
    if (participant) {
      setFormData({
        participantName: participant.participantName || "",
        participantContact: participant.participant?.contact || "",
        sex: (participant.participant as ExtendedParticipant)?.sex || "",
        age:
          (participant.participant as ExtendedParticipant)?.age?.toString() ||
          "",
        enterprise:
          (participant.participant as ExtendedParticipant)?.enterprise || "",
        employment:
          (participant.participant as ExtendedParticipant)?.employmentStatus ||
          "",
        incomeLevel:
          (
            participant.participant as ExtendedParticipant
          )?.monthlyIncome?.toString() || "",
        attendance_status: (participant.attendance_status || "pending") as
          | "attended"
          | "absent"
          | "pending",
        role: "participant" as const,
      });
    }
  }, [participant, setFormData]);

  const handleSave = async () => {
    if (!participant) return;

    setIsLoading(true);
    try {
      const updatedParticipant: ActivityParticipant = {
        ...participant,
        participantName: formData.participantName,
        attendance_status: formData.attendance_status as
          | "attended"
          | "absent"
          | "pending",
        role: formData.role,
        participant: {
          ...participant.participant,
          contact: formData.participantContact,
          sex: formData.sex,
          age: formData.age ? parseInt(formData.age) : undefined,
          enterprise: formData.enterprise,
          employmentStatus: formData.employment,
          monthlyIncome: formData.incomeLevel
            ? parseInt(formData.incomeLevel)
            : undefined,
        } as ExtendedParticipant,
      };

      // In a real app, you would make an API call here
      // For now, we'll just call the onSave callback
      onSave?.(updatedParticipant);

      toast.success("Participant updated successfully");
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating participant:", error);
      toast.error("Failed to update participant");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!participant) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto w-full border-2 border-red-50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Edit Participant
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-semibold">Basic Information</h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.participantName}
                  onChange={e =>
                    handleInputChange("participantName", e.target.value)
                  }
                  placeholder="Enter full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.participantContact}
                  onChange={e =>
                    handleInputChange("participantContact", e.target.value)
                  }
                  placeholder="e.g., 0700123456"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="sex">Sex</Label>
                <Select
                  value={formData.sex}
                  onValueChange={value => handleInputChange("sex", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sex" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={e => handleInputChange("age", e.target.value)}
                  placeholder="Enter age"
                  min="1"
                  max="120"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={value => handleInputChange("role", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="participant">Participant</SelectItem>
                    <SelectItem value="facilitator">Facilitator</SelectItem>
                    <SelectItem value="organizer">Organizer</SelectItem>
                    <SelectItem value="observer">Observer</SelectItem>
                    <SelectItem value="speaker">Speaker</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Economic Information */}
          <div className="space-y-4">
            <div className="mb-3 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-green-600" />
              <h3 className="text-sm font-semibold">Economic Information</h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="enterprise">Enterprise/Business</Label>
                <Input
                  id="enterprise"
                  value={formData.enterprise}
                  onChange={e =>
                    handleInputChange("enterprise", e.target.value)
                  }
                  placeholder="e.g., Agriculture, Trade, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employment">Employment Status</Label>
                <Select
                  value={formData.employment}
                  onValueChange={value =>
                    handleInputChange("employment", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="self_employed">Self Employed</SelectItem>
                    <SelectItem value="wage_employed">Wage Employed</SelectItem>
                    <SelectItem value="unemployed">Unemployed</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="income">Income Level</Label>
              <Select
                value={formData.incomeLevel}
                onValueChange={value => handleInputChange("incomeLevel", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select income level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    Low Income (&lt; 200,000 UGX/month)
                  </SelectItem>
                  <SelectItem value="medium">
                    Medium Income (200,000 - 1,000,000 UGX/month)
                  </SelectItem>
                  <SelectItem value="high">
                    High Income (&gt; 1,000,000 UGX/month)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Attendance Status */}
          <div className="space-y-4">
            <div className="mb-3 flex items-center gap-2">
              <Heart className="h-4 w-4 text-pink-600" />
              <h3 className="text-sm font-semibold">Attendance Status</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="attendance">Attendance Status</Label>
              <Select
                value={formData.attendance_status}
                onValueChange={value =>
                  handleInputChange("attendance_status", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select attendance status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="attended">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Attended
                      </Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="absent">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        Absent
                      </Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="pending">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        Pending
                      </Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || !formData.participantName.trim()}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
