"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Briefcase } from "lucide-react";
import { type Participant } from "../../types/types";

interface ContactInfoSectionProps {
  participant: Participant;
}

export function ContactInfoSection({ participant }: ContactInfoSectionProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Phone className="text-muted-foreground h-4 w-4" />
            <span className="font-mono">{participant.contact}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Professional Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Designation:</span>
            <Badge variant="outline">{participant.designation}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Enterprise:</span>
            <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
              {participant.enterprise}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Employment:</span>
            <Badge variant="secondary">{participant.employmentStatus}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
