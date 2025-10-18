"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus, Calendar, MapPin, Users, DollarSign } from "lucide-react";
import { createActivityReport } from "@/features/activities/actions/activity-reports";
import { getActivitiesForReporting } from "../actions/reports";
import toast from "react-hot-toast";

interface CreateReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ActivityOption {
  id: string;
  title: string;
  type: string;
  status: string;
  start_date: Date | null;
  end_date: Date | null;
  venue: string | null;
  project_name: string | null;
  organization_name: string | null;
}

interface FollowUpAction {
  id: string;
  action: string;
  responsiblePerson: string;
  timeline: string;
}

export function CreateReportDialog({
  isOpen,
  onClose,
  onSuccess,
}: CreateReportDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activities, setActivities] = useState<ActivityOption[]>([]);
  const [followUpActions, setFollowUpActions] = useState<FollowUpAction[]>([]);

  const [formData, setFormData] = useState({
    activity_id: "",
    title: "",
    execution_date: "",
    cluster_name: "",
    venue: "",
    team_leader: "",
    background_purpose: "",
    progress_achievements: "",
    challenges_recommendations: "",
    lessons_learned: "",
    actual_cost: "",
    number_of_participants: "",
    created_by: "",
  });

  const [newFollowUp, setNewFollowUp] = useState({
    action: "",
    responsiblePerson: "",
    timeline: "",
  });

  useEffect(() => {
    if (isOpen) {
      loadActivities();
    }
  }, [isOpen]);

  const loadActivities = async () => {
    try {
      const result = await getActivitiesForReporting();
      if (result.success && result.data) {
        setActivities(result.data);
      }
    } catch (error) {
      console.error("Error loading activities:", error);
      toast.error("Failed to load activities");
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleActivitySelect = (activityId: string) => {
    const activity = activities.find(a => a.id === activityId);
    if (activity) {
      setFormData(prev => ({
        ...prev,
        activity_id: activityId,
        venue: activity.venue || "",
        execution_date: activity.start_date
          ? new Date(activity.start_date).toISOString().split("T")[0]
          : "",
      }));
    }
  };

  const addFollowUpAction = () => {
    if (
      newFollowUp.action &&
      newFollowUp.responsiblePerson &&
      newFollowUp.timeline
    ) {
      const action: FollowUpAction = {
        id: Date.now().toString(),
        ...newFollowUp,
      };
      setFollowUpActions(prev => [...prev, action]);
      setNewFollowUp({ action: "", responsiblePerson: "", timeline: "" });
    }
  };

  const removeFollowUpAction = (id: string) => {
    setFollowUpActions(prev => prev.filter(action => action.id !== id));
  };

  const handleSubmit = async () => {
    if (!formData.activity_id || !formData.title || !formData.execution_date) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      const followUpActionsArray = followUpActions.map(
        action =>
          `${action.action} - ${action.responsiblePerson} (${action.timeline})`
      );

      const reportData = {
        ...formData,
        execution_date: new Date(formData.execution_date),
        actual_cost: formData.actual_cost
          ? parseInt(formData.actual_cost)
          : null,
        number_of_participants: formData.number_of_participants
          ? parseInt(formData.number_of_participants)
          : null,
        follow_up_actions: followUpActionsArray,
      };

      const result = await createActivityReport(reportData);

      if (result.success) {
        toast.success("Report created successfully!");
        onSuccess();
        onClose();
        resetForm();
      } else {
        toast.error(result.error || "Failed to create report");
      }
    } catch (error) {
      console.error("Error creating report:", error);
      toast.error("Failed to create report");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      activity_id: "",
      title: "",
      execution_date: "",
      cluster_name: "",
      venue: "",
      team_leader: "",
      background_purpose: "",
      progress_achievements: "",
      challenges_recommendations: "",
      lessons_learned: "",
      actual_cost: "",
      number_of_participants: "",
      created_by: "",
    });
    setFollowUpActions([]);
    setNewFollowUp({ action: "", responsiblePerson: "", timeline: "" });
  };

  const selectedActivity = activities.find(a => a.id === formData.activity_id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Activity Report</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Activity Selection */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Activity *</Label>
              <Select
                value={formData.activity_id}
                onValueChange={handleActivitySelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an activity to report on" />
                </SelectTrigger>
                <SelectContent>
                  {activities.map(activity => (
                    <SelectItem key={activity.id} value={activity.id}>
                      <div className="flex flex-col">
                        <span>{activity.title}</span>
                        <span className="text-sm text-muted-foreground">
                          {activity.project_name} - {activity.type}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedActivity && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Activity Details</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {selectedActivity.start_date
                          ? new Date(
                              selectedActivity.start_date
                            ).toLocaleDateString()
                          : "No date set"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedActivity.venue || "No venue set"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <Separator />

          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Report Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={e => handleInputChange("title", e.target.value)}
                placeholder="Enter report title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="execution_date">Execution Date *</Label>
              <Input
                id="execution_date"
                type="date"
                value={formData.execution_date}
                onChange={e =>
                  handleInputChange("execution_date", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cluster_name">Cluster Name</Label>
              <Input
                id="cluster_name"
                value={formData.cluster_name}
                onChange={e =>
                  handleInputChange("cluster_name", e.target.value)
                }
                placeholder="Enter cluster name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team_leader">Team Leader</Label>
              <Input
                id="team_leader"
                value={formData.team_leader}
                onChange={e => handleInputChange("team_leader", e.target.value)}
                placeholder="Enter team leader name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="venue">Venue</Label>
              <Input
                id="venue"
                value={formData.venue}
                onChange={e => handleInputChange("venue", e.target.value)}
                placeholder="Enter venue"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="created_by">Report Created By</Label>
              <Input
                id="created_by"
                value={formData.created_by}
                onChange={e => handleInputChange("created_by", e.target.value)}
                placeholder="Enter your name"
              />
            </div>
          </div>

          <Separator />

          {/* Report Content */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="background_purpose">Background & Purpose</Label>
              <Textarea
                id="background_purpose"
                value={formData.background_purpose}
                onChange={e =>
                  handleInputChange("background_purpose", e.target.value)
                }
                placeholder="Describe the background and purpose of the activity"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="progress_achievements">
                Progress & Achievements
              </Label>
              <Textarea
                id="progress_achievements"
                value={formData.progress_achievements}
                onChange={e =>
                  handleInputChange("progress_achievements", e.target.value)
                }
                placeholder="Describe the progress made and achievements"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="challenges_recommendations">
                Challenges & Recommendations
              </Label>
              <Textarea
                id="challenges_recommendations"
                value={formData.challenges_recommendations}
                onChange={e =>
                  handleInputChange(
                    "challenges_recommendations",
                    e.target.value
                  )
                }
                placeholder="Describe challenges faced and recommendations"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lessons_learned">Lessons Learned</Label>
              <Textarea
                id="lessons_learned"
                value={formData.lessons_learned}
                onChange={e =>
                  handleInputChange("lessons_learned", e.target.value)
                }
                placeholder="Share key lessons learned from this activity"
                rows={3}
              />
            </div>
          </div>

          <Separator />

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="number_of_participants">
                Number of Participants
              </Label>
              <div className="relative">
                <Users className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="number_of_participants"
                  type="number"
                  value={formData.number_of_participants}
                  onChange={e =>
                    handleInputChange("number_of_participants", e.target.value)
                  }
                  placeholder="Enter number of participants"
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="actual_cost">Actual Cost (UGX)</Label>
              <div className="relative">
                <DollarSign className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="actual_cost"
                  type="number"
                  value={formData.actual_cost}
                  onChange={e =>
                    handleInputChange("actual_cost", e.target.value)
                  }
                  placeholder="Enter actual cost"
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Follow-up Actions */}
          <div className="space-y-4">
            <Label>Follow-up Actions</Label>

            {/* Add new follow-up action */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Add Follow-up Action</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    placeholder="Action description"
                    value={newFollowUp.action}
                    onChange={e =>
                      setNewFollowUp(prev => ({
                        ...prev,
                        action: e.target.value,
                      }))
                    }
                  />
                  <Input
                    placeholder="Responsible person"
                    value={newFollowUp.responsiblePerson}
                    onChange={e =>
                      setNewFollowUp(prev => ({
                        ...prev,
                        responsiblePerson: e.target.value,
                      }))
                    }
                  />
                  <div className="flex gap-2">
                    <Input
                      placeholder="Timeline"
                      value={newFollowUp.timeline}
                      onChange={e =>
                        setNewFollowUp(prev => ({
                          ...prev,
                          timeline: e.target.value,
                        }))
                      }
                    />
                    <Button
                      type="button"
                      onClick={addFollowUpAction}
                      size="sm"
                      disabled={
                        !newFollowUp.action ||
                        !newFollowUp.responsiblePerson ||
                        !newFollowUp.timeline
                      }
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Display follow-up actions */}
            {followUpActions.length > 0 && (
              <div className="space-y-2">
                {followUpActions.map(action => (
                  <Badge
                    key={action.id}
                    variant="secondary"
                    className="mr-2 mb-2"
                  >
                    {action.action} - {action.responsiblePerson} (
                    {action.timeline})
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-4 w-4 p-0"
                      onClick={() => removeFollowUpAction(action.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
