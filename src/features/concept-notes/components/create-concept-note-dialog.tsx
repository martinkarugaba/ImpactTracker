"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Loader2 } from "lucide-react";
import {
  createConceptNote,
  getActivitiesForConceptNotes,
  type ActivityOption,
} from "../actions/concept-notes";
import toast from "react-hot-toast";

interface CreateConceptNoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateConceptNoteDialog({
  isOpen,
  onClose,
  onSuccess,
}: CreateConceptNoteDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activities, setActivities] = useState<ActivityOption[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  const [formData, setFormData] = useState({
    activity_id: "",
    title: "",
    content: "",
    charge_code: "",
    activity_lead: "",
    submission_date: "",
    project_summary: "",
    methodology: "",
    requirements: "",
    participant_details: "",
    budget_notes: "",
  });

  const [budgetItems, setBudgetItems] = useState<string[]>([""]);

  useEffect(() => {
    if (isOpen) {
      loadActivities();
    }
  }, [isOpen]);

  const loadActivities = async () => {
    setLoadingActivities(true);
    try {
      const result = await getActivitiesForConceptNotes();
      if (result.success && result.data) {
        setActivities(result.data);
      } else {
        toast.error(result.error || "Failed to load activities");
      }
    } catch (error) {
      console.error("Error loading activities:", error);
      toast.error("Failed to load activities");
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const addBudgetItem = () => {
    setBudgetItems(prev => [...prev, ""]);
  };

  const updateBudgetItem = (index: number, value: string) => {
    setBudgetItems(prev => prev.map((item, i) => (i === index ? value : item)));
  };

  const removeBudgetItem = (index: number) => {
    setBudgetItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.activity_id || !formData.title || !formData.content) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      const result = await createConceptNote({
        ...formData,
        submission_date: formData.submission_date
          ? new Date(formData.submission_date)
          : undefined,
        budget_items: budgetItems.filter(item => item.trim() !== ""),
      });

      if (result.success) {
        toast.success("Concept note created successfully");
        onSuccess();
        handleClose();
      } else {
        toast.error(result.error || "Failed to create concept note");
      }
    } catch (error) {
      console.error("Error creating concept note:", error);
      toast.error("Failed to create concept note");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      activity_id: "",
      title: "",
      content: "",
      charge_code: "",
      activity_lead: "",
      submission_date: "",
      project_summary: "",
      methodology: "",
      requirements: "",
      participant_details: "",
      budget_notes: "",
    });
    setBudgetItems([""]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Concept Note</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>

            {/* Activity Selection */}
            <div className="space-y-2">
              <Label htmlFor="activity">Activity *</Label>
              <Select
                value={formData.activity_id}
                onValueChange={value => handleInputChange("activity_id", value)}
                disabled={loadingActivities}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      loadingActivities ? "Loading..." : "Select activity"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {activities.map(activity => (
                    <SelectItem key={activity.id} value={activity.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{activity.title}</span>
                        <span className="text-muted-foreground text-sm">
                          {activity.type} • {activity.projectName} •{" "}
                          {activity.organizationName}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={e => handleInputChange("title", e.target.value)}
                  placeholder="Concept note title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="charge_code">Charge Code</Label>
                <Input
                  id="charge_code"
                  value={formData.charge_code}
                  onChange={e =>
                    handleInputChange("charge_code", e.target.value)
                  }
                  placeholder="Project charge code"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="activity_lead">Activity Lead</Label>
                <Input
                  id="activity_lead"
                  value={formData.activity_lead}
                  onChange={e =>
                    handleInputChange("activity_lead", e.target.value)
                  }
                  placeholder="Name of activity lead"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="submission_date">Submission Date</Label>
                <Input
                  id="submission_date"
                  type="date"
                  value={formData.submission_date}
                  onChange={e =>
                    handleInputChange("submission_date", e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Content</h3>

            <div className="space-y-2">
              <Label htmlFor="content">Main Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={e => handleInputChange("content", e.target.value)}
                placeholder="Detailed concept note content..."
                rows={6}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project_summary">Project Summary</Label>
              <Textarea
                id="project_summary"
                value={formData.project_summary}
                onChange={e =>
                  handleInputChange("project_summary", e.target.value)
                }
                placeholder="Brief project summary..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="methodology">Methodology</Label>
              <Textarea
                id="methodology"
                value={formData.methodology}
                onChange={e => handleInputChange("methodology", e.target.value)}
                placeholder="Proposed methodology..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                value={formData.requirements}
                onChange={e =>
                  handleInputChange("requirements", e.target.value)
                }
                placeholder="Project requirements..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="participant_details">Participant Details</Label>
              <Textarea
                id="participant_details"
                value={formData.participant_details}
                onChange={e =>
                  handleInputChange("participant_details", e.target.value)
                }
                placeholder="Details about participants..."
                rows={3}
              />
            </div>
          </div>

          {/* Budget Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Budget Items</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addBudgetItem}
              >
                Add Item
              </Button>
            </div>

            <div className="space-y-2">
              {budgetItems.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={e => updateBudgetItem(index, e.target.value)}
                    placeholder={`Budget item ${index + 1}`}
                    className="flex-1"
                  />
                  {budgetItems.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeBudgetItem(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget_notes">Budget Notes</Label>
              <Textarea
                id="budget_notes"
                value={formData.budget_notes}
                onChange={e =>
                  handleInputChange("budget_notes", e.target.value)
                }
                placeholder="Additional budget notes..."
                rows={3}
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Concept Note
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
