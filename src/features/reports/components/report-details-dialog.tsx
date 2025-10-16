"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  User,
  FileText,
  Target,
  Lightbulb,
  AlertTriangle,
  CheckSquare,
} from "lucide-react";
import { type ReportWithDetails } from "../actions/reports";

interface ReportDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  report: ReportWithDetails | null;
}

export function ReportDetailsDialog({
  isOpen,
  onClose,
  report,
}: ReportDetailsDialogProps) {
  if (!report) return null;

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "Not specified";
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getActivityTypeBadge = (type: string | undefined) => {
    if (!type) return null;

    const typeConfig = {
      meeting: { label: "Meeting", className: "bg-blue-100 text-blue-800" },
      workshop: { label: "Workshop", className: "bg-green-100 text-green-800" },
      training: {
        label: "Training",
        className: "bg-purple-100 text-purple-800",
      },
      field_visit: {
        label: "Field Visit",
        className: "bg-orange-100 text-orange-800",
      },
      conference: { label: "Conference", className: "bg-red-100 text-red-800" },
      seminar: { label: "Seminar", className: "bg-yellow-100 text-yellow-800" },
      consultation: {
        label: "Consultation",
        className: "bg-indigo-100 text-indigo-800",
      },
      assessment: {
        label: "Assessment",
        className: "bg-pink-100 text-pink-800",
      },
      monitoring: {
        label: "Monitoring",
        className: "bg-teal-100 text-teal-800",
      },
      evaluation: {
        label: "Evaluation",
        className: "bg-cyan-100 text-cyan-800",
      },
      community_engagement: {
        label: "Community",
        className: "bg-lime-100 text-lime-800",
      },
      capacity_building: {
        label: "Capacity",
        className: "bg-emerald-100 text-emerald-800",
      },
      advocacy: { label: "Advocacy", className: "bg-rose-100 text-rose-800" },
      research: {
        label: "Research",
        className: "bg-violet-100 text-violet-800",
      },
      other: { label: "Other", className: "bg-gray-100 text-gray-800" },
    };

    const config =
      typeConfig[type as keyof typeof typeConfig] || typeConfig.other;
    return (
      <Badge variant="secondary" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {report.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Information */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  Activity Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm font-medium">Activity:</span>
                  <p className="text-sm text-muted-foreground">
                    {report.activity_title}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium">Type:</span>
                  <div className="mt-1">
                    {getActivityTypeBadge(report.activity_type)}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium">Project:</span>
                  <p className="text-sm text-muted-foreground">
                    {report.project_name || "Not specified"}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium">Organization:</span>
                  <p className="text-sm text-muted-foreground">
                    {report.organization_name || "Not specified"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4" />
                  Event Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm font-medium">Date:</span>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(report.execution_date)}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium">Venue:</span>
                  <p className="text-sm text-muted-foreground">
                    {report.venue}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium">Cluster:</span>
                  <p className="text-sm text-muted-foreground">
                    {report.cluster_name}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium">Team Leader:</span>
                  <p className="text-sm text-muted-foreground">
                    {report.team_leader}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="flex items-center p-6">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Participants
                  </p>
                  <p className="text-2xl font-bold">
                    {report.number_of_participants || "Not specified"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Actual Cost
                  </p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(report.actual_cost)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Report Content */}
          <div className="space-y-6">
            {/* Background & Purpose */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Target className="h-4 w-4" />
                  Background & Purpose
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">
                  {report.background_purpose}
                </p>
              </CardContent>
            </Card>

            {/* Progress & Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <CheckSquare className="h-4 w-4" />
                  Progress & Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">
                  {report.progress_achievements}
                </p>
              </CardContent>
            </Card>

            {/* Challenges & Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  Challenges & Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">
                  {report.challenges_recommendations}
                </p>
              </CardContent>
            </Card>

            {/* Lessons Learned */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Lightbulb className="h-4 w-4" />
                  Lessons Learned
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">
                  {report.lessons_learned}
                </p>
              </CardContent>
            </Card>

            {/* Follow-up Actions */}
            {report.follow_up_actions &&
              report.follow_up_actions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <CheckSquare className="h-4 w-4" />
                      Follow-up Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {report.follow_up_actions.map((action, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="mt-1.5 h-2 w-2 rounded-full bg-primary" />
                          <p className="text-sm leading-relaxed">{action}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
          </div>

          <Separator />

          {/* Report Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                Report Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <span className="text-sm font-medium">Created by:</span>
                <p className="text-sm text-muted-foreground">
                  {report.created_by}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium">Created on:</span>
                <p className="text-sm text-muted-foreground">
                  {report.created_at
                    ? formatDate(report.created_at)
                    : "Not available"}
                </p>
              </div>
              {report.updated_at && (
                <div>
                  <span className="text-sm font-medium">Last updated:</span>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(report.updated_at)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
