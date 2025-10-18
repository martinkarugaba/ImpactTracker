import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AssignmentLevel } from "../../advanced-assignment/types";

interface AssignmentLevelTabsProps {
  currentLevel: AssignmentLevel;
  onLevelChange: (level: AssignmentLevel) => void;
  children: React.ReactNode;
}

export function AssignmentLevelTabs({
  currentLevel,
  onLevelChange,
  children,
}: AssignmentLevelTabsProps) {
  return (
    <div className="w-full space-y-2">
      <div className="text-sm text-muted-foreground">
        Choose assignment method (subcounty-based OR parish-based):
      </div>
      <Tabs
        value={currentLevel}
        onValueChange={value => onLevelChange(value as AssignmentLevel)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="subcounty">
            <div className="text-center">
              <div className="font-medium">By Subcounty</div>
              <div className="text-xs opacity-75">Direct assignment</div>
            </div>
          </TabsTrigger>
          <TabsTrigger value="parish">
            <div className="text-center">
              <div className="font-medium">By Parish</div>
              <div className="text-xs opacity-75">Parish → Subcounty</div>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subcounty" className="mt-4">
          <div className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
            <strong>Subcounty Assignment:</strong> Participants from selected
            subcounties will be assigned to this organization.
          </div>
          {children}
        </TabsContent>

        <TabsContent value="parish" className="mt-4">
          <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-200">
            <strong>Parish Assignment:</strong> Participants from selected
            parishes will be assigned to this organization. Results will show
            the subcounties that contain these parishes.
          </div>
          {children}
        </TabsContent>
      </Tabs>
    </div>
  );
}
