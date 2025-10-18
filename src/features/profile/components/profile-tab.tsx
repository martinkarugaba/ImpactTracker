"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  IconEdit,
  IconCheck,
  IconX,
  IconCamera,
  IconPhone,
  IconMail,
  IconMapPin,
  IconUser,
} from "@tabler/icons-react";

interface ProfileTabProps {
  canEdit: boolean;
  userRole: string;
}

export function ProfileTab({ canEdit, userRole }: ProfileTabProps) {
  const { data: session, update } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [_isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    phone: "",
    bio: "",
    location: "",
    title: "",
    department: "",
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement API call to update profile
      console.log("Updating profile:", formData);

      // Update session data
      await update({
        ...session,
        user: {
          ...session?.user,
          name: formData.name,
          email: formData.email,
        },
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: session?.user?.name || "",
      email: session?.user?.email || "",
      phone: "",
      bio: "",
      location: "",
      title: "",
      department: "",
    });
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Avatar className="h-20 w-20">
            <AvatarImage src={session?.user?.image || ""} />
            <AvatarFallback className="text-lg">
              {getInitials(session?.user?.name || "UN")}
            </AvatarFallback>
          </Avatar>
          {canEdit && (
            <Button
              size="sm"
              variant="secondary"
              className="absolute -right-2 -bottom-2 h-8 w-8 rounded-full p-0"
            >
              <IconCamera className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex-1 space-y-1">
          <h3 className="text-xl font-semibold">{session?.user?.name}</h3>
          <p className="text-sm text-muted-foreground">
            {session?.user?.email}
          </p>
          <Badge variant="outline" className="w-fit">
            {userRole === "cluster_manager"
              ? "Cluster Manager"
              : userRole === "admin"
                ? "System Admin"
                : "Cluster Member"}
          </Badge>
        </div>

        {canEdit && (
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button onClick={handleSave}>
                  <IconCheck className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancel}>
                  <IconX className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(true)}
              >
                <IconEdit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>
        )}
      </div>

      <Separator />

      {/* Profile Form */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <div className="relative mt-1">
              <Input
                id="name"
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                disabled={!isEditing}
              />
              <IconUser className="absolute top-3 right-3 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <div className="relative mt-1">
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={e =>
                  setFormData({ ...formData, email: e.target.value })
                }
                disabled={!isEditing}
              />
              <IconMail className="absolute top-3 right-3 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative mt-1">
              <Input
                id="phone"
                value={formData.phone}
                onChange={e =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                disabled={!isEditing}
                placeholder="+256 XXX XXX XXX"
              />
              <IconPhone className="absolute top-3 right-3 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <div className="relative mt-1">
              <Input
                id="location"
                value={formData.location}
                onChange={e =>
                  setFormData({ ...formData, location: e.target.value })
                }
                disabled={!isEditing}
                placeholder="City, Country"
              />
              <IconMapPin className="absolute top-3 right-3 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Job Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={e =>
                setFormData({ ...formData, title: e.target.value })
              }
              disabled={!isEditing}
              placeholder="Your role/position"
            />
          </div>

          <div>
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={formData.department}
              onChange={e =>
                setFormData({ ...formData, department: e.target.value })
              }
              disabled={!isEditing}
              placeholder="Your department"
            />
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={e => setFormData({ ...formData, bio: e.target.value })}
              disabled={!isEditing}
              placeholder="Tell us about yourself..."
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <Separator />
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Account Created
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Jan 2024</p>
            <p className="text-xs text-muted-foreground">Member since</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Last Login</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Today</p>
            <p className="text-xs text-muted-foreground">2 hours ago</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Activity Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Active</p>
            <p className="text-xs text-muted-foreground">Regular user</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
