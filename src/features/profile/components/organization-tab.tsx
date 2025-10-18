"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  IconEdit,
  IconCheck,
  IconX,
  IconBuilding,
  IconMail,
  IconPhone,
  IconMapPin,
  IconUsers,
  IconInfoCircle,
} from "@tabler/icons-react";

interface OrganizationTabProps {
  canEdit: boolean;
  _userRole: string;
}

export function OrganizationTab({ canEdit, _userRole }: OrganizationTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock organization data - replace with actual API call
  const [orgData, setOrgData] = useState({
    name: "CARITAS Uganda",
    email: "contact@caritas.ug",
    phone: "+256 414 251 002",
    address: "Plot 1027, Ggaba Road, Kansanga",
    website: "www.caritas.ug",
    description:
      "CARITAS Uganda is a Catholic humanitarian organization working to reduce poverty and promote development in Uganda.",
    established: "1962",
    registrationNumber: "NGO-REG-001",
    memberCount: 245,
    clustersCount: 12,
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement API call to update organization
      console.log("Updating organization:", orgData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating organization:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to original data
    setOrgData({
      name: "CARITAS Uganda",
      email: "contact@caritas.ug",
      phone: "+256 414 251 002",
      address: "Plot 1027, Ggaba Road, Kansanga",
      website: "www.caritas.ug",
      description:
        "CARITAS Uganda is a Catholic humanitarian organization working to reduce poverty and promote development in Uganda.",
      established: "1962",
      registrationNumber: "NGO-REG-001",
      memberCount: 245,
      clustersCount: 12,
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Organization Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
            <IconBuilding className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-semibold">{orgData.name}</h3>
            <p className="text-sm text-muted-foreground">
              Established {orgData.established}
            </p>
            <Badge variant="secondary">
              Reg. No: {orgData.registrationNumber}
            </Badge>
          </div>
        </div>

        {canEdit && (
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button size="sm" onClick={handleSave} disabled={isLoading}>
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
                Edit Organization
              </Button>
            )}
          </div>
        )}
      </div>

      {!canEdit && (
        <Alert>
          <IconInfoCircle className="h-4 w-4" />
          <AlertDescription>
            You can view organization details but cannot edit them. Contact your
            cluster manager to make changes.
          </AlertDescription>
        </Alert>
      )}

      <Separator />

      {/* Organization Details */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <Label htmlFor="org-name">Organization Name</Label>
            <div className="relative mt-1">
              <Input
                id="org-name"
                value={orgData.name}
                onChange={e => setOrgData({ ...orgData, name: e.target.value })}
                disabled={!isEditing}
              />
              <IconBuilding className="absolute top-3 right-3 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div>
            <Label htmlFor="org-email">Contact Email</Label>
            <div className="relative mt-1">
              <Input
                id="org-email"
                type="email"
                value={orgData.email}
                onChange={e =>
                  setOrgData({ ...orgData, email: e.target.value })
                }
                disabled={!isEditing}
              />
              <IconMail className="absolute top-3 right-3 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div>
            <Label htmlFor="org-phone">Phone Number</Label>
            <div className="relative mt-1">
              <Input
                id="org-phone"
                value={orgData.phone}
                onChange={e =>
                  setOrgData({ ...orgData, phone: e.target.value })
                }
                disabled={!isEditing}
              />
              <IconPhone className="absolute top-3 right-3 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div>
            <Label htmlFor="org-website">Website</Label>
            <Input
              id="org-website"
              value={orgData.website}
              onChange={e =>
                setOrgData({ ...orgData, website: e.target.value })
              }
              disabled={!isEditing}
              placeholder="www.example.com"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="org-address">Address</Label>
            <div className="relative mt-1">
              <Textarea
                id="org-address"
                value={orgData.address}
                onChange={e =>
                  setOrgData({ ...orgData, address: e.target.value })
                }
                disabled={!isEditing}
                rows={3}
              />
              <IconMapPin className="absolute top-3 right-3 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div>
            <Label htmlFor="org-description">Description</Label>
            <Textarea
              id="org-description"
              value={orgData.description}
              onChange={e =>
                setOrgData({ ...orgData, description: e.target.value })
              }
              disabled={!isEditing}
              rows={4}
              placeholder="Brief description of your organization..."
            />
          </div>
        </div>
      </div>

      {/* Organization Statistics */}
      <Separator />
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <IconUsers className="h-4 w-4" />
              Total Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{orgData.memberCount}</p>
            <p className="text-xs text-muted-foreground">Active members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <IconBuilding className="h-4 w-4" />
              Clusters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{orgData.clustersCount}</p>
            <p className="text-xs text-muted-foreground">Active clusters</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Established</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{orgData.established}</p>
            <p className="text-xs text-muted-foreground">
              {new Date().getFullYear() - parseInt(orgData.established)} years
              ago
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Active</p>
            <p className="text-xs text-muted-foreground">Good standing</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
