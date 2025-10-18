"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  IconShield,
  IconKey,
  IconDeviceMobile,
  IconLock,
  IconHistory,
  IconAlertTriangle,
  IconCheck,
  IconX,
} from "@tabler/icons-react";

interface SecurityTabProps {
  userRole: string;
}

export function SecurityTab({ userRole: _userRole }: SecurityTabProps) {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [securitySettings, setSecuritySettings] = useState({
    loginAlerts: true,
    deviceTracking: true,
    sessionTimeout: "30",
  });

  // Mock security data
  const loginHistory = [
    {
      date: "2024-01-15 09:30",
      device: "Chrome on Windows",
      location: "Kampala, UG",
      status: "success",
    },
    {
      date: "2024-01-14 16:45",
      device: "Safari on iPhone",
      location: "Kampala, UG",
      status: "success",
    },
    {
      date: "2024-01-12 08:15",
      device: "Firefox on Mac",
      location: "Entebbe, UG",
      status: "success",
    },
    {
      date: "2024-01-10 11:20",
      device: "Chrome on Android",
      location: "Unknown",
      status: "blocked",
    },
  ];

  const activeSessions = [
    {
      id: 1,
      device: "Current Session - Chrome on Windows",
      location: "Kampala, UG",
      current: true,
    },
    {
      id: 2,
      device: "Safari on iPhone",
      location: "Kampala, UG",
      current: false,
    },
  ];

  const handlePasswordChange = async () => {
    if (passwordForm.new !== passwordForm.confirm) {
      alert("Passwords don't match");
      return;
    }

    // TODO: Implement password change API
    console.log("Changing password...");
    setIsChangingPassword(false);
    setPasswordForm({ current: "", new: "", confirm: "" });
  };

  const enableTwoFactor = () => {
    // TODO: Implement 2FA setup
    setTwoFactorEnabled(true);
  };

  const disableTwoFactor = () => {
    // TODO: Implement 2FA disable
    setTwoFactorEnabled(false);
  };

  const terminateSession = (sessionId: number) => {
    // TODO: Implement session termination
    console.log("Terminating session:", sessionId);
  };

  return (
    <div className="space-y-6">
      {/* Password Security */}
      <div className="space-y-4">
        <h4 className="flex items-center gap-2 text-sm font-medium">
          <IconLock className="h-4 w-4" />
          Password Security
        </h4>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {!isChangingPassword ? (
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Password</Label>
                    <p className="text-xs text-muted-foreground">
                      Last changed 3 months ago
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsChangingPassword(true)}
                  >
                    <IconKey className="mr-2 h-4 w-4" />
                    Change Password
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={passwordForm.current}
                      onChange={e =>
                        setPasswordForm({
                          ...passwordForm,
                          current: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={passwordForm.new}
                      onChange={e =>
                        setPasswordForm({
                          ...passwordForm,
                          new: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirm-password">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={passwordForm.confirm}
                      onChange={e =>
                        setPasswordForm({
                          ...passwordForm,
                          confirm: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handlePasswordChange}>
                      <IconCheck className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setIsChangingPassword(false);
                        setPasswordForm({ current: "", new: "", confirm: "" });
                      }}
                    >
                      <IconX className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Two-Factor Authentication */}
      <div className="space-y-4">
        <h4 className="flex items-center gap-2 text-sm font-medium">
          <IconDeviceMobile className="h-4 w-4" />
          Two-Factor Authentication
        </h4>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Label>2FA Status</Label>
                    <Badge variant={twoFactorEnabled ? "default" : "secondary"}>
                      {twoFactorEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                {twoFactorEnabled ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={disableTwoFactor}
                  >
                    <IconX className="mr-2 h-4 w-4" />
                    Disable
                  </Button>
                ) : (
                  <Button size="sm" onClick={enableTwoFactor}>
                    <IconShield className="mr-2 h-4 w-4" />
                    Enable 2FA
                  </Button>
                )}
              </div>

              {!twoFactorEnabled && (
                <Alert>
                  <IconAlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Two-factor authentication is disabled. We recommend enabling
                    it for better security.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Security Settings */}
      <div className="space-y-4">
        <h4 className="flex items-center gap-2 text-sm font-medium">
          <IconShield className="h-4 w-4" />
          Security Preferences
        </h4>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Login Alerts</Label>
                  <p className="text-xs text-muted-foreground">
                    Get notified of new login attempts
                  </p>
                </div>
                <Switch
                  checked={securitySettings.loginAlerts}
                  onCheckedChange={checked =>
                    setSecuritySettings(prev => ({
                      ...prev,
                      loginAlerts: checked,
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Device Tracking</Label>
                  <p className="text-xs text-muted-foreground">
                    Track devices that access your account
                  </p>
                </div>
                <Switch
                  checked={securitySettings.deviceTracking}
                  onCheckedChange={checked =>
                    setSecuritySettings(prev => ({
                      ...prev,
                      deviceTracking: checked,
                    }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Active Sessions */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Active Sessions</h4>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {activeSessions.map(session => (
                <div
                  key={session.id}
                  className="flex items-center justify-between py-2"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{session.device}</p>
                    <p className="text-xs text-muted-foreground">
                      {session.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {session.current && (
                      <Badge variant="secondary" className="text-xs">
                        Current
                      </Badge>
                    )}
                    {!session.current && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => terminateSession(session.id)}
                      >
                        Terminate
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Login History */}
      <div className="space-y-4">
        <h4 className="flex items-center gap-2 text-sm font-medium">
          <IconHistory className="h-4 w-4" />
          Recent Login Activity
        </h4>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {loginHistory.map((login, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2"
                >
                  <div className="space-y-1">
                    <p className="text-sm">{login.device}</p>
                    <p className="text-xs text-muted-foreground">
                      {login.date} • {login.location}
                    </p>
                  </div>
                  <Badge
                    variant={
                      login.status === "success" ? "default" : "destructive"
                    }
                    className="text-xs"
                  >
                    {login.status === "success" ? "Success" : "Blocked"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
