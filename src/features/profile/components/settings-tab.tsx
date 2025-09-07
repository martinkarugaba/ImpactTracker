"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  IconBell,
  IconMail,
  IconDeviceMobile,
  IconEye,
  IconShield,
  IconLanguage,
  IconPalette,
  IconDownload,
  IconTrash,
} from "@tabler/icons-react";
import { useTheme } from "next-themes";

interface SettingsTabProps {
  userRole: string;
}

export function SettingsTab({ userRole }: SettingsTabProps) {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    dataSharing: false,
    profileVisibility: "organization",
    language: "english",
    timezone: "africa/kampala",
    autoSave: true,
    twoFactorAuth: false,
  });

  const handleSettingChange = (key: string, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const exportData = () => {
    // TODO: Implement data export
    console.log("Exporting user data...");
  };

  const deleteAccount = () => {
    // TODO: Implement account deletion with proper confirmation
    console.log("Initiating account deletion...");
  };

  return (
    <div className="space-y-6">
      {/* Theme Settings */}
      <div className="space-y-4">
        <h4 className="flex items-center gap-2 text-sm font-medium">
          <IconPalette className="h-4 w-4" />
          Appearance
        </h4>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Theme</Label>
                <p className="text-muted-foreground text-xs">
                  Choose your preferred color scheme
                </p>
              </div>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Notification Settings */}
      <div className="space-y-4">
        <h4 className="flex items-center gap-2 text-sm font-medium">
          <IconBell className="h-4 w-4" />
          Notifications
        </h4>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <IconMail className="text-muted-foreground h-4 w-4" />
                    <Label>Email Notifications</Label>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={checked =>
                    handleSettingChange("emailNotifications", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <IconBell className="text-muted-foreground h-4 w-4" />
                    <Label>Push Notifications</Label>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Receive browser push notifications
                  </p>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={checked =>
                    handleSettingChange("pushNotifications", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <IconDeviceMobile className="text-muted-foreground h-4 w-4" />
                    <Label>SMS Notifications</Label>
                    <Badge variant="secondary" className="text-xs">
                      Premium
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Receive important updates via SMS
                  </p>
                </div>
                <Switch
                  checked={settings.smsNotifications}
                  onCheckedChange={checked =>
                    handleSettingChange("smsNotifications", checked)
                  }
                  disabled={
                    userRole !== "cluster_manager" && userRole !== "admin"
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Marketing Emails</Label>
                  <p className="text-muted-foreground text-xs">
                    Receive updates about new features
                  </p>
                </div>
                <Switch
                  checked={settings.marketingEmails}
                  onCheckedChange={checked =>
                    handleSettingChange("marketingEmails", checked)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Privacy Settings */}
      <div className="space-y-4">
        <h4 className="flex items-center gap-2 text-sm font-medium">
          <IconShield className="h-4 w-4" />
          Privacy
        </h4>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <IconEye className="text-muted-foreground h-4 w-4" />
                    <Label>Profile Visibility</Label>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Who can see your profile information
                  </p>
                </div>
                <Select
                  value={settings.profileVisibility}
                  onValueChange={value =>
                    handleSettingChange("profileVisibility", value)
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Everyone</SelectItem>
                    <SelectItem value="organization">Organization</SelectItem>
                    <SelectItem value="cluster">Cluster Only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Data Sharing</Label>
                  <p className="text-muted-foreground text-xs">
                    Allow anonymous analytics data sharing
                  </p>
                </div>
                <Switch
                  checked={settings.dataSharing}
                  onCheckedChange={checked =>
                    handleSettingChange("dataSharing", checked)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Regional Settings */}
      <div className="space-y-4">
        <h4 className="flex items-center gap-2 text-sm font-medium">
          <IconLanguage className="h-4 w-4" />
          Regional
        </h4>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Language</Label>
                  <p className="text-muted-foreground text-xs">
                    Interface language
                  </p>
                </div>
                <Select
                  value={settings.language}
                  onValueChange={value =>
                    handleSettingChange("language", value)
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="luganda">Luganda</SelectItem>
                    <SelectItem value="swahili">Swahili</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Timezone</Label>
                  <p className="text-muted-foreground text-xs">
                    Your local timezone
                  </p>
                </div>
                <Select
                  value={settings.timezone}
                  onValueChange={value =>
                    handleSettingChange("timezone", value)
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="africa/kampala">
                      Kampala (EAT)
                    </SelectItem>
                    <SelectItem value="africa/nairobi">
                      Nairobi (EAT)
                    </SelectItem>
                    <SelectItem value="utc">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Auto-save</Label>
                  <p className="text-muted-foreground text-xs">
                    Automatically save form changes
                  </p>
                </div>
                <Switch
                  checked={settings.autoSave}
                  onCheckedChange={checked =>
                    handleSettingChange("autoSave", checked)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Data Management */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Data Management</h4>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Export Data</Label>
                  <p className="text-muted-foreground text-xs">
                    Download a copy of your data
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={exportData}>
                  <IconDownload className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-destructive">Delete Account</Label>
                  <p className="text-muted-foreground text-xs">
                    Permanently delete your account and data
                  </p>
                </div>
                <Button variant="destructive" size="sm" onClick={deleteAccount}>
                  <IconTrash className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
