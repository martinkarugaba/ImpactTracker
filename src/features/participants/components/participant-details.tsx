"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EditParticipantDialog } from "./edit-participant-dialog";
import {
  MapPin,
  Phone,
  Briefcase,
  Building2,
  FolderOpen,
  Calendar,
  Users,
  Home,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Camera,
  Upload,
} from "lucide-react";
import { getParticipant } from "../actions/get-participant";
import { type Participant } from "../types/types";
import toast from "react-hot-toast";

interface ParticipantDetailsProps {
  participantId: string;
  onBack?: () => void;
  showActions?: boolean;
  className?: string;
}

export function ParticipantDetails({
  participantId,
  onBack,
  showActions = true,
  className = "",
}: ParticipantDetailsProps) {
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  useEffect(() => {
    async function fetchParticipant() {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getParticipant(participantId);

        if (result.success && result.data) {
          setParticipant(result.data);
        } else {
          setError(result.error || "Failed to load participant details");
        }
      } catch (err) {
        setError("An unexpected error occurred");
        console.error("Error fetching participant:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (participantId) {
      fetchParticipant();
    }
  }, [participantId]);

  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setIsUploadingPhoto(true);

    try {
      // Convert to base64 for preview (in a real app, you'd upload to a server)
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
        toast.success("Photo uploaded successfully");
        setIsUploadingPhoto(false);
      };
      reader.onerror = () => {
        toast.error("Failed to upload photo");
        setIsUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    } catch (_error) {
      toast.error("Failed to upload photo");
      setIsUploadingPhoto(false);
    }
  };

  const removePhoto = () => {
    setProfilePhoto(null);
    toast.success("Photo removed successfully");
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-destructive" />
            <h3 className="text-lg font-semibold">Error Loading Participant</h3>
            <p className="mt-2 text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!participant) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <XCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Participant Not Found</h3>
            <p className="mt-2 text-muted-foreground">
              The participant you're looking for doesn't exist.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0]?.toUpperCase() || ""}${lastName?.[0]?.toUpperCase() || ""}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (
    status: string,
    type: "boolean" | "status" = "boolean"
  ) => {
    if (type === "boolean") {
      const isYes = status.toLowerCase() === "yes";
      return (
        <Badge
          variant={isYes ? "default" : "secondary"}
          className={
            isYes
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
          }
        >
          {isYes ? (
            <CheckCircle className="mr-1 h-3 w-3" />
          ) : (
            <XCircle className="mr-1 h-3 w-3" />
          )}
          {isYes ? "Yes" : "No"}
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="capitalize">
        {status}
      </Badge>
    );
  };

  const getGenderBadge = (sex: string) => {
    const isMale = sex.toLowerCase() === "male" || sex.toLowerCase() === "m";
    const isFemale =
      sex.toLowerCase() === "female" || sex.toLowerCase() === "f";

    if (isMale) {
      return (
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          Male
        </Badge>
      );
    }

    if (isFemale) {
      return (
        <Badge className="bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
          Female
        </Badge>
      );
    }

    return <Badge variant="outline">{sex}</Badge>;
  };

  const getAgeBadge = (age: number | null) => {
    if (age === null) {
      return (
        <Badge variant="outline" className="text-muted-foreground">
          Age Unknown
        </Badge>
      );
    }

    let className = "";

    if (age <= 35) {
      className =
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    } else if (age <= 50) {
      className =
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    } else {
      className =
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    }

    return (
      <Badge variant="secondary" className={className}>
        {age} years old
      </Badge>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Section with Profile Photo */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {onBack && (
                <Button variant="ghost" size="sm" onClick={onBack}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}

              {/* Profile Photo Section */}
              <div className="flex flex-col items-center gap-3">
                <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                  <AvatarImage
                    src={profilePhoto || undefined}
                    alt={`${participant.firstName} ${participant.lastName}`}
                  />
                  <AvatarFallback className="bg-primary/10 text-2xl font-semibold text-primary">
                    {getInitials(participant.firstName, participant.lastName)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Participant Info */}
              <div>
                <CardTitle className="text-2xl">
                  {participant.firstName} {participant.lastName}
                </CardTitle>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {getGenderBadge(participant.sex)}
                  {getAgeBadge(participant.age)}
                  {getStatusBadge(participant.isPWD)}
                </div>
              </div>
            </div>
            {showActions && (
              <EditParticipantDialog
                participant={participant}
                onSuccess={() => {
                  // Refetch participant data after successful edit
                  if (participantId) {
                    setIsLoading(true);
                    getParticipant(participantId).then(result => {
                      if (result.success && result.data) {
                        setParticipant(result.data);
                      }
                      setIsLoading(false);
                    });
                  }
                }}
              />
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Profile Photo Management Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Profile Photo Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h3 className="font-semibold">Update Profile Picture</h3>
                <p className="text-sm text-muted-foreground">
                  Upload a new profile photo for {participant.firstName}{" "}
                  {participant.lastName}. The photo will be displayed across the
                  system.
                </p>
              </div>

              {profilePhoto && (
                <div className="text-right">
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Photo Uploaded
                  </Badge>
                </div>
              )}
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                <Label htmlFor="photo-upload">
                  <Button
                    variant="outline"
                    disabled={isUploadingPhoto}
                    className="gap-2"
                    asChild
                  >
                    <div>
                      {isUploadingPhoto ? (
                        <LoadingSpinner className="h-4 w-4" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      {isUploadingPhoto ? "Uploading..." : "Choose New Photo"}
                    </div>
                  </Button>
                </Label>

                {profilePhoto && (
                  <Button
                    variant="ghost"
                    onClick={removePhoto}
                    className="gap-2 text-destructive hover:text-destructive"
                  >
                    <XCircle className="h-4 w-4" />
                    Remove Photo
                  </Button>
                )}
              </div>

              <div className="text-right text-xs text-muted-foreground">
                <div>Supported: JPG, PNG, GIF</div>
                <div>Max size: 5MB</div>
                <div>Recommended: 400x400px</div>
              </div>
            </div>

            <Input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact & Basic Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-1 bg-blue-500"></div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Phone className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/50">
                <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="font-mono text-lg font-semibold">
                {participant.contact}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-1 bg-amber-500"></div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
              <Briefcase className="h-5 w-5" />
              Professional Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Designation:</span>
              <span className="font-medium">{participant.designation}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Enterprise:</span>
              <span className="font-semibold text-amber-700 dark:text-amber-300">
                {participant.enterprise}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Employment:</span>
              <Badge variant="secondary">{participant.employmentStatus}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Location Information */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 left-0 h-full w-1 bg-green-500"></div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <MapPin className="h-5 w-5" />
            Location Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <span className="text-sm text-muted-foreground">Country</span>
              <div className="mt-1">
                <span className="font-semibold text-green-700 dark:text-green-300">
                  {participant.country}
                </span>
              </div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">District</span>
              <p className="mt-1 text-lg font-semibold">
                {participant.district}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Sub County</span>
              <p className="mt-1 font-medium">{participant.subCounty}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Parish</span>
              <p className="mt-1 text-muted-foreground">{participant.parish}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Village</span>
              <p className="mt-1 text-muted-foreground">
                {participant.village}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organization & Project Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-1 bg-purple-500"></div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
              <Building2 className="h-5 w-5" />
              Organization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-base font-bold text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                {participant.organizationName
                  ?.split(" ")
                  .map(word => word[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 3) || "ORG"}
              </div>
              <div>
                <p className="text-lg font-semibold">
                  {participant.organizationName || "Unknown Organization"}
                </p>
                <p className="text-sm text-muted-foreground">Organization</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-1 bg-emerald-500"></div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
              <FolderOpen className="h-5 w-5" />
              Project & Cluster
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-sm text-muted-foreground">Project</span>
              <div className="mt-1">
                <span className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">
                  {participant.projectName || "Unknown Project"}
                </span>
              </div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Cluster</span>
              <p className="mt-1 font-medium">
                {participant.clusterName || "Unknown Cluster"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Personal & Social Information */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-1 bg-indigo-500"></div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
              <Users className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                Person with Disability:
              </span>
              {getStatusBadge(participant.isPWD)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Is Mother:</span>
              {getStatusBadge(participant.isMother)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Is Refugee:</span>
              {getStatusBadge(participant.isRefugee)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Permanent Resident:</span>
              {getStatusBadge(participant.isPermanentResident)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Parents Alive:</span>
              {getStatusBadge(participant.areParentsAlive)}
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-1 bg-rose-500"></div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-rose-700 dark:text-rose-300">
              <Home className="h-5 w-5" />
              Family & Financial
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Number of Children:</span>
              <span className="text-lg font-semibold">
                {participant.numberOfChildren}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Monthly Income:</span>
              <span className="text-lg font-semibold text-rose-600 dark:text-rose-400">
                {formatCurrency(participant.monthlyIncome)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Trainings Attended:</span>
              <Badge variant="secondary">{participant.noOfTrainings}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Challenges & Interests */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 left-0 h-full w-1 bg-orange-500"></div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
            <Target className="h-5 w-5" />
            Challenges & Interests
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {participant.mainChallenge && (
            <div>
              <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                Main Challenge
              </h4>
              <p className="rounded-md bg-muted p-3 text-sm">
                {participant.mainChallenge}
              </p>
            </div>
          )}

          {participant.skillOfInterest && (
            <div>
              <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                Skill of Interest
              </h4>
              <p className="rounded-md bg-muted p-3 text-sm">
                {participant.skillOfInterest}
              </p>
            </div>
          )}

          {participant.expectedImpact && (
            <div>
              <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                Expected Impact
              </h4>
              <p className="rounded-md bg-muted p-3 text-sm">
                {participant.expectedImpact}
              </p>
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              Willing to Participate:
            </span>
            {getStatusBadge(participant.isWillingToParticipate)}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status:</span>
            {getStatusBadge(participant.isActive, "status")}
          </div>
        </CardContent>
      </Card>

      {/* Timestamps */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 left-0 h-full w-1 bg-slate-400"></div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Calendar className="h-5 w-5" />
            Record Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <span className="text-sm text-muted-foreground">Created</span>
              <p className="mt-1 font-medium">
                {participant.created_at
                  ? new Date(participant.created_at).toLocaleDateString()
                  : "Unknown"}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">
                Last Updated
              </span>
              <p className="mt-1 font-medium">
                {participant.updated_at
                  ? new Date(participant.updated_at).toLocaleDateString()
                  : "Unknown"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
