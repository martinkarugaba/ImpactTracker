"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FixOrganizationsPage() {
  const [loading, setLoading] = useState(false);

  const handleTest = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="container mx-auto space-y-6 py-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Fix Organization Assignments
        </h1>
        <p className="text-muted-foreground mt-2">
          Update participant organization assignments based on their subcounty
          location.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Page</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleTest} disabled={loading}>
            {loading ? "Testing..." : "Test Button"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
