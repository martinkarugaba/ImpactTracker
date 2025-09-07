"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProfileTab } from "./profile-tab";
import { OrganizationTab } from "./organization-tab";
import { SettingsTab } from "./settings-tab";
import { SecurityTab } from "./security-tab";
import {
  IconUser,
  IconBuilding,
  IconSettings,
  IconShield,
} from "@tabler/icons-react";

export function ProfileContainer() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("profile");

  // Mock role data - replace with actual role fetching
  const userRole = session?.user?.role || "user"; // super_admin, cluster_manager, organization_admin, organization_member, user
  const isClusterManager = userRole === "cluster_manager";
  const isAdmin =
    userRole === "super_admin" || userRole === "organization_admin";

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "super_admin":
        return "destructive";
      case "cluster_manager":
        return "default";
      case "organization_admin":
        return "default";
      case "organization_member":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case "super_admin":
        return "Super Admin";
      case "cluster_manager":
        return "Cluster Manager";
      case "organization_admin":
        return "Organization Admin";
      case "organization_member":
        return "Organization Member";
      default:
        return "User";
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
          <p className="text-muted-foreground">
            Manage your account settings and organization details
          </p>
        </div>
        <Badge variant={getRoleBadgeVariant(userRole)}>
          {getRoleDisplay(userRole)}
        </Badge>
      </div>

      <Separator />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <IconUser className="h-4 w-4" />
            <span className="hidden sm:inline">Personal</span>
          </TabsTrigger>
          <TabsTrigger value="organization" className="flex items-center gap-2">
            <IconBuilding className="h-4 w-4" />
            <span className="hidden sm:inline">Organization</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <IconSettings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <IconShield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileTab canEdit={true} userRole={userRole} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organization">
          <Card>
            <CardHeader>
              <CardTitle>Organization Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <OrganizationTab
                canEdit={isClusterManager || isAdmin}
                _userRole={userRole}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Application Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <SettingsTab userRole={userRole} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security & Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <SecurityTab userRole={userRole} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
