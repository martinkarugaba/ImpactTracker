"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileText, Users } from "lucide-react";
import { VSLA } from "../../types";
import { VSLABasicInfo } from "./vsla-basic-info";
import { VSLAFinancialOverview } from "./vsla-financial-overview";
import { VSLAAffiliations } from "./vsla-affiliations";
import { VSLALocationDetails } from "./vsla-location-details";
import { VSLAMeetingInfo } from "./vsla-meeting-info";
import { VSLAMembersManagement } from "../vsla-members-management/vsla-members-management";

interface VSLADetailsTabsProps {
  vsla: VSLA;
}

export function VSLADetailsTabs({ vsla }: VSLADetailsTabsProps) {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger
            value="details"
            className="flex items-center gap-2 data-[state=active]:text-blue-600"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Details</span>
          </TabsTrigger>
          <TabsTrigger
            value="members"
            className="flex items-center gap-2 data-[state=active]:text-green-600"
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Members</span>
          </TabsTrigger>
        </TabsList>

        {/* Details Tab Content */}
        <TabsContent value="details" className="mt-6">
          <div className="grid gap-6">
            {/* Basic Information Card */}
            <VSLABasicInfo vsla={vsla} />

            {/* Financial Overview Card */}
            <VSLAFinancialOverview vsla={vsla} />

            {/* Organization & Location Details */}
            <div className="grid gap-6 md:grid-cols-2">
              <VSLAAffiliations vsla={vsla} />
              <VSLALocationDetails vsla={vsla} />
            </div>

            {/* Meeting Information Card */}
            <VSLAMeetingInfo vsla={vsla} />
          </div>
        </TabsContent>

        {/* Members Tab Content */}
        <TabsContent value="members" className="mt-6">
          <VSLAMembersManagement vsla={vsla} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
